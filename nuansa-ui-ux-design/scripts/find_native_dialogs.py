#!/usr/bin/env python3
"""Find native browser dialog calls (alert, confirm, prompt) in a project.

Usage:
    python find_native_dialogs.py <project-root> [--all] [--json] [--include-vendor]

--all also reports other browser/OS-native UI that breaks a consistent design:
beforeunload "Leave site?" dialogs, window.open popups, title="" tooltips on buttons/links,
and unstyled native controls (file inputs, selects, date pickers) — each with its fix.

Scans JS/TS/JSX/TSX/Vue/Svelte/HTML/PHP/Blade/Twig/Jinja/ERB templates. Skips
node_modules, vendor, build output and minified files unless --include-vendor is given.
Reports each call with file, line, kind and a hint for the async replacement.
Exit code: 0 when nothing is found, 1 when calls are found (handy in CI).
"""
import argparse
import json
import os
import re
import sys

EXTS = {
    ".js", ".mjs", ".cjs", ".jsx", ".ts", ".tsx", ".vue", ".svelte", ".astro",
    ".html", ".htm", ".php", ".twig", ".jinja", ".jinja2", ".j2", ".njk", ".hbs",
    ".erb", ".ejs", ".cshtml", ".razor", ".liquid",
}
SKIP_DIRS = {
    "node_modules", "vendor", "bower_components", "dist", "build", "out", ".next",
    ".nuxt", ".svelte-kit", ".output", "coverage", ".git", "public/build", "storage",
    "__pycache__", ".venv", "venv", ".cache",
}
# Match alert( / confirm( / prompt( as a call, optionally prefixed with window. or self.
# Exclude method calls on other objects (e.g. UI.confirm(, Swal.confirm(, this.prompt( )
# and declarations (function confirm(…)).
CALL_RE = re.compile(
    r"(?<![\w$.])(?:window\.|self\.|globalThis\.)?(alert|confirm|prompt)\s*\(",
)
DECL_RE = re.compile(r"(?:function|def|const|let|var)\s+(?:alert|confirm|prompt)\b")
HINTS = {
    "alert": "UI.toast(msg, { type }) — or `await UI.alert(msg)` if later code must wait",
    "confirm": "`if (await UI.confirm({...}))` in an async function, or data-confirm=\"…\" on links/forms",
    "prompt": "`const v = await UI.prompt({ title, label, defaultValue })` (null on cancel)",
}


EXTRA = [
    ("beforeunload", re.compile(r"onbeforeunload|['\"]beforeunload['\"]"),
     "native 'Leave site?' dialog — use <form data-unsaved-guard> (ui-feedback.js) for in-app links; keep beforeunload only for real data loss"),
    ("window.open", re.compile(r"window\.open\s*\("),
     "popup window — prefer an in-page modal/drawer, or a normal link with target=_blank"),
    ("title-tooltip", re.compile(r"<(?:a|button)\b[^>]*\stitle\s*=\s*[\"'][^\"']+", re.I),
     "native yellow tooltip — use data-tooltip=\"…\" (or call UI.upgradeTooltips()) + aria-label for icon-only buttons"),
    ("file-input", re.compile(r"<input\b[^>]*type\s*=\s*[\"']file", re.I),
     "OS 'Choose File' button — load ui-controls.css (styles ::file-selector-button) or build a dropzone"),
    ("select", re.compile(r"<select\b", re.I),
     "OS-styled select — load ui-controls.css (custom chevron); keep native for accessibility/mobile"),
    ("date-input", re.compile(r"<input\b[^>]*type\s*=\s*[\"'](?:date|time|datetime-local|month|week)", re.I),
     "native date picker — fine on mobile; ui-controls.css tints it; use a design-system picker only if required"),
    ("checkbox-radio", re.compile(r"<input\b[^>]*type\s*=\s*[\"'](?:checkbox|radio)", re.I),
     "OS-styled checkbox/radio — load ui-controls.css"),
]


def is_minified(path, sample):
    if ".min." in os.path.basename(path):
        return True
    lines = sample.splitlines() or [""]
    return max(len(l) for l in lines) > 1000 and len(lines) < 20


def strip_line_comment(line):
    # Cheap heuristic: ignore text after // or within <!-- --> on the same line.
    out = re.sub(r"<!--.*?-->", "", line)
    idx = out.find("//")
    if idx != -1 and not re.search(r"https?:$", out[:idx]):
        out = out[:idx]
    return out


def scan(root, include_vendor=False, extra=False):
    results = []
    others = []
    for dirpath, dirnames, filenames in os.walk(root):
        rel_dir = os.path.relpath(dirpath, root).replace(os.sep, "/")
        if not include_vendor:
            dirnames[:] = [
                d for d in dirnames
                if d not in SKIP_DIRS and f"{rel_dir}/{d}".lstrip("./") not in SKIP_DIRS
            ]
        for name in filenames:
            ext = os.path.splitext(name)[1].lower()
            if name.endswith(".blade.php"):
                ext = ".php"
            if ext not in EXTS:
                continue
            path = os.path.join(dirpath, name)
            try:
                with open(path, encoding="utf-8", errors="ignore") as fh:
                    text = fh.read()
            except OSError:
                continue
            if not include_vendor and is_minified(path, text[:20000]):
                continue
            in_block = False
            for lineno, raw in enumerate(text.splitlines(), 1):
                line = raw
                if in_block:
                    end = line.find("*/")
                    if end == -1:
                        continue
                    line = line[end + 2:]
                    in_block = False
                start = line.find("/*")
                if start != -1 and line.find("*/", start) == -1:
                    line = line[:start]
                    in_block = True
                line = re.sub(r"/\*.*?\*/", "", line)
                line = strip_line_comment(line)
                if extra:
                    for kind, rx, hint in EXTRA:
                        if rx.search(line):
                            others.append({"file": os.path.relpath(path, root), "line": lineno, "kind": kind, "code": raw.strip()[:160], "hint": hint})
                if DECL_RE.search(line):
                    continue
                for m in CALL_RE.finditer(line):
                    kind = m.group(1)
                    results.append({
                        "file": os.path.relpath(path, root),
                        "line": lineno,
                        "kind": kind,
                        "code": raw.strip()[:200],
                        "inline_handler": bool(re.search(r"\bon\w+\s*=\s*[\"'][^\"']*" + kind, raw)),
                        "hint": HINTS[kind],
                    })
    return (results, others) if extra else results


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("root", nargs="?", default=".")
    ap.add_argument("--json", action="store_true", help="output JSON")
    ap.add_argument("--include-vendor", action="store_true", help="also scan vendor/minified/build files")
    ap.add_argument("--all", action="store_true", help="also report other native UI (beforeunload, popups, title tooltips, unstyled controls)")
    args = ap.parse_args()

    others = []
    if args.all:
        results, others = scan(args.root, args.include_vendor, extra=True)
    else:
        results = scan(args.root, args.include_vendor)
    if args.json:
        print(json.dumps({"total": len(results), "results": results, "other_native_ui": others}, indent=2))
    else:
        if not results:
            print("No native alert/confirm/prompt calls found.")
        else:
            counts = {}
            for r in results:
                counts[r["kind"]] = counts.get(r["kind"], 0) + 1
            print(f"Found {len(results)} native dialog call(s): " + ", ".join(f"{k}={v}" for k, v in sorted(counts.items())))
            print()
            current = None
            for r in results:
                if r["file"] != current:
                    current = r["file"]
                    print(current)
                tag = " [inline handler]" if r["inline_handler"] else ""
                print(f"  L{r['line']:<5} {r['kind']:<8}{tag} {r['code']}")
            print()
            print("Replacement hints:")
            for k in sorted(counts):
                print(f"  {k:<8} → {HINTS[k]}")
            print("  inline `onclick=\"return confirm(...)\"` → remove handler, add data-confirm=\"...\" (ui-feedback.js handles it)")
        if args.all:
            print()
            if not others:
                print("Other native UI: none found.")
            else:
                by = {}
                for o in others:
                    by.setdefault(o["kind"], []).append(o)
                print(f"Other native UI ({len(others)}):")
                for kind, items in by.items():
                    print(f"  {kind} ×{len(items)} → {items[0]['hint']}")
                    for o in items[:5]:
                        print(f"    {o['file']}:{o['line']}  {o['code'][:110]}")
                    if len(items) > 5:
                        print(f"    … {len(items) - 5} more")
            print("  Browser validation bubbles (required/pattern/type=email) are handled automatically by ui-feedback.js.")
    sys.exit(1 if results else 0)


if __name__ == "__main__":
    main()
