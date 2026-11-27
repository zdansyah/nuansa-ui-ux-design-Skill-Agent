#!/usr/bin/env node
/**
 * before_after.js — build a before/after report a client or team can open in a browser.
 *
 * Typical flow:
 *   1. Before changing anything:  node responsive_check.js --url http://localhost:8000 --paths / /admin --out ui-before
 *   2. After the redesign:        node responsive_check.js --url http://localhost:8000 --paths / /admin --out ui-after
 *   3. Report:                    node before_after.js --before ui-before --after ui-after --out ui-report [--notes CHANGES.md] [--title "Redesign Toko Maju"]
 *
 * Output: <out>/index.html (+ copied screenshots in <out>/img/). Screenshots are matched by
 * file name; issue counts come from each folder's report.json. Notes (Markdown) are shown at
 * the top: use them for "what changed and why" and "how to re-theme".
 */
const fs = require('fs');
const path = require('path');

const a = { title: 'Before / After', out: 'ui-report' };
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--before') a.before = argv[++i];
  else if (argv[i] === '--after') a.after = argv[++i];
  else if (argv[i] === '--out') a.out = argv[++i];
  else if (argv[i] === '--notes') a.notes = argv[++i];
  else if (argv[i] === '--title') a.title = argv[++i];
}
if (!a.before || !a.after) { console.log(fs.readFileSync(__filename, 'utf8').split('*/')[0]); process.exit(2); }

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const readReport = (dir) => { try { return JSON.parse(fs.readFileSync(path.join(dir, 'report.json'), 'utf8')); } catch (e) { return []; } };
const issuesByShot = (dir) => {
  const m = {};
  for (const e of readReport(dir)) {
    m[path.basename(e.screenshot)] = e.issueCount || 0;
    if (e.stress && e.stress.screenshot) m[path.basename(e.stress.screenshot)] = (e.stress.overflowPx > 0 ? 1 : 0) + e.stress.overlaps.length + e.stress.clipped.length;
  }
  return m;
};

// Tiny Markdown → HTML (headings, bullets, bold, code, paragraphs). Escapes everything first.
function md(src) {
  const out = [];
  let list = false;
  for (const raw of src.split(/\r?\n/)) {
    let line = esc(raw).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code>$1</code>');
    const h = line.match(/^(#{1,4})\s+(.*)/);
    const li = line.match(/^\s*[-*]\s+(.*)/);
    if (!li && list) { out.push('</ul>'); list = false; }
    if (h) out.push(`<h${h[1].length + 1}>${h[2]}</h${h[1].length + 1}>`);
    else if (li) { if (!list) { out.push('<ul>'); list = true; } out.push(`<li>${li[1]}</li>`); }
    else if (line.trim()) out.push(`<p>${line}</p>`);
  }
  if (list) out.push('</ul>');
  return out.join('\n');
}

const pngs = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.png')) : []);
const beforeSet = new Set(pngs(a.before));
const afterFiles = pngs(a.after);
const names = [...new Set([...afterFiles, ...beforeSet])].sort();
const bIssues = issuesByShot(a.before), aIssues = issuesByShot(a.after);

fs.mkdirSync(path.join(a.out, 'img', 'before'), { recursive: true });
fs.mkdirSync(path.join(a.out, 'img', 'after'), { recursive: true });

// Group: "<page>-<width>[-stress].png"
const groups = {};
for (const n of names) {
  const m = n.match(/^(.*)-(\d+)(-stress)?\.png$/);
  const page = m ? m[1] : n.replace(/\.png$/, '');
  const label = m ? `${m[2]}px${m[3] ? ' · stress' : ''}` : n;
  const width = m ? Number(m[2]) : 0;
  (groups[page] = groups[page] || []).push({ n, label, width, stress: !!(m && m[3]) });
  if (beforeSet.has(n)) fs.copyFileSync(path.join(a.before, n), path.join(a.out, 'img', 'before', n));
  if (afterFiles.includes(n)) fs.copyFileSync(path.join(a.after, n), path.join(a.out, 'img', 'after', n));
}

const sum = (m) => Object.values(m).reduce((x, y) => x + y, 0);
const totalB = sum(bIssues), totalA = sum(aIssues);
const notes = a.notes && fs.existsSync(a.notes) ? md(fs.readFileSync(a.notes, 'utf8')) : '';

const sections = Object.entries(groups).map(([page, items]) => {
  items.sort((x, y) => x.width - y.width || Number(x.stress) - Number(y.stress));
  const rows = items.map((it) => {
    const cell = (side, has, issues) => has
      ? `<figure><figcaption><span class="tag tag--${side}">${side === 'before' ? 'Sebelum' : 'Sesudah'}</span>${issues != null ? `<span class="count ${issues ? 'bad' : 'good'}">${issues} masalah</span>` : ''}</figcaption><a href="img/${side}/${esc(it.n)}" target="_blank" rel="noopener"><img loading="lazy" src="img/${side}/${esc(it.n)}" alt="${side} ${esc(page)} ${esc(it.label)}"></a></figure>`
      : `<figure class="missing"><figcaption><span class="tag tag--${side}">${side === 'before' ? 'Sebelum' : 'Sesudah'}</span></figcaption><div class="none">Tidak ada screenshot</div></figure>`;
    return `<div class="row"><h3>${esc(it.label)}</h3><div class="pair">${cell('before', beforeSet.has(it.n), bIssues[it.n])}${cell('after', afterFiles.includes(it.n), aIssues[it.n])}</div></div>`;
  }).join('\n');
  return `<section><h2>${esc(page.replace(/-/g, ' / ') || 'home')}</h2>${rows}</section>`;
}).join('\n');

const html = `<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(a.title)}</title>
<style>
:root{--bg:#f6f7f9;--surface:#fff;--border:#e5e7eb;--text:#111827;--muted:#6b7280;--good:#16a34a;--bad:#dc2626;--before:#9ca3af;--after:#2563eb}
@media (prefers-color-scheme:dark){:root{--bg:#0b0f17;--surface:#111827;--border:#1f2937;--text:#e5e7eb;--muted:#9ca3af}}
*{box-sizing:border-box}body{margin:0;font:15px/1.6 ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;background:var(--bg);color:var(--text)}
.wrap{max-width:1280px;margin:auto;padding:24px 16px 80px}
header{display:flex;flex-wrap:wrap;gap:16px;align-items:flex-end;justify-content:space-between;margin-bottom:24px}
h1{font-size:clamp(1.6rem,1.2rem+2vw,2.4rem);letter-spacing:-.02em;margin:0}
.kpis{display:flex;gap:12px;flex-wrap:wrap}.kpi{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:10px 16px;min-width:130px}
.kpi b{display:block;font-size:1.5rem;letter-spacing:-.02em}.kpi span{color:var(--muted);font-size:.8rem}
.notes{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:8px 24px;margin-bottom:32px}
.notes code{background:var(--bg);padding:.1em .35em;border-radius:4px}
section{margin-top:40px}h2{font-size:1.25rem;margin:0 0 12px;text-transform:capitalize}
.row{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:16px;margin-bottom:16px}
.row h3{margin:0 0 12px;font-size:.85rem;color:var(--muted);font-weight:600}
.pair{display:grid;gap:16px;grid-template-columns:1fr}@media(min-width:900px){.pair{grid-template-columns:1fr 1fr}}
figure{margin:0;min-width:0}figcaption{display:flex;gap:8px;align-items:center;margin-bottom:8px}
.tag{font-size:.75rem;font-weight:600;padding:2px 10px;border-radius:999px;color:#fff}.tag--before{background:var(--before)}.tag--after{background:var(--after)}
.count{font-size:.75rem;font-weight:600}.count.good{color:var(--good)}.count.bad{color:var(--bad)}
img{width:100%;max-height:900px;object-fit:cover;object-position:top;border:1px solid var(--border);border-radius:10px;display:block;background:#fff}
.none{height:160px;display:grid;place-items:center;border:1px dashed var(--border);border-radius:10px;color:var(--muted)}
</style></head><body><div class="wrap">
<header><div><p style="margin:0;color:var(--muted)">Laporan desain</p><h1>${esc(a.title)}</h1></div>
<div class="kpis"><div class="kpi"><span>Masalah sebelum</span><b>${totalB}</b></div><div class="kpi"><span>Masalah sesudah</span><b style="color:${totalA <= totalB ? 'var(--good)' : 'var(--bad)'}">${totalA}</b></div><div class="kpi"><span>Halaman × ukuran</span><b>${names.length}</b></div></div></header>
${notes ? `<div class="notes">${notes}</div>` : ''}
${sections}
<p style="color:var(--muted);font-size:.8rem;margin-top:40px">Klik gambar untuk ukuran penuh. Jumlah masalah dari responsive_check.js (overflow, tabrakan, teks terpotong, alignment, teks, aksesibilitas, performa).</p>
</div></body></html>`;
fs.writeFileSync(path.join(a.out, 'index.html'), html);
console.log(`Report: ${path.resolve(a.out, 'index.html')} — ${names.length} screenshot pair(s), issues ${totalB} → ${totalA}`);
