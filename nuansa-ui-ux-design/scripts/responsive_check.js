#!/usr/bin/env node
/**
 * responsive_check.js — screenshot pages at several widths and detect layout breakage.
 *
 * Usage:
 *   node responsive_check.js --url http://localhost:8000 --paths / /login /admin/users
 *   node responsive_check.js --url file:///abs/path/index.html
 *   node responsive_check.js --url http://localhost:3000 --paths /admin --widths 360,768,1280 --out ./ui-check
 *
 * Options:
 *   --url <base>         Base URL (http(s):// or file://). Required.
 *   --paths <p...>       Paths joined to the base URL (default: just the base URL).
 *   --widths <list>      Comma-separated viewport widths (default: 375,768,1280,1440).
 *   --height <px>        Viewport height (default: 900).
 *   --out <dir>          Output dir for screenshots + report.json (default: ./responsive-report).
 *   --wait <ms>          Extra wait after load, for animations/data (default: 500).
 *   --cookie <k=v>       Cookie to set (repeatable), e.g. to stay logged in.
 *   --storage <file>     Playwright storageState JSON (logged-in session).
 *   --no-full-page       Viewport-only screenshots.
 *   --no-text            Report the text budget as info only (for content-heavy pages).
 *   --no-a11y            Skip the axe-core accessibility audit.
 *   --no-perf            Skip performance metrics.
 *   --slow               Throttle CPU/network for the performance pass.
 *   --stress             Add a stress-test pass per width (long text, big numbers).
 *
 * Detects, per page and width:
 *   - horizontal page overflow (document wider than viewport) and the elements causing it
 *   - overlapping interactive elements (buttons/links/inputs covering each other)
 *   - clipped text (overflow hidden without ellipsis)
 *   - touch targets smaller than 32px on widths <= 480
 *   - near-miss alignment on widths >= 1024 (edges 2–6px off a shared alignment line)
 *   - text budget: words in the first viewport (> 80 on phones = too wordy; aim ≤ 60), paragraphs over
 *     30 words, buttons over 3 words, headings over 10 words. Long-form content inside
 *     <article>, [data-long-text], .prose, tables or code is exempt. Disable with --no-text.
 *   - accessibility (WCAG 2.2 A/AA via axe-core, at the smallest and largest width): contrast, missing labels/alt,
 *     heading order, ARIA misuse, focusable hidden elements… Needs `npm i -D axe-core`
 *     (looked up from the project, the script folder, or global modules); skipped with a
 *     hint if missing. Disable with --no-a11y.
 *   - performance (once per page, at the first width): LCP, CLS, total blocking time,
 *     page weight by type, oversized/unsized/eager offscreen images, web fonts.
 *     Add --slow to emulate a mid-range phone on 4G (4× CPU, ~1.6 Mbps). Disable with --no-perf.
 *   - number formatting: malformed digit grouping ("45,6370"-style groups, "637,73.83", "05k") is an
 *     issue; English/Indonesian grouping mismatched with <html lang> and big unformatted numbers
 *     are info. Mark exceptions with data-no-number-check.
 *   - stress test (--stress): doubles every text, inserts long unbroken words and huge
 *     numbers, fills inputs, then re-checks overflow/overlap/clipping and saves *-stress.png.
 *     Real content is longer than mock content; this finds what breaks.
 *   - native alert/confirm/prompt dialogs fired during load (auto-dismissed)
 *   - uncaught page errors
 * Exit code 1 when any issue is found.
 */
const fs = require('fs');
const path = require('path');

let chromium;
try {
  ({ chromium } = require('playwright'));
} catch (e) {
  console.error('Playwright not found. Install with `npm i -D playwright && npx playwright install chromium`.');
  process.exit(2);
}

function parseArgs(argv) {
  const a = { paths: [], widths: [375, 768, 1280, 1440], height: 900, out: 'responsive-report', wait: 500, cookies: [], fullPage: true, text: true, a11y: true, perf: true, slow: false, stress: false };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    const next = () => argv[++i];
    if (k === '--url') a.url = next();
    else if (k === '--paths') { while (argv[i + 1] && !argv[i + 1].startsWith('--')) a.paths.push(next()); }
    else if (k === '--widths') a.widths = next().split(',').map(Number).filter(Boolean);
    else if (k === '--height') a.height = Number(next());
    else if (k === '--out') a.out = next();
    else if (k === '--wait') a.wait = Number(next());
    else if (k === '--cookie') a.cookies.push(next());
    else if (k === '--storage') a.storage = next();
    else if (k === '--no-full-page') a.fullPage = false;
    else if (k === '--no-text') a.text = false;
    else if (k === '--no-a11y') a.a11y = false;
    else if (k === '--no-perf') a.perf = false;
    else if (k === '--slow') a.slow = true;
    else if (k === '--stress') a.stress = true;
    else if (k === '--help' || k === '-h') a.help = true;
  }
  return a;
}

function findAxe() {
  const bases = [process.cwd(), __dirname, path.join(__dirname, '..'), ...(process.env.NODE_PATH || '').split(path.delimiter).filter(Boolean)];
  for (const b of bases) {
    try { return require.resolve('axe-core/axe.min.js', { paths: [b] }); } catch (e) { /* try next */ }
  }
  return null;
}

// Installed before navigation so buffered metrics are captured from the first paint.
function perfInit() {
  window.__perf = { lcp: 0, cls: 0, tbt: 0, longTasks: 0 };
  try {
    new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__perf.lcp = Math.max(window.__perf.lcp, e.renderTime || e.loadTime || e.startTime); }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__perf.cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) { window.__perf.longTasks++; window.__perf.tbt += Math.max(0, e.duration - 50); } }).observe({ type: 'longtask', buffered: true });
  } catch (e) { /* older engines */ }
}

function collectPerf() {
  const nav = performance.getEntriesByType('navigation')[0] || {};
  const res = performance.getEntriesByType('resource');
  const byType = {};
  let total = nav.transferSize || 0;
  for (const r of res) {
    const t = r.initiatorType === 'link' && /\.css(\?|$)/.test(r.name) ? 'css' : r.initiatorType === 'img' || /\.(png|jpe?g|gif|webp|avif|svg)(\?|$)/i.test(r.name) ? 'img' : /\.(woff2?|ttf|otf)(\?|$)/i.test(r.name) ? 'font' : r.initiatorType === 'script' ? 'js' : 'other';
    byType[t] = (byType[t] || 0) + (r.transferSize || r.encodedBodySize || 0);
    total += r.transferSize || r.encodedBodySize || 0;
  }
  const vh = window.innerHeight;
  const imgs = [...document.images].filter((i) => i.complete && i.naturalWidth > 0);
  const oversized = [], unsized = [], eagerOffscreen = [];
  for (const i of imgs) {
    const r = i.getBoundingClientRect();
    const src = (i.currentSrc || i.src).split('/').pop().slice(0, 50);
    if (r.width > 0 && i.naturalWidth > r.width * devicePixelRatio * 2 && i.naturalWidth > 400) oversized.push(`${src} (${i.naturalWidth}px shown at ${Math.round(r.width)}px)`);
    if (!i.getAttribute('width') && !i.getAttribute('height') && !getComputedStyle(i).aspectRatio.includes('/') && getComputedStyle(i).height === 'auto') unsized.push(src);
    if (r.top > vh * 1.5 && i.loading !== 'lazy') eagerOffscreen.push(src);
  }
  const fonts = [...new Set([...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family.replace(/["']/g, '')} ${f.weight}`))];
  return {
    ttfb: Math.round(nav.responseStart || 0), domContentLoaded: Math.round(nav.domContentLoadedEventEnd || 0), load: Math.round(nav.loadEventEnd || 0),
    lcp: Math.round(window.__perf ? window.__perf.lcp : 0), cls: Number((window.__perf ? window.__perf.cls : 0).toFixed(3)), tbt: Math.round(window.__perf ? window.__perf.tbt : 0),
    requests: res.length + 1, totalKB: Math.round(total / 1024), byTypeKB: Object.fromEntries(Object.entries(byType).map(([k, v]) => [k, Math.round(v / 1024)])),
    oversizedImages: oversized.slice(0, 10), unsizedImages: unsized.slice(0, 10), eagerOffscreenImages: eagerOffscreen.slice(0, 10), webFonts: fonts,
  };
}

// Replace content with realistic worst cases: longer labels, unbroken tokens, huge numbers.
function stressify() {
  const LONG = 'Pengembangan_Infrastruktur_Digital@perusahaan-contoh-panjang.co.id';
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  for (let t = walker.nextNode(); t; t = walker.nextNode()) nodes.push(t);
  let n = 0;
  for (const t of nodes) {
    const p = t.parentElement;
    if (!p || /^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|OPTION|TITLE)$/.test(p.tagName) || !t.textContent.trim()) continue;
    if (p.closest('svg')) continue; // chart/icon labels are generated by formatters, not user content
    if (++n > 800) break;
    const s = t.textContent;
    if (/\d/.test(s) && /^[\s\d.,:%+\-\/Rp$€£¥kKmMjtJT]*$/.test(s)) { t.textContent = s.replace(/\d[\d.,]*/g, '9.999.999.999'); continue; }
    const words = s.trim().split(/\s+/).length;
    t.textContent = words <= 4 ? `${s} ${s.trim()}${n % 4 === 0 ? ' ' + LONG : ''}` : `${s} ${s.trim()}`;
  }
  document.querySelectorAll('input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=file]):not([type=number]):not([type=date]), textarea').forEach((i) => { try { i.value = `${LONG} ${LONG}`; } catch (e) { /* ignore */ } });
  return n;
}

function slug(s) {
  return (s.replace(/^[a-z]+:\/\/[^/]*/i, '').split('/').filter(Boolean).slice(-2).join('-').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'home').slice(0, 60);
}

// Runs inside the page.
function inspect() {
  const vw = document.documentElement.clientWidth;
  const out = { overflowPx: 0, overflowing: [], overlaps: [], clipped: [], smallTargets: [] };
  const describe = (el) => {
    let s = el.tagName.toLowerCase();
    if (el.id) s += '#' + el.id;
    if (el.classList && el.classList.length) s += '.' + [...el.classList].slice(0, 3).join('.');
    const t = (el.innerText || el.value || el.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 40);
    return t ? `${s} "${t}"` : s;
  };
  const visible = (el) => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width > 1 && r.height > 1;
  };
  const clippedByAncestor = (el) => {
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const ox = getComputedStyle(p).overflowX;
      if (ox === 'auto' || ox === 'scroll' || ox === 'hidden' || ox === 'clip') return true;
    }
    return false;
  };

  out.overflowPx = Math.max(0, document.documentElement.scrollWidth - vw);

  // Elements sticking out of the viewport horizontally (outermost only).
  const all = [...document.body.querySelectorAll('*')];
  const offenders = new Set();
  for (const el of all) {
    if (!visible(el)) continue;
    const r = el.getBoundingClientRect();
    if ((r.right > vw + 1 || r.left < -1) && !clippedByAncestor(el)) {
      const pos = getComputedStyle(el).position;
      if (pos === 'fixed' && (r.left >= vw || r.right <= 0)) continue; // off-canvas drawers
      offenders.add(el);
    }
  }
  for (const el of offenders) {
    let p = el.parentElement, nested = false;
    while (p) { if (offenders.has(p)) { nested = true; break; } p = p.parentElement; }
    if (!nested) {
      const r = el.getBoundingClientRect();
      out.overflowing.push({ el: describe(el), left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width) });
    }
  }

  // Overlapping interactive elements.
  const interactive = [...document.querySelectorAll('a[href], button, input:not([type=hidden]), select, textarea, [role=button], [role=tab], [role=menuitem]')]
    .filter(visible).slice(0, 400);
  const rects = interactive.map((el) => el.getBoundingClientRect());
  for (let i = 0; i < interactive.length; i++) {
    for (let j = i + 1; j < interactive.length; j++) {
      const a = interactive[i], b = interactive[j];
      if (a.contains(b) || b.contains(a)) continue;
      const ra = rects[i], rb = rects[j];
      const w = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
      const h = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
      if (w > 2 && h > 2 && w * h > 16) {
        // Ignore if one is fully hidden behind the other by design (e.g. visually-hidden input under a styled label).
        const topEl = document.elementFromPoint(Math.max(ra.left, rb.left) + w / 2, Math.max(ra.top, rb.top) + h / 2);
        if (topEl && (topEl === a || topEl === b || a.contains(topEl) || b.contains(topEl))) {
          out.overlaps.push({ a: describe(a), b: describe(b), area: Math.round(w * h) });
        }
      }
    }
  }

  // Clipped text (overflow hidden, no ellipsis, content wider/taller than box).
  for (const el of all) {
    if (!visible(el)) continue;
    const cs = getComputedStyle(el);
    const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (!hasText) continue;
    const hidesX = cs.overflowX === 'hidden' || cs.overflowX === 'clip';
    const hidesY = cs.overflowY === 'hidden' || cs.overflowY === 'clip';
    const clipX = hidesX && el.scrollWidth > el.clientWidth + 1 && cs.textOverflow !== 'ellipsis';
    const clipY = hidesY && el.scrollHeight > el.clientHeight + 2 && !cs.webkitLineClamp?.match(/^\d/);
    const box = el.getBoundingClientRect();
    if ((clipX || clipY) && !(box.width <= 64 && box.height <= 64)) out.clipped.push({ el: describe(el), axis: clipX ? 'x' : 'y' }); // ≤64px boxes = avatars/initials/icons, clipping is intended
  }

  // Small touch targets on phones (inline links inside text are exempt).
  if (vw <= 480) {
    for (const el of interactive) {
      if (el.tagName === 'A' && el.closest('p, li, td, span') && getComputedStyle(el).display === 'inline') continue;
      const r = el.getBoundingClientRect();
      if (r.width < 32 || r.height < 32) out.smallTargets.push({ el: describe(el), w: Math.round(r.width), h: Math.round(r.height) });
    }
  }
  // Near-miss alignment (desktop widths): edges 1–6px away from a shared alignment line look like mistakes.
  out.misaligned = [];
  if (vw >= 1024) {
    const cands = [...document.querySelectorAll('h1, h2, h3, h4, p, img, video, button, a, input, select, textarea, li, article, section > div, [class*="card"]')]
      .filter((el) => {
        if (!visible(el)) return false;
        const cs = getComputedStyle(el);
        if (cs.position === 'fixed' || cs.position === 'absolute') return false;
        if (/^(H\d|P|LI)$/.test(el.tagName) && (cs.textAlign === 'center' || cs.textAlign === 'right')) return false;
        if (el.tagName === 'A' && cs.display === 'inline') return false;
        const r = el.getBoundingClientRect();
        return r.width >= 40 && r.width < vw - 2 && r.top < document.documentElement.scrollHeight;
      }).slice(0, 1500);
    // Designers align boxes with boxes (cards, buttons, media, inputs) and text with text.
    // A card edge vs. text inside another card is a coincidence, so the two kinds are compared separately.
    const isBox = (el) => {
      if (/^(IMG|VIDEO|INPUT|SELECT|TEXTAREA|BUTTON)$/.test(el.tagName)) return true;
      const cs = getComputedStyle(el);
      const bg = cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent';
      return bg || parseFloat(cs.borderLeftWidth) > 0 || cs.boxShadow !== 'none' || cs.backgroundImage !== 'none';
    };
    const boxes = cands.filter(isBox);
    const texts = cands.filter((el) => !isBox(el));
    const check = (edgeOf, label, list) => {
      const lines = new Map();
      for (const el of list) {
        const x = Math.round(edgeOf(el.getBoundingClientRect()));
        if (!lines.has(x)) lines.set(x, []);
        lines.get(x).push(el);
      }
      for (const [x, els] of lines) {
        for (const [y, ref] of lines) {
          const d = Math.abs(x - y);
          // 1px differences are usually borders/subpixel rounding, so start at 2px.
          // Only elements that read as one column: some element of the line must be vertically near (≤ 300px).
          const r0 = els[0].getBoundingClientRect();
          const near = ref.some((o) => { const r = o.getBoundingClientRect(); return Math.max(0, r.top - r0.bottom, r0.top - r.bottom) <= 300; });
          if (d >= 2 && d <= 6 && ref.length >= 3 && ref.length > els.length && near) {
            out.misaligned.push({ edge: label, x, line: y, off: d, lineCount: ref.length, el: describe(els[0]), count: els.length });
            break;
          }
        }
      }
    };
    check((r) => r.left, 'left', boxes);
    check((r) => r.left, 'left', texts);
    check((r) => r.right, 'right', boxes); // right edges of text follow its length, so boxes only
    out.alignmentLines = [...new Set(cands.map((el) => Math.round(el.getBoundingClientRect().left)))].length;
  }
  out.misaligned = out.misaligned.sort((a, b) => b.lineCount - a.lineCount).slice(0, 15);
  out.overlaps = out.overlaps.slice(0, 30);
  out.clipped = out.clipped.slice(0, 30);
  out.smallTargets = out.smallTargets.slice(0, 30);
  // Text budget — clean UIs move information into structure (numbers, chips, icons), not sentences.
  const exempt = (el) => el.closest('article, [data-long-text], .prose, pre, code, table, [aria-hidden="true"], noscript');
  const wordsOf = (str) => ((str || '').match(/[\p{L}\p{N}][\p{L}\p{N}'’.,%-]*/gu) || []).length;
  const text = { firstViewportWords: 0, longParagraphs: [], longButtons: [], longHeadings: [] };
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const p = n.parentElement;
    if (!p || !n.textContent.trim() || /^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE)$/.test(p.tagName) || exempt(p)) continue;
    const cs = getComputedStyle(p);
    if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) continue;
    range.selectNodeContents(n);
    const r = range.getBoundingClientRect();
    if (r.width < 1 || r.bottom <= 0 || r.top >= window.innerHeight || r.right <= 0 || r.left >= vw) continue;
    text.firstViewportWords += wordsOf(n.textContent);
  }
  for (const el of document.querySelectorAll('p, li, dd, blockquote, figcaption, label, small, div, span')) {
    if (!visible(el) || exempt(el)) continue;
    // Containers (div/span) count only their own text, so wrappers aren't flagged for their children.
    const own = /^(DIV|SPAN)$/.test(el.tagName) ? [...el.childNodes].filter((c) => c.nodeType === 3).map((c) => c.textContent).join(' ') : el.innerText;
    const w = wordsOf(own);
    if (w > 30 && !el.querySelector('p, li')) text.longParagraphs.push({ el: describe(el), words: w });
  }
  for (const el of document.querySelectorAll('button, [role=button], a.btn, a[class*="button"], input[type=submit], input[type=button]')) {
    if (!visible(el) || exempt(el)) continue;
    const label = (el.value || el.innerText || '').trim().replace(/\s+/g, ' ');
    // Count words without digits: values like "1 – 30 Nov 2026" or "Rp68,8 jt" aren't wordy labels.
    const wordy = (label.match(/[\p{L}][\p{L}'’-]*/gu) || []).filter((w) => !/\d/.test(w)).length;
    const letters = label.replace(/[\d\s.,:%+\-–\/]/g, '').length;
    if (wordy > 3 || letters > 24) text.longButtons.push({ el: describe(el), words: wordy });
  }
  for (const el of document.querySelectorAll('h1, h2, h3')) {
    if (!visible(el) || exempt(el)) continue;
    const w = wordsOf(el.innerText);
    if (w > 10) text.longHeadings.push({ el: describe(el), words: w });
  }
  text.longParagraphs = text.longParagraphs.slice(0, 15);
  text.longButtons = text.longButtons.slice(0, 15);
  text.longHeadings = text.longHeadings.slice(0, 10);
  // Calibrated on well-made sites (≈55–65 words in the first phone screen); dated, wordy screens run 120+.
  text.viewportBudget = vw <= 480 ? 80 : null;
  out.text = text;

  // Number formatting: malformed grouping is always a bug; locale mismatches and unformatted
  // big numbers are reported as info. Skips code, inputs, dates, versions and IP addresses.
  const lang = (document.documentElement.lang || '').toLowerCase();
  const numbers = { malformed: [], info: [] };
  const seenNum = new Set();
  const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = tw.nextNode(); n; n = tw.nextNode()) {
    const p = n.parentElement;
    if (!p || /^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|CODE|PRE|KBD|SAMP)$/.test(p.tagName) || p.closest('code, pre, [data-no-number-check]')) continue;
    const str = n.textContent;
    for (const m of str.matchAll(/(^|[^\w.,#/:-])(v?)(\d[\d.,]*\d|\d)(k|rb|jt|m|%)?(?=$|[^\w.,])/gi)) {
      const tok = m[3], pre = m[2], suffix = m[4] || '';
      if (pre || seenNum.has(tok + suffix)) continue;
      seenNum.add(tok + suffix);
      const where = describe(p);
      if (/^0\d+$/.test(tok) && suffix && /k|rb|jt|m/i.test(suffix)) { numbers.malformed.push({ text: tok + suffix, where, why: 'leading zero in an abbreviated number' }); continue; }
      if (/^\d{1,2}[./]\d{1,2}[./]\d{2,4}$/.test(tok) || /^\d{1,3}(\.\d{1,3}){3}$/.test(tok)) continue; // dates, IPs
      const seps = tok.replace(/\d/g, '');
      if (!seps) {
        if (tok.length >= 5 && tok.length <= 9 && !/^0/.test(tok)) numbers.info.push({ text: tok, where, why: 'no thousands separator (12.485 / 12,485)' });
        continue;
      }
      const groups = tok.split(/[.,]/);
      const kinds = [...new Set(seps)];
      let ok;
      const thousandsSep = lang.startsWith('id') ? '.' : lang.startsWith('en') ? ',' : null;
      if (kinds.length === 1 && seps.length === 1 && seps === thousandsSep && groups[1].length !== 3) {
        numbers.malformed.push({ text: tok + suffix, where, why: `"${seps}" is the thousands separator on a ${lang} page, so it must be followed by 3 digits` });
        continue;
      }
      if (kinds.length === 1) {
        ok = seps.length === 1 || groups.slice(1).every((g) => g.length === 3) && groups[0].length <= 3;
        if (ok && seps.length === 1 && groups[1].length === 3 && groups[0].length <= 3) {
          if (lang.startsWith('id') && seps === ',') numbers.info.push({ text: tok, where, why: 'English-style grouping on an Indonesian page (use 12.485)' });
          if (lang.startsWith('en') && seps === '.') numbers.info.push({ text: tok, where, why: 'Indonesian-style grouping on an English page (use 12,485)' });
        }
      } else {
        const last = seps[seps.length - 1];
        const thousands = seps.slice(0, -1);
        ok = kinds.length === 2 && !thousands.includes(last) && groups[0].length <= 3 && groups.slice(1, -1).every((g) => g.length === 3);
      }
      if (!ok) numbers.malformed.push({ text: tok + suffix, where, why: 'digit grouping is malformed' });
    }
  }
  numbers.malformed = numbers.malformed.slice(0, 10);
  numbers.info = numbers.info.slice(0, 6);
  out.numbers = numbers;
  return out;
}

(async () => {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.url) {
    console.log(fs.readFileSync(__filename, 'utf8').split('*/')[0].replace(/^#!.*\n\/\*\*?/, '').replace(/^ \* ?/gm, ''));
    process.exit(args.url ? 0 : 2);
  }
  fs.mkdirSync(args.out, { recursive: true });
  const targets = args.paths.length ? args.paths.map((p) => new URL(p, args.url.endsWith('/') ? args.url : args.url + '/').href) : [args.url];

  const browser = await chromium.launch();
  // bypassCSP lets the axe-core audit script run on sites with a strict Content-Security-Policy (testing only).
  const context = await browser.newContext({ bypassCSP: true, ...(args.storage ? { storageState: args.storage } : {}) });
  if (args.cookies.length) {
    const u = new URL(targets[0]);
    if (u.protocol.startsWith('http')) {
      await context.addCookies(args.cookies.map((c) => { const [name, ...v] = c.split('='); return { name, value: v.join('='), domain: u.hostname, path: '/' }; }));
    }
  }

  const report = [];
  let issues = 0;
  const axePath = args.a11y ? findAxe() : null;
  if (args.a11y && !axePath) console.log('(a11y skipped: install axe-core with `npm i -D axe-core` to enable the WCAG audit)\n');
  for (const url of targets) {
    for (const [wi, width] of args.widths.entries()) {
      const firstWidth = wi === 0;
      const page = await context.newPage();
      await page.setViewportSize({ width, height: args.height });
      const doPerf = args.perf && firstWidth;
      if (doPerf) {
        await page.addInitScript(perfInit);
        if (args.slow) {
          const cdp = await context.newCDPSession(page);
          await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
          await cdp.send('Network.enable');
          await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8 });
        }
      }
      const dialogs = [], errors = [];
      page.on('dialog', (d) => { dialogs.push(`${d.type()}: ${d.message()}`); d.dismiss().catch(() => {}); });
      page.on('pageerror', (e) => errors.push(String(e.message || e)));
      let status = null;
      try {
        const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        status = resp ? resp.status() : null;
      } catch (e) {
        errors.push('navigation: ' + e.message.split('\n')[0]);
      }
      await page.waitForTimeout(args.wait);
      let result = { overflowPx: 0, overflowing: [], overlaps: [], clipped: [], smallTargets: [] };
      try { result = await page.evaluate(inspect); } catch (e) { errors.push('inspect: ' + e.message); }
      const shot = path.join(args.out, `${slug(url)}-${width}.png`);
      await page.screenshot({ path: shot, fullPage: args.fullPage }).catch(() => {});
      // Performance (first width only).
      let perf = null, perfIssues = [];
      if (doPerf) {
        try {
          await page.waitForTimeout(300);
          perf = await page.evaluate(collectPerf);
          if (perf.lcp > 2500) perfIssues.push(`LCP ${perf.lcp}ms (budget 2500ms) — optimize the hero image/font, preload it, reduce render-blocking CSS/JS`);
          if (perf.cls > 0.1) perfIssues.push(`CLS ${perf.cls} (budget 0.1) — give images/embeds width+height or aspect-ratio, reserve space for late content`);
          if (perf.tbt > 300) perfIssues.push(`blocking time ${perf.tbt}ms (budget 300ms) — split/defer JavaScript`);
          if (perf.oversizedImages.length) perfIssues.push(`${perf.oversizedImages.length} oversized image(s), e.g. ${perf.oversizedImages[0]} — serve responsive sizes (srcset) in WebP/AVIF`);
          if (perf.unsizedImages.length) perfIssues.push(`${perf.unsizedImages.length} image(s) without width/height (layout shift risk), e.g. ${perf.unsizedImages[0]}`);
          if (perf.eagerOffscreenImages.length) perfIssues.push(`${perf.eagerOffscreenImages.length} offscreen image(s) not lazy-loaded — add loading="lazy"`);
          if (perf.webFonts.length > 6) perfIssues.push(`${perf.webFonts.length} web font files/weights loaded — keep to ≤ 4`);
        } catch (e) { errors.push('perf: ' + e.message); }
      }

      // Accessibility at the smallest and the largest width: layouts hide/show different
      // things (e.g. a sidebar that is off-canvas on phones but visible on desktop).
      let a11y = null;
      if (axePath && (firstWidth || wi === args.widths.length - 1)) {
        try {
          await page.addScriptTag({ path: axePath });
          a11y = await page.evaluate(async () => {
            const r = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] }, resultTypes: ['violations'] });
            return r.violations.map((v) => ({
              id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length, helpUrl: v.helpUrl,
              wcag: v.tags.some((t) => /^wcag\d/.test(t)), example: v.nodes[0] ? v.nodes[0].target.join(' ').slice(0, 90) : '',
            }));
          });
        } catch (e) { errors.push('a11y: ' + e.message.split('\n')[0]); }
      }
      const a11yIssues = (a11y || []).filter((v) => v.wcag);

      // Stress pass.
      let stress = null;
      if (args.stress) {
        try {
          await page.evaluate(stressify);
          await page.waitForTimeout(250);
          const sr = await page.evaluate(inspect);
          const sshot = path.join(args.out, `${slug(url)}-${width}-stress.png`);
          await page.screenshot({ path: sshot, fullPage: args.fullPage }).catch(() => {});
          stress = { screenshot: sshot, overflowPx: sr.overflowPx, overflowing: sr.overflowing.slice(0, 8), overlaps: sr.overlaps.slice(0, 8), clipped: sr.clipped.slice(0, 8) };
        } catch (e) { errors.push('stress: ' + e.message.split('\n')[0]); }
      }
      const stressCount = stress ? (stress.overflowPx > 0 ? 1 : 0) + stress.overlaps.length + stress.clipped.length : 0;

      const entry = { url, width, status, screenshot: shot, ...result, perf, perfIssues, a11y, stress, nativeDialogs: dialogs, pageErrors: errors };
      const t = result.text || { longParagraphs: [], longButtons: [], longHeadings: [] };
      const overBudget = t.viewportBudget && t.firstViewportWords > t.viewportBudget;
      const textIssues = args.text ? (overBudget ? 1 : 0) + t.longParagraphs.length + t.longButtons.length + t.longHeadings.length : 0;
      const count = (result.overflowPx > 0 ? 1 : 0) + result.overlaps.length + result.clipped.length + result.smallTargets.length + (result.misaligned || []).length + textIssues + (result.numbers ? result.numbers.malformed.length : 0) + perfIssues.length + a11yIssues.length + stressCount + dialogs.length + errors.length;
      entry.issueCount = count;
      issues += count;
      report.push(entry);
      await page.close();

      const flag = count ? '✗' : '✓';
      console.log(`${flag} ${url} @ ${width}px${status && status >= 400 ? ` (HTTP ${status})` : ''}`);
      if (result.overflowPx > 0) {
        console.log(`    horizontal overflow: +${result.overflowPx}px`);
        result.overflowing.slice(0, 8).forEach((o) => console.log(`      ↳ ${o.el}  [left ${o.left}, right ${o.right}]`));
      }
      result.overlaps.slice(0, 8).forEach((o) => console.log(`    overlap: ${o.a}  ⟷  ${o.b}  (${o.area}px²)`));
      result.clipped.slice(0, 8).forEach((o) => console.log(`    clipped text (${o.axis}): ${o.el}`));
      result.smallTargets.slice(0, 8).forEach((o) => console.log(`    small touch target ${o.w}×${o.h}: ${o.el}`));
      (result.misaligned || []).slice(0, 8).forEach((o) => console.log(`    near-miss ${o.edge} edge: ${o.el} at x=${o.x} is ${o.off}px off the x=${o.line} line shared by ${o.lineCount} elements`));
      if (result.alignmentLines) console.log(`    (info) distinct left edges: ${result.alignmentLines} — fewer = tidier`);
      const tag = args.text ? '' : '(info) ';
      if (overBudget) console.log(`    ${tag}too much text: ${t.firstViewportWords} words in the first screen (budget ${t.viewportBudget}) — turn sentences into numbers/chips/icons`);
      else if (t.firstViewportWords) console.log(`    (info) words in first screen: ${t.firstViewportWords}`);
      t.longParagraphs.slice(0, 6).forEach((o) => console.log(`    ${tag}long paragraph (${o.words} words, budget 30): ${o.el}`));
      t.longButtons.slice(0, 6).forEach((o) => console.log(`    ${tag}long button label (${o.words} words, budget 3): ${o.el}`));
      t.longHeadings.slice(0, 6).forEach((o) => console.log(`    ${tag}long heading (${o.words} words, budget 10): ${o.el}`));
      if (result.numbers) {
        result.numbers.malformed.forEach((o) => console.log(`    number format: "${o.text}" — ${o.why} (${o.where}); format with Intl.NumberFormat`));
        result.numbers.info.slice(0, 4).forEach((o) => console.log(`    (info) number "${o.text}": ${o.why} — ${o.where}`));
      }
      if (perf) console.log(`    (perf) LCP ${perf.lcp}ms · CLS ${perf.cls} · TBT ${perf.tbt}ms · ${perf.totalKB}KB in ${perf.requests} requests ${JSON.stringify(perf.byTypeKB)}${args.slow ? ' [throttled]' : ''}`);
      perfIssues.forEach((m) => console.log(`    perf: ${m}`));
      if (a11y) {
        a11yIssues.slice(0, 12).forEach((v) => console.log(`    a11y [${v.impact}] ${v.id}: ${v.help} — ${v.nodes} element(s), e.g. ${v.example}`));
        const bp = a11y.filter((v) => !v.wcag);
        if (bp.length) console.log(`    (info) a11y best practices: ${bp.map((v) => v.id).join(', ')}`);
        if (!a11y.length) console.log('    a11y: no WCAG violations detected (still test keyboard + screen reader manually)');
      }
      if (stress) {
        if (stress.overflowPx > 0) { console.log(`    stress: horizontal overflow +${stress.overflowPx}px with long content`); stress.overflowing.slice(0, 4).forEach((o) => console.log(`      ↳ ${o.el}`)); }
        stress.overlaps.slice(0, 4).forEach((o) => console.log(`    stress overlap: ${o.a} ⟷ ${o.b}`));
        stress.clipped.slice(0, 4).forEach((o) => console.log(`    stress clipped (${o.axis}): ${o.el} — wrap, truncate with ellipsis + title, or allow growth`));
        if (!stressCount) console.log('    stress: layout holds with long text and big numbers');
      }
      dialogs.forEach((d) => console.log(`    native dialog fired → ${d}`));
      errors.forEach((e) => console.log(`    page error: ${e}`));
    }
  }
  await browser.close();
  fs.writeFileSync(path.join(args.out, 'report.json'), JSON.stringify(report, null, 2));
  console.log(`\n${issues ? issues + ' issue(s) found' : 'No issues found'} — screenshots + report.json in ${path.resolve(args.out)}`);
  process.exit(issues ? 1 : 0);
})();
