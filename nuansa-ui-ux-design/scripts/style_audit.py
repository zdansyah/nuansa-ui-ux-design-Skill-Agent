#!/usr/bin/env python3
"""Measure how fragmented a project's styling is, to plan token consolidation.

Usage:
    python style_audit.py <project-root> [--json] [--top 15]

Reports:
  - unique colors (hex / rgb / hsl) with usage counts and near-duplicate clusters
  - unique font-size values
  - unique spacing values (margin/padding/gap) that are off a 4px grid
  - inline style="" attributes per file
  - !important count
  - Tailwind arbitrary values (e.g. text-[13px], bg-[#3a7bd5])
  - stylesheets / CSS frameworks referenced (to spot duplicates like Bootstrap + Tailwind)
Skips node_modules, vendor, build output and minified files.
"""
import argparse
import json
import os
import re
from collections import Counter, defaultdict

STYLE_EXTS = {".css", ".scss", ".sass", ".less", ".styl", ".pcss"}
MARKUP_EXTS = {
    ".html", ".htm", ".php", ".twig", ".jinja", ".jinja2", ".j2", ".njk", ".hbs", ".erb",
    ".ejs", ".vue", ".svelte", ".astro", ".jsx", ".tsx", ".js", ".ts", ".cshtml", ".liquid",
}
SKIP_DIRS = {
    "node_modules", "vendor", "bower_components", "dist", "build", "out", ".next", ".nuxt",
    ".svelte-kit", ".output", "coverage", ".git", "storage", "__pycache__", ".venv", "venv", ".cache",
}

HEX_RE = re.compile(r"#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b")
FUNC_COLOR_RE = re.compile(r"\b(?:rgba?|hsla?)\([^)]*\)")
FONT_SIZE_RE = re.compile(r"font-size\s*:\s*([^;}{\"'\n]+)")
SPACING_RE = re.compile(r"\b(?:margin|padding|gap|row-gap|column-gap)(?:-(?:top|right|bottom|left|inline|block))?\s*:\s*([^;}{\"'\n]+)")
PX_RE = re.compile(r"(-?\d*\.?\d+)px")
IMPORTANT_RE = re.compile(r"!important")
INLINE_STYLE_RE = re.compile(r"\sstyle\s*=\s*[\"'{]")
TW_ARBITRARY_RE = re.compile(r"\b[a-z-]+-\[[^\]\s]+\]")
FRAMEWORK_HINTS = {
    "bootstrap": re.compile(r"bootstrap(?:\.min)?\.(?:css|js)|from ['\"]bootstrap|@import ['\"].*bootstrap", re.I),
    "tailwind": re.compile(r"@tailwind|tailwindcss|cdn\.tailwindcss", re.I),
    "bulma": re.compile(r"bulma(?:\.min)?\.css|@import ['\"].*bulma", re.I),
    "foundation": re.compile(r"foundation(?:\.min)?\.css", re.I),
    "materialize": re.compile(r"materialize(?:\.min)?\.css", re.I),
    "font-awesome": re.compile(r"font-?awesome", re.I),
    "jquery-ui": re.compile(r"jquery-ui(?:\.min)?\.css", re.I),
    "adminlte": re.compile(r"adminlte", re.I),
}


def norm_hex(h):
    h = h.lower().lstrip("#")
    if len(h) in (3, 4):
        h = "".join(c * 2 for c in h)
    return "#" + h[:6]


def hex_to_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def rgb_func_to_hex(s):
    m = re.match(r"rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)", s)
    if not m:
        return None
    r, g, b = (min(255, int(x)) for x in m.groups())
    return "#%02x%02x%02x" % (r, g, b)


def cluster_colors(counter, threshold=24):
    """Greedy cluster of hex colors whose RGB distance is below threshold."""
    items = sorted(counter.items(), key=lambda kv: -kv[1])
    clusters = []
    for color, n in items:
        rgb = hex_to_rgb(color)
        for c in clusters:
            if sum((a - b) ** 2 for a, b in zip(rgb, c["rgb"])) ** 0.5 < threshold:
                c["members"].append((color, n))
                break
        else:
            clusters.append({"rgb": rgb, "members": [(color, n)]})
    return [c["members"] for c in clusters if len(c["members"]) > 1]


def walk(root):
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for name in filenames:
            if ".min." in name:
                continue
            ext = os.path.splitext(name)[1].lower()
            if ext in STYLE_EXTS or ext in MARKUP_EXTS:
                yield os.path.join(dirpath, name), ext


def audit(root):
    colors = Counter()
    func_colors = Counter()
    font_sizes = Counter()
    off_grid = Counter()
    spacing_values = Counter()
    important = Counter()
    inline_styles = Counter()
    tw_arbitrary = Counter()
    frameworks = defaultdict(set)
    files_scanned = 0

    for path, ext in walk(root):
        try:
            with open(path, encoding="utf-8", errors="ignore") as fh:
                text = fh.read()
        except OSError:
            continue
        if len(text) > 2_000_000:
            continue
        files_scanned += 1
        rel = os.path.relpath(path, root)
        is_style = ext in STYLE_EXTS
        # Colors: in stylesheets everywhere; in markup only inside style attrs/blocks or class strings.
        scope = text if is_style else ";\n".join(
            re.findall(r"<style[^>]*>(.*?)</style>", text, re.S | re.I)
            + re.findall(r"style\s*=\s*\"([^\"]*)\"", text)
            + re.findall(r"style\s*=\s*'([^']*)'", text)
            + re.findall(r"class(?:Name)?\s*=\s*[\"'`]([^\"'`]*)[\"'`]", text)
        )
        for h in HEX_RE.findall(scope):
            colors[norm_hex(h)] += 1
        for f in FUNC_COLOR_RE.findall(scope):
            func_colors[re.sub(r"\s+", "", f.lower())] += 1
            hx = rgb_func_to_hex(f)
            if hx:
                colors[hx] += 1
        for v in FONT_SIZE_RE.findall(scope):
            font_sizes[v.strip()] += 1
        for v in SPACING_RE.findall(scope):
            for px in PX_RE.findall(v):
                val = float(px)
                spacing_values[f"{px}px"] += 1
                if val not in (0, 1, 2) and val % 4 != 0:
                    off_grid[f"{px}px"] += 1
        imp = len(IMPORTANT_RE.findall(scope))
        if imp:
            important[rel] += imp
        if not is_style:
            n = len(INLINE_STYLE_RE.findall(text))
            if n:
                inline_styles[rel] += n
            for m in TW_ARBITRARY_RE.findall(scope):
                tw_arbitrary[m] += 1
        for fw, rx in FRAMEWORK_HINTS.items():
            if rx.search(text):
                frameworks[fw].add(rel)

    return {
        "files_scanned": files_scanned,
        "unique_colors": len(colors),
        "colors": colors.most_common(),
        "near_duplicate_color_clusters": cluster_colors(colors),
        "unique_font_sizes": len(font_sizes),
        "font_sizes": font_sizes.most_common(),
        "unique_spacing_px_values": len(spacing_values),
        "off_grid_spacing": off_grid.most_common(),
        "important_total": sum(important.values()),
        "important_by_file": important.most_common(),
        "inline_style_total": sum(inline_styles.values()),
        "inline_styles_by_file": inline_styles.most_common(),
        "tailwind_arbitrary_values": tw_arbitrary.most_common(),
        "frameworks": {k: sorted(v)[:10] for k, v in frameworks.items()},
    }


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("root", nargs="?", default=".")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--top", type=int, default=15)
    args = ap.parse_args()
    r = audit(args.root)
    if args.json:
        print(json.dumps(r, indent=2))
        return

    t = args.top
    print(f"Style audit — {r['files_scanned']} files scanned\n")
    print(f"Colors: {r['unique_colors']} unique (target: ~10–16 incl. neutrals + semantic)")
    for c, n in r["colors"][:t]:
        print(f"  {c}  ×{n}")
    if r["near_duplicate_color_clusters"]:
        print("  Near-duplicates (merge each group into one token):")
        for group in r["near_duplicate_color_clusters"][:t]:
            print("   - " + ", ".join(f"{c}×{n}" for c, n in group))
    print(f"\nFont sizes: {r['unique_font_sizes']} unique (target: ≤ 6–8 steps)")
    for v, n in r["font_sizes"][:t]:
        print(f"  {v}  ×{n}")
    print(f"\nSpacing: {r['unique_spacing_px_values']} unique px values; off the 4px grid:")
    for v, n in r["off_grid_spacing"][:t]:
        print(f"  {v}  ×{n}")
    print(f"\n!important: {r['important_total']}")
    for f, n in r["important_by_file"][:t]:
        print(f"  {f}  ×{n}")
    print(f"\nInline style attributes: {r['inline_style_total']}")
    for f, n in r["inline_styles_by_file"][:t]:
        print(f"  {f}  ×{n}")
    if r["tailwind_arbitrary_values"]:
        print(f"\nTailwind arbitrary values: {len(r['tailwind_arbitrary_values'])} unique")
        for v, n in r["tailwind_arbitrary_values"][:t]:
            print(f"  {v}  ×{n}")
    if r["frameworks"]:
        print("\nFrameworks/libraries referenced:")
        for fw, files in r["frameworks"].items():
            print(f"  {fw}: {', '.join(files[:3])}{' …' if len(files) > 3 else ''}")
        css_fw = [f for f in r["frameworks"] if f in ("bootstrap", "tailwind", "bulma", "foundation", "materialize")]
        if len(css_fw) > 1:
            print(f"  ⚠ Multiple CSS frameworks ({', '.join(css_fw)}) — pick one as the base.")


if __name__ == "__main__":
    main()
