#!/usr/bin/env python3
"""Generate a living style guide page from a project's design tokens and component CSS.

Usage:
    python make_styleguide.py --tokens css/tokens.css [--css css/components.css css/app.css ...]
                              [--out public/styleguide.html] [--title "Design System Toko Maju"]

Reads every CSS custom property declared on :root / html (and notes a dark theme if
[data-theme="dark"] or prefers-color-scheme: dark overrides exist), then renders:
  colors (live swatches using var(), so theme changes show instantly), typography scale,
  spacing scale, radius, shadows, and component samples (buttons, form field with error,
  badges, chips, card, table, switch, progress, toast, empty state) using the class names
  from references/components.md. Edit the samples at the bottom of the generated file if the
  project's class names differ.

The page links the given stylesheets by relative path, so it always reflects the real CSS.
Ship it at /styleguide (or keep it in docs/) and update it whenever tokens or components change.
"""
import argparse
import html
import os
import re

ROOT_BLOCK = re.compile(r"(?:^|})\s*(?::root|html)(?:\s*,\s*(?::root|html))*\s*\{([^}]*)\}", re.S)
VAR = re.compile(r"(--[\w-]+)\s*:\s*([^;]+);")
DARK = re.compile(r"data-theme=[\"']?dark|prefers-color-scheme:\s*dark")


def parse(files):
    tokens, dark = {}, False
    for f in files:
        try:
            css = open(f, encoding="utf-8").read()
        except OSError:
            continue
        css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
        if DARK.search(css):
            dark = True
        for block in ROOT_BLOCK.findall(css):
            for name, value in VAR.findall(block):
                tokens.setdefault(name, value.strip())
    return tokens, dark


def group(tokens):
    g = {k: [] for k in ("color", "font", "size", "space", "radius", "shadow", "other")}
    for name, value in tokens.items():
        n = name.lower()
        if n.startswith(("--color", "--cat-", "--chart", "--glass")) or re.match(r"^#|^rgb|^hsl|^oklch", value):
            g["color"].append((name, value))
        elif n.startswith(("--font", "--ff")):
            g["font"].append((name, value))
        elif n.startswith(("--text-", "--fs-")):
            g["size"].append((name, value))
        elif n.startswith(("--space", "--sp-", "--gap", "--gutter")):
            g["space"].append((name, value))
        elif n.startswith("--radius"):
            g["radius"].append((name, value))
        elif n.startswith("--shadow"):
            g["shadow"].append((name, value))
        else:
            g["other"].append((name, value))
    return g


def e(s):
    return html.escape(str(s), quote=True)


def render(tokens, dark, links, title):
    g = group(tokens)
    colors = "".join(
        f'<div class="sg-swatch"><div class="sg-chip" style="background:var({e(n)})"></div><code>{e(n)}</code><small>{e(v)}</small></div>'
        for n, v in g["color"]
    ) or '<p class="sg-muted">Tidak ada token warna (--color-*).</p>'
    fonts = "".join(
        f'<div class="sg-row"><code>{e(n)}</code><span style="font-family:var({e(n)});font-size:1.5rem">Aa Bb 0123 — Rapi &amp; bersih</span></div>'
        for n, v in g["font"]
    )
    sizes = "".join(
        f'<div class="sg-row"><code>{e(n)}</code><span style="font-size:var({e(n)});line-height:1.2">Judul contoh</span><small>{e(v)}</small></div>'
        for n, v in g["size"]
    )
    spaces = "".join(
        f'<div class="sg-row"><code>{e(n)}</code><span class="sg-bar" style="width:var({e(n)})"></span><small>{e(v)}</small></div>'
        for n, v in g["space"]
    )
    radii = "".join(
        f'<div class="sg-swatch"><div class="sg-box" style="border-radius:var({e(n)})"></div><code>{e(n)}</code><small>{e(v)}</small></div>'
        for n, v in g["radius"]
    )
    shadows = "".join(
        f'<div class="sg-swatch"><div class="sg-box" style="box-shadow:var({e(n)});border:0"></div><code>{e(n)}</code></div>'
        for n, v in g["shadow"]
    )
    others = "".join(f"<tr><td><code>{e(n)}</code></td><td><code>{e(v)}</code></td></tr>" for n, v in g["other"])
    link_tags = "\n".join(f'<link rel="stylesheet" href="{e(h)}">' for h in links)
    toggle = '<button class="sg-toggle" type="button" onclick="var d=document.documentElement;d.dataset.theme=d.dataset.theme===\'dark\'?\'light\':\'dark\'">Terang / Gelap</button>' if dark else ""
    section = lambda t, body, cls="": f'<section class="sg-section"><h2>{t}</h2><div class="{cls}">{body}</div></section>' if body else ""
    return f"""<!doctype html>
<html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(title)}</title>
{link_tags}
<style>
/* Style-guide chrome only; everything inside the samples comes from the project's CSS. */
.sg {{ max-width: 1120px; margin: 0 auto; padding: 32px 16px 96px; font-family: var(--font-sans, system-ui, sans-serif); color: var(--color-text, #111); }}
.sg header {{ display:flex; flex-wrap:wrap; gap:16px; justify-content:space-between; align-items:flex-end; margin-bottom:24px; }}
.sg h1 {{ margin:0; font-size: clamp(1.8rem, 1.2rem + 2vw, 2.6rem); letter-spacing:-.02em; }}
.sg h2 {{ font-size:1.1rem; margin:0 0 16px; }}
.sg-section {{ margin-top:40px; padding-top:24px; border-top:1px solid var(--color-border, #e5e7eb); }}
.sg-grid {{ display:grid; gap:16px; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }}
.sg-swatch {{ display:grid; gap:4px; min-width:0; }} .sg-swatch code, .sg-row code {{ font-size:12px; overflow-wrap:anywhere; }}
.sg-swatch small, .sg-row small, .sg-muted {{ color: var(--color-text-muted, #6b7280); font-size:12px; overflow-wrap:anywhere; }}
.sg-chip {{ height:64px; border-radius:12px; border:1px solid rgb(0 0 0 / .08); }}
.sg-box {{ height:72px; background: var(--color-surface, #fff); border:1px solid var(--color-border-strong, #cbd5e1); }}
.sg-row {{ display:grid; grid-template-columns: 180px 1fr auto; gap:16px; align-items:center; padding:8px 0; border-bottom:1px dashed var(--color-border, #e5e7eb); min-width:0; }}
.sg-bar {{ display:block; height:12px; border-radius:4px; background: var(--color-primary, #2563eb); }}
.sg-samples {{ display:grid; gap:24px; }} .sg-sample {{ display:flex; flex-wrap:wrap; gap:12px; align-items:center; }}
.sg-toggle {{ height:36px; padding:0 14px; border-radius:999px; border:1px solid var(--color-border-strong, #cbd5e1); background: var(--color-surface, #fff); color: inherit; cursor:pointer; font:inherit; }}
.sg table.sg-tokens {{ width:100%; border-collapse:collapse; font-size:13px; }} .sg table.sg-tokens td {{ padding:6px 8px; border-bottom:1px solid var(--color-border, #e5e7eb); }}
@media (max-width: 640px) {{ .sg-row {{ grid-template-columns: 1fr; gap:4px; }} }}
</style></head>
<body><main class="sg">
<header><div><p class="sg-muted" style="margin:0">Style guide · {len(tokens)} token</p><h1>{e(title)}</h1></div>{toggle}</header>
{section("Warna", colors, "sg-grid")}
{section("Font", fonts)}
{section("Skala ukuran teks", sizes)}
{section("Spacing", spaces)}
{section("Radius", radii, "sg-grid")}
{section("Shadow", shadows, "sg-grid")}
<section class="sg-section"><h2>Komponen</h2>
<!-- Samples use the class names from references/components.md. Edit to match the project. -->
<div class="sg-samples">
  <div class="sg-sample">
    <button class="btn btn--primary">Simpan</button><button class="btn btn--secondary">Batal</button>
    <button class="btn btn--ghost">Detail</button><button class="btn btn--danger">Hapus</button>
    <button class="btn btn--primary btn--sm">Kecil</button><button class="btn btn--primary" disabled>Nonaktif</button>
  </div>
  <div class="sg-sample">
    <span class="badge">Draf</span><span class="badge badge--success">Aktif</span><span class="badge badge--warning">Menunggu</span>
    <span class="badge badge--danger">Ditolak</span><span class="badge badge--info">Baru</span>
  </div>
  <div class="sg-sample chips" role="tablist"><button class="chip" aria-selected="true">Semua</button><button class="chip">Aktif</button><button class="chip">Selesai</button></div>
  <div class="sg-sample" style="display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));align-items:start">
    <div class="field"><label class="field__label" for="sg-email">Email</label><input class="input" id="sg-email" placeholder="nama@contoh.id"><p class="field__hint">Dipakai untuk login.</p></div>
    <div class="field has-error"><label class="field__label" for="sg-hp">No. HP</label><input class="input" id="sg-hp" value="08x" aria-invalid="true"><p class="field__error">Nomor HP tidak valid.</p></div>
    <div class="field"><label class="field__label" for="sg-kat">Kategori</label><select class="select" id="sg-kat"><option>Pakaian</option></select></div>
  </div>
  <div class="sg-sample"><label class="switch"><input type="checkbox" role="switch" checked><span class="switch__track"></span><span>Notifikasi</span></label>
    <label><input type="checkbox" checked> Setuju</label><label><input type="radio" name="sg-r" checked> Satu</label></div>
  <div class="sg-sample" style="display:block"><div class="progress" role="progressbar" aria-valuenow="68" aria-valuemin="0" aria-valuemax="100" aria-label="Contoh"><div class="progress__fill" style="--value:68%">68%</div></div></div>
  <section class="card" style="max-width:420px"><header class="card__header"><h3 class="card__title">Ringkasan</h3><button class="btn btn--ghost btn--sm">Lihat</button></header>
    <div class="card__body"><p class="stat__label">Pendapatan bulan ini</p><p class="stat__value">Rp12.450.000</p></div></section>
  <div class="table-wrap"><table class="table"><thead><tr><th>Nama</th><th>Status</th><th class="num">Total</th></tr></thead>
    <tbody><tr><td>Budi Santoso</td><td><span class="badge badge--success">Aktif</span></td><td class="num">Rp1.250.000</td></tr>
    <tr><td>Sari Wulandari</td><td><span class="badge badge--warning">Menunggu</span></td><td class="num">Rp480.000</td></tr></tbody></table></div>
</div></section>
{('<section class="sg-section"><h2>Token lain</h2><table class="sg-tokens">' + others + '</table></section>') if others else ''}
</main></body></html>
"""


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--tokens", nargs="+", required=True, help="CSS file(s) declaring the tokens")
    ap.add_argument("--css", nargs="*", default=[], help="extra stylesheets (components, app) to link")
    ap.add_argument("--out", default="styleguide.html")
    ap.add_argument("--title", default="Design System")
    args = ap.parse_args()
    tokens, dark = parse(args.tokens + args.css)
    out_dir = os.path.dirname(os.path.abspath(args.out))
    links = []
    for f in args.tokens + args.css:
        rel = os.path.relpath(os.path.abspath(f), out_dir).replace(os.sep, "/")
        if rel not in links:
            links.append(rel)
    with open(args.out, "w", encoding="utf-8") as fh:
        fh.write(render(tokens, dark, links, args.title))
    g = group(tokens)
    print(f"Style guide written to {args.out}: {len(tokens)} tokens "
          f"({len(g['color'])} colors, {len(g['size'])} type sizes, {len(g['space'])} spacing, {len(g['radius'])} radius, {len(g['shadow'])} shadows)"
          f"{', dark theme toggle' if dark else ''}")


if __name__ == "__main__":
    main()
