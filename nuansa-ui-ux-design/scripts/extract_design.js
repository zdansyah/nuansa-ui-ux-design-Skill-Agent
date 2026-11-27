#!/usr/bin/env node
/**
 * extract_design.js — learn the design system of a reference website.
 *
 * Usage:
 *   node extract_design.js --url https://example.com [--out ./design-ref] [--widths 1440,390] [--wait 1500]
 *
 * Produces in --out:
 *   <host>-<width>.png        full-page screenshots (height capped at 8000px)
 *   <host>-design.json        raw measurements
 *   <host>-design.md          readable summary: fonts, type scale, palette, radius, shadows,
 *                             buttons, section structure, layout widths, effects, tech hints
 *
 * What it measures (computed styles of visible elements, weighted by area / text length):
 *   fonts, font sizes/weights/tracking of headings vs body, text & background colors,
 *   gradients, border radius, shadows, backdrop blur, button styles, section order and
 *   grid columns, container widths, section paddings, CSS custom properties on :root,
 *   dark-mode support, frameworks (Tailwind/Bootstrap/Next/Nuxt/Astro…), icon sets.
 *
 * Use the result to write a "reference style spec" (see references/style-presets.md),
 * then map it to tokens. Learn the system; don't copy content, logos or imagery.
 */
const fs = require('fs');
const path = require('path');
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) {
  console.error('Playwright not found. Install with `npm i -D playwright && npx playwright install chromium`.');
  process.exit(2);
}

const args = { widths: [1440, 390], out: 'design-ref', wait: 1500 };
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--url') args.url = argv[++i];
  else if (argv[i] === '--out') args.out = argv[++i];
  else if (argv[i] === '--widths') args.widths = argv[++i].split(',').map(Number);
  else if (argv[i] === '--wait') args.wait = Number(argv[++i]);
}
if (!args.url) { console.log(fs.readFileSync(__filename, 'utf8').split('*/')[0]); process.exit(2); }

function measure() {
  const toHex = (c) => {
    const m = c && c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    const a = p.length > 3 ? p[3] : 1;
    if (a === 0) return null;
    const hex = '#' + p.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
    return a < 1 ? `${hex}@${Math.round(a * 100)}%` : hex;
  };
  const bump = (map, key, w = 1) => { if (key == null || key === '') return; map[key] = (map[key] || 0) + w; };
  const top = (map, n = 12) => Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => ({ value: k, weight: Math.round(v) }));
  const visible = (el, cs) => {
    if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width > 2 && r.height > 2;
  };
  const ownText = (el) => [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim();

  const fonts = {}, textColors = {}, bgColors = {}, borderColors = {}, radii = {}, shadows = {}, gradients = {}, sizes = {}, weights = {};
  let blur = 0, transitions = 0, animations = 0;
  const all = [...document.body.querySelectorAll('*')];
  for (const el of all) {
    const cs = getComputedStyle(el);
    if (!visible(el, cs)) continue;
    const r = el.getBoundingClientRect();
    const area = Math.min(r.width * r.height, 1440 * 900);
    const t = ownText(el);
    if (t.length) {
      bump(fonts, cs.fontFamily.split(',')[0].replace(/["']/g, '').trim(), t.length);
      bump(textColors, toHex(cs.color), t.length);
      bump(sizes, cs.fontSize, t.length);
      bump(weights, cs.fontWeight, t.length);
    }
    const bg = toHex(cs.backgroundColor);
    if (bg) bump(bgColors, bg, area);
    if (cs.backgroundImage.includes('gradient')) bump(gradients, cs.backgroundImage.slice(0, 160), area);
    if (parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== 'none') bump(borderColors, toHex(cs.borderTopColor), 1);
    if ((bg || parseFloat(cs.borderTopWidth) > 0 || el.tagName === 'IMG') && cs.borderTopLeftRadius !== '0px') bump(radii, cs.borderTopLeftRadius, 1);
    if (cs.boxShadow && cs.boxShadow !== 'none') bump(shadows, cs.boxShadow.slice(0, 140), 1);
    if ((cs.backdropFilter && cs.backdropFilter !== 'none') || (cs.webkitBackdropFilter && cs.webkitBackdropFilter !== 'none')) blur++;
    if (cs.transitionDuration && cs.transitionDuration !== '0s') transitions++;
    if (cs.animationName && cs.animationName !== 'none') animations++;
  }

  const headings = [...document.querySelectorAll('h1, h2, h3')].filter((h) => visible(h, getComputedStyle(h))).slice(0, 25).map((h) => {
    const cs = getComputedStyle(h);
    return { tag: h.tagName.toLowerCase(), text: h.innerText.trim().replace(/\s+/g, ' ').slice(0, 90), size: cs.fontSize, weight: cs.fontWeight, tracking: cs.letterSpacing, lineHeight: cs.lineHeight, font: cs.fontFamily.split(',')[0].replace(/["']/g, ''), color: toHex(cs.color) };
  });
  const bodyP = [...document.querySelectorAll('p')].filter((p) => p.innerText.trim().length > 40).slice(0, 10).map((p) => { const cs = getComputedStyle(p); return `${cs.fontSize}/${cs.lineHeight} ${cs.fontWeight} ${toHex(cs.color)}`; });

  const btnMap = {};
  for (const b of document.querySelectorAll('a, button, [role=button]')) {
    const cs = getComputedStyle(b);
    if (!visible(b, cs)) continue;
    const bg = toHex(cs.backgroundColor), bw = parseFloat(cs.borderTopWidth);
    if (!bg && !(bw > 0) && !cs.backgroundImage.includes('gradient')) continue;
    const r = b.getBoundingClientRect();
    if (r.height < 24 || r.height > 80 || r.width > 500) continue;
    const key = [bg || (cs.backgroundImage.includes('gradient') ? 'gradient' : 'transparent'), toHex(cs.color), cs.borderTopLeftRadius, bw > 0 ? `${cs.borderTopWidth} ${toHex(cs.borderTopColor)}` : 'no-border', `${Math.round(r.height)}px tall`, `pad ${cs.paddingLeft}`, `w${cs.fontWeight}`, cs.fontSize].join(' | ');
    if (!btnMap[key]) btnMap[key] = { style: key, count: 0, example: (b.innerText || b.getAttribute('aria-label') || '').trim().slice(0, 30) };
    btnMap[key].count++;
  }

  // Section structure: direct children of main/body that are big blocks.
  const container = document.querySelector('main') || document.body;
  let blocks = [...container.children];
  if (blocks.length === 1 && blocks[0].children.length > 2) blocks = [...blocks[0].children];
  const header = document.querySelector('header');
  if (header && !blocks.includes(header)) blocks.unshift(header);
  const footer = document.querySelector('footer');
  if (footer && !blocks.includes(footer)) blocks.push(footer);
  const sections = blocks.filter((b) => { const cs = getComputedStyle(b); return visible(b, cs) && b.getBoundingClientRect().height > 40 && !['SCRIPT', 'STYLE'].includes(b.tagName); }).slice(0, 30).map((b) => {
    const cs = getComputedStyle(b);
    const r = b.getBoundingClientRect();
    const h = b.querySelector('h1, h2, h3');
    let maxCols = 0, gridInfo = '';
    for (const g of b.querySelectorAll('*')) {
      const gs = getComputedStyle(g);
      if (gs.display === 'grid' && gs.gridTemplateColumns !== 'none') {
        const cols = gs.gridTemplateColumns.split(' ').length;
        if (cols > maxCols) { maxCols = cols; gridInfo = `grid ${cols} cols, gap ${gs.columnGap}`; }
      } else if (gs.display === 'flex' && gs.flexDirection === 'row' && g.children.length >= 3 && g.getBoundingClientRect().width > 600 && !gridInfo) {
        gridInfo = `flex row × ${g.children.length}`;
      }
    }
    const inner = [...b.querySelectorAll('*')].find((x) => { const xs = getComputedStyle(x); return xs.maxWidth !== 'none' && x.getBoundingClientRect().width > 600; });
    return {
      tag: b.tagName.toLowerCase() + (b.id ? '#' + b.id : ''),
      heading: h ? h.innerText.trim().replace(/\s+/g, ' ').slice(0, 80) : '',
      height: Math.round(r.height), bg: toHex(cs.backgroundColor) || (cs.backgroundImage !== 'none' ? 'image/gradient' : 'transparent'),
      paddingY: `${cs.paddingTop} / ${cs.paddingBottom}`, layout: gridInfo, containerMax: inner ? getComputedStyle(inner).maxWidth : '',
      sticky: cs.position === 'sticky' || cs.position === 'fixed', imgs: b.querySelectorAll('img, svg, video, canvas').length,
      buttons: b.querySelectorAll('a[href], button').length,
    };
  });

  // CSS custom properties defined on :root (same-origin sheets only).
  const vars = {};
  for (const sheet of document.styleSheets) {
    let rules; try { rules = sheet.cssRules; } catch (e) { continue; }
    for (const rule of rules || []) {
      if (rule.selectorText && /(^|,)\s*(:root|html)\b/.test(rule.selectorText)) {
        for (const prop of rule.style) if (prop.startsWith('--') && Object.keys(vars).length < 80) vars[prop] = rule.style.getPropertyValue(prop).trim().slice(0, 60);
      }
    }
  }
  let darkMode = false;
  for (const sheet of document.styleSheets) {
    let rules; try { rules = sheet.cssRules; } catch (e) { continue; }
    for (const rule of rules || []) { const t = rule.cssText || ''; if (t.includes('prefers-color-scheme: dark') || /\.dark[\s:{]/.test(t) || t.includes('[data-theme="dark"]')) { darkMode = true; break; } }
    if (darkMode) break;
  }

  const html = document.documentElement.outerHTML;
  const cls = [...document.querySelectorAll('[class]')].slice(0, 3000).map((e) => (typeof e.className === 'string' ? e.className : '')).join(' ');
  const tech = [];
  if (/\b(?:sm|md|lg|xl):[a-z]/.test(cls) && /\brounded-|\bpx-\d|\btext-(?:sm|lg|xl)/.test(cls)) tech.push('Tailwind CSS');
  if (/\bcol-(?:md|lg)-\d|\bbtn-primary\b/.test(cls)) tech.push('Bootstrap');
  if (document.getElementById('__next') || html.includes('/_next/')) tech.push('Next.js');
  if (document.getElementById('__nuxt') || html.includes('/_nuxt/')) tech.push('Nuxt');
  if (html.includes('astro-')) tech.push('Astro');
  if (html.includes('data-v-')) tech.push('Vue');
  if (html.includes('svelte-')) tech.push('Svelte');
  if (html.includes('framer')) tech.push('Framer');
  if (/lucide/i.test(html)) tech.push('Lucide icons');
  if (/heroicons/i.test(html)) tech.push('Heroicons');
  if (/font-?awesome|fa-solid|fa-regular/i.test(html)) tech.push('Font Awesome');
  if (/data-aos|aos\.css/i.test(html)) tech.push('AOS scroll animations');
  if (/gsap/i.test(html)) tech.push('GSAP');
  const googleFonts = [...document.querySelectorAll('link[href*="fonts.googleapis"], link[href*="fonts.bunny"]')].map((l) => decodeURIComponent(l.href).replace(/.*family=/, '').slice(0, 120));
  const nextFonts = [...new Set((html.match(/__[A-Z][a-zA-Z]+_[0-9a-f]{6}/g) || []).map((s) => s.split('_')[2]))];

  const widths = {};
  for (const el of all) {
    const cs = getComputedStyle(el);
    if (cs.maxWidth !== 'none' && cs.maxWidth.endsWith('px') && parseFloat(cs.maxWidth) >= 600) bump(widths, cs.maxWidth, 1);
  }

  return {
    title: document.title, lang: document.documentElement.lang, themeColor: (document.querySelector('meta[name=theme-color]') || {}).content || '',
    description: (document.querySelector('meta[name=description]') || {}).content || '',
    tech, googleFonts, nextFonts, darkMode,
    fonts: top(fonts, 6), fontSizes: top(sizes, 12), fontWeights: top(weights, 6), headings, bodyParagraphs: bodyP,
    textColors: top(textColors, 10), backgroundColors: top(bgColors, 12), borderColors: top(borderColors, 6), gradients: top(gradients, 6),
    radii: top(radii, 10), shadows: top(shadows, 6), buttons: Object.values(btnMap).sort((a, b) => b.count - a.count).slice(0, 8),
    containerMaxWidths: top(widths, 6), sections, cssVariables: vars,
    effects: { backdropBlurElements: blur, elementsWithTransitions: transitions, animatedElements: animations },
    pageHeight: document.documentElement.scrollHeight,
  };
}

function toMarkdown(d, host, shots) {
  const list = (arr, f = (x) => `${x.value} (${x.weight})`) => arr.length ? arr.map(f).join(', ') : '—';
  const L = [];
  L.push(`# Design extract — ${host}`, '', `- Title: ${d.title}`, `- Lang: ${d.lang || '—'} · theme-color: ${d.themeColor || '—'} · dark mode CSS: ${d.darkMode ? 'yes' : 'no'}`);
  L.push(`- Tech: ${d.tech.join(', ') || '—'}`, `- Google Fonts: ${d.googleFonts.join(' | ') || '—'}${d.nextFonts.length ? ` · next/font: ${d.nextFonts.join(', ')}` : ''}`, `- Page height @1440: ${d.pageHeight}px`, `- Screenshots: ${shots.join(', ')}`, '');
  L.push('## Typography', `- Fonts (by text volume): ${list(d.fonts)}`, `- Sizes: ${list(d.fontSizes)}`, `- Weights: ${list(d.fontWeights)}`, `- Body paragraphs: ${d.bodyParagraphs.slice(0, 4).join(' · ') || '—'}`, '', '| tag | size | weight | tracking | line-height | color | text |', '|---|---|---|---|---|---|---|');
  d.headings.forEach((h) => L.push(`| ${h.tag} | ${h.size} | ${h.weight} | ${h.tracking} | ${h.lineHeight} | ${h.color} | ${h.text.replace(/\|/g, '/')} |`));
  L.push('', '## Color', `- Text: ${list(d.textColors)}`, `- Backgrounds (by area): ${list(d.backgroundColors)}`, `- Borders: ${list(d.borderColors)}`, `- Gradients: ${list(d.gradients, (x) => '`' + x.value + '`')}`);
  L.push('', '## Shape & depth', `- Radius: ${list(d.radii)}`, `- Shadows: ${list(d.shadows, (x) => '`' + x.value + '` ×' + x.weight)}`, `- Effects: blur ${d.effects.backdropBlurElements}, transitions ${d.effects.elementsWithTransitions}, animations ${d.effects.animatedElements}`);
  L.push('', '## Buttons (bg | text | radius | border | height | padding | weight | size)');
  d.buttons.forEach((b) => L.push(`- ×${b.count} "${b.example}": ${b.style}`));
  L.push('', '## Layout', `- Container max-widths: ${list(d.containerMaxWidths)}`, '', '| # | block | heading | height | bg | padding Y | layout | sticky |', '|---|---|---|---|---|---|---|---|');
  d.sections.forEach((s, i) => L.push(`| ${i + 1} | ${s.tag} | ${s.heading.replace(/\|/g, '/')} | ${s.height} | ${s.bg} | ${s.paddingY} | ${s.layout} | ${s.sticky ? 'yes' : ''} |`));
  const vars = Object.entries(d.cssVariables);
  if (vars.length) { L.push('', '## CSS variables on :root (first 40)'); vars.slice(0, 40).forEach(([k, v]) => L.push(`- \`${k}: ${v}\``)); }
  return L.join('\n') + '\n';
}

(async () => {
  fs.mkdirSync(args.out, { recursive: true });
  const host = new URL(args.url).hostname.replace(/^www\./, '');
  const browser = await chromium.launch();
  const shots = [];
  let data = null;
  for (const width of args.widths) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
    try {
      await page.goto(args.url, { waitUntil: 'networkidle', timeout: 45000 });
    } catch (e) {
      console.error(`navigation @${width}: ${e.message.split('\n')[0]}`);
    }
    await page.waitForTimeout(args.wait);
    // Scroll through to trigger lazy content / scroll-reveal animations.
    await page.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); } window.scrollTo(0, 0); });
    await page.waitForTimeout(400);
    if (!data) data = await page.evaluate(measure);
    const h = Math.min(await page.evaluate(() => document.documentElement.scrollHeight), 8000);
    const file = path.join(args.out, `${host}-${width}.png`);
    await page.screenshot({ path: file, clip: { x: 0, y: 0, width, height: h }, fullPage: true }).catch(() => page.screenshot({ path: file }));
    shots.push(path.basename(file));
    await page.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(args.out, `${host}-design.json`), JSON.stringify(data, null, 2));
  fs.writeFileSync(path.join(args.out, `${host}-design.md`), toMarkdown(data, host, shots));
  console.log(toMarkdown(data, host, shots));
})();
