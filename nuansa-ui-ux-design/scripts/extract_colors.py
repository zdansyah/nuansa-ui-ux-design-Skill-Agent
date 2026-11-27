#!/usr/bin/env python3
"""Extract a usable palette from a logo, screenshot or reference image.

Usage:
    python extract_colors.py <image> [--count 6] [--json]

Prints the dominant colors with their share, then suggests:
  primary   - the main brand/accent color (most common saturated color)
  secondary - a second chromatic color with a clearly different hue (for "dua warna")
  ink       - the darkest color, for text and black buttons
  canvas    - the most common light neutral, for backgrounds
and a CSS token snippet with contrast notes (which text color works on the primary,
whether the primary is readable as text on white). Transparent pixels (logos) are ignored.
Requires Pillow (`pip install pillow`).
"""
import argparse
import colorsys
import json
import sys

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow is required: pip install pillow")


def hex_of(rgb):
    return "#%02x%02x%02x" % tuple(int(round(c)) for c in rgb)


def luminance(rgb):
    def ch(c):
        c /= 255
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = (ch(c) for c in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(a, b):
    la, lb = luminance(a), luminance(b)
    return (max(la, lb) + 0.05) / (min(la, lb) + 0.05)


def hls(rgb):
    h, l, s = colorsys.rgb_to_hls(*(c / 255 for c in rgb))
    return h * 360, l, s


def darken_until(rgb, target, against=(255, 255, 255)):
    c = list(rgb)
    for _ in range(40):
        if contrast(c, against) >= target:
            break
        c = [v * 0.94 for v in c]
    return tuple(c)


def palette(path, count):
    img = Image.open(path)
    img = img.convert("RGBA")
    img.thumbnail((240, 240))
    getter = getattr(img, "get_flattened_data", None) or img.getdata  # Pillow ≥ 12 renamed getdata
    px = [p[:3] for p in getter() if p[3] > 128]
    if not px:
        sys.exit("No opaque pixels found.")
    flat = Image.new("RGB", (len(px), 1))
    flat.putdata(px)
    q = flat.quantize(colors=max(count * 3, 12), method=Image.Quantize.MEDIANCUT)
    pal = q.getpalette()
    counts = sorted(q.getcolors(), reverse=True)
    total = sum(c for c, _ in counts)
    colors = []
    for n, idx in counts:
        rgb = tuple(pal[idx * 3: idx * 3 + 3])
        # merge near-duplicates
        for c in colors:
            if sum((a - b) ** 2 for a, b in zip(rgb, c["rgb"])) ** 0.5 < 28:
                c["share"] += n / total
                break
        else:
            colors.append({"rgb": rgb, "share": n / total})
    colors.sort(key=lambda c: -c["share"])
    for c in colors:
        h, l, s = hls(c["rgb"])
        c.update(hex=hex_of(c["rgb"]), hue=round(h), lightness=round(l, 2), saturation=round(s, 2),
                 neutral=s < 0.18 or l < 0.08 or l > 0.95)
    return colors


def suggest(colors):
    chroma = [c for c in colors if not c["neutral"] and 0.2 < c["lightness"] < 0.85]
    chroma.sort(key=lambda c: -(c["share"] * (0.5 + c["saturation"])))
    primary = chroma[0] if chroma else None
    secondary = None
    if primary:
        for c in chroma[1:]:
            d = abs(c["hue"] - primary["hue"]) % 360
            if min(d, 360 - d) > 40 and c["share"] > 0.01:
                secondary = c
                break
    ink = min(colors, key=lambda c: luminance(c["rgb"]))
    lights = [c for c in colors if c["lightness"] > 0.88]
    canvas = max(lights, key=lambda c: c["share"]) if lights else None
    return primary, secondary, ink, canvas


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("image")
    ap.add_argument("--count", type=int, default=6)
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()
    colors = palette(a.image, a.count)[: max(a.count, 3)]
    primary, secondary, ink, canvas = suggest(palette(a.image, a.count))
    white, black = (255, 255, 255), (0, 0, 0)
    out = {"colors": [{k: c[k] for k in ("hex", "share", "hue", "lightness", "saturation", "neutral")} for c in colors]}
    if primary:
        p = primary["rgb"]
        on = "#ffffff" if contrast(p, white) >= contrast(p, black) else "#111111"
        text_safe = hex_of(darken_until(p, 4.5))
        out["suggested"] = {
            "primary": primary["hex"], "on_primary": on, "primary_text_on_white": text_safe,
            "secondary": secondary["hex"] if secondary else None,
            "ink": ink["hex"] if ink and luminance(ink["rgb"]) < 0.08 else "#111214",
            "canvas": canvas["hex"] if canvas else "#f6f7f9",
            "contrast": {"primary_vs_white": round(contrast(p, white), 2), "primary_vs_black": round(contrast(p, black), 2)},
        }
    if a.json:
        print(json.dumps(out, indent=2))
        return
    print(f"Dominant colors in {a.image}:")
    for c in out["colors"]:
        bar = "█" * max(1, int(c["share"] * 40))
        print(f"  {c['hex']}  {c['share'] * 100:5.1f}%  {'neutral ' if c['neutral'] else 'color   '}{bar}")
    s = out.get("suggested")
    if not s:
        print("\nNo clear brand color (image is neutral). Suggest: monochrome style (hitam-putih), ink #111214.")
        return
    print("\nSuggested roles:")
    print(f"  primary    {s['primary']}  (vs white {s['contrast']['primary_vs_white']}:1, vs black {s['contrast']['primary_vs_black']}:1)")
    print(f"  on-primary {s['on_primary']}  (text on primary buttons)")
    if s["primary_text_on_white"] != s["primary"]:
        print(f"  text-safe  {s['primary_text_on_white']}  (primary darkened for links/text on white, 4.5:1)")
    print(f"  secondary  {s['secondary'] or '— (single-color brand; use tints of primary, or pick a pairing)'}")
    print(f"  ink        {s['ink']}")
    print(f"  canvas     {s['canvas']}")
    print("\nCSS tokens:")
    print(f"  --color-primary: {s['primary']};\n  --color-on-primary: {s['on_primary']};\n  --color-primary-text: {s['primary_text_on_white']};")
    if s["secondary"]:
        print(f"  --color-secondary: {s['secondary']};")
    print(f"  --color-ink: {s['ink']};\n  --color-bg: {s['canvas']};")
    print(f"\nRuntime: Theme.apply({{ primary: '{s['primary']}'{', secondary: ' + repr(s['secondary']) if s['secondary'] else ''}, palette: 'solid' }})")


if __name__ == "__main__":
    main()
