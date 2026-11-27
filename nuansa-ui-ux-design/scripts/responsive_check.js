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
 *
 * Detects, per page and width:
 *   - horizontal page overflow (document wider than viewport) and the elements causing it
 *   - overlapping interactive elements (buttons/links/inputs covering each other)
 *   - clipped text (overflow hidden without ellipsis)
 *   - touch targets smaller than 32px on widths <= 480
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
  const a = { paths: [], widths: [375, 768, 1280, 1440], height: 900, out: 'responsive-report', wait: 500, cookies: [], fullPage: true };
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
    else if (k === '--help' || k === '-h') a.help = true;
  }
  return a;
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
    if (clipX || clipY) out.clipped.push({ el: describe(el), axis: clipX ? 'x' : 'y' });
  }

  // Small touch targets on phones (inline links inside text are exempt).
  if (vw <= 480) {
    for (const el of interactive) {
      if (el.tagName === 'A' && el.closest('p, li, td, span') && getComputedStyle(el).display === 'inline') continue;
      const r = el.getBoundingClientRect();
      if (r.width < 32 || r.height < 32) out.smallTargets.push({ el: describe(el), w: Math.round(r.width), h: Math.round(r.height) });
    }
  }
  out.overlaps = out.overlaps.slice(0, 30);
  out.clipped = out.clipped.slice(0, 30);
  out.smallTargets = out.smallTargets.slice(0, 30);
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
  const context = await browser.newContext(args.storage ? { storageState: args.storage } : {});
  if (args.cookies.length) {
    const u = new URL(targets[0]);
    if (u.protocol.startsWith('http')) {
      await context.addCookies(args.cookies.map((c) => { const [name, ...v] = c.split('='); return { name, value: v.join('='), domain: u.hostname, path: '/' }; }));
    }
  }

  const report = [];
  let issues = 0;
  for (const url of targets) {
    for (const width of args.widths) {
      const page = await context.newPage();
      await page.setViewportSize({ width, height: args.height });
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
      const entry = { url, width, status, screenshot: shot, ...result, nativeDialogs: dialogs, pageErrors: errors };
      const count = (result.overflowPx > 0 ? 1 : 0) + result.overlaps.length + result.clipped.length + result.smallTargets.length + dialogs.length + errors.length;
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
      dialogs.forEach((d) => console.log(`    native dialog fired → ${d}`));
      errors.forEach((e) => console.log(`    page error: ${e}`));
    }
  }
  await browser.close();
  fs.writeFileSync(path.join(args.out, 'report.json'), JSON.stringify(report, null, 2));
  console.log(`\n${issues ? issues + ' issue(s) found' : 'No issues found'} — screenshots + report.json in ${path.resolve(args.out)}`);
  process.exit(issues ? 1 : 0);
})();
