# Design Tokens

Tokens are the single source of truth for visual decisions. Every color, size, radius and
shadow in components should reference a token, so re-theming is a one-file change.

Pick the variant that matches the project's stack. Don't install a new framework just to
hold tokens.

## Contents
- Naming rules
- Plain CSS (custom properties) — default
- Dark mode
- Tailwind
- Bootstrap 5 (Sass or CSS variables)
- Deriving a palette from an existing brand color
- Consolidating messy existing values

---

## Naming rules

- Name by **role**, not value: `--color-primary`, `--color-text-muted`, `--color-border`,
  not `--blue-500` in components. Raw scales (`--gray-100…900`) may exist, but components
  should use semantic tokens that point at them.
- Keep the set small. Every extra token is another decision someone has to make later.

## Plain CSS (custom properties) — default

Create `tokens.css` (or `styles/tokens.css`, `resources/css/tokens.css`, etc.) and load it
before all other styles.

```css
:root {
  /* ---- Brand (change these to re-theme) ---- */
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  --color-primary-soft: #eff6ff;     /* tinted backgrounds, selected rows */
  --color-on-primary: #ffffff;
  --color-primary-text: #1d4ed8;     /* accent as TEXT on surfaces (links); theme.js derives it */
  --color-ink: #0f172a;              /* near-black for strong emphasis (Mono/Bento presets) */
  --color-on-ink: #ffffff;

  /* ---- Neutrals ---- */
  --color-bg: #f8fafc;               /* app background */
  --color-surface: #ffffff;          /* cards, modals, inputs */
  --color-surface-muted: #f1f5f9;    /* table header, hover */
  --color-border: #e2e8f0;
  --color-border-strong: #cbd5e1;
  --color-text: #0f172a;
  --color-text-muted: #64748b;
  --color-text-subtle: #94a3b8;

  /* ---- Semantic ---- */
  --color-success: #16a34a;  --color-success-soft: #f0fdf4;
  --color-warning: #d97706;  --color-warning-soft: #fffbeb;
  --color-danger:  #dc2626;  --color-danger-soft:  #fef2f2;
  --color-info:    #0284c7;  --color-info-soft:    #f0f9ff;

  /* ---- Typography ---- */
  --font-sans: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  --text-xs: 0.75rem;    /* 12 */
  --text-sm: 0.875rem;   /* 14 */
  --text-base: 1rem;     /* 16 */
  --text-lg: 1.125rem;   /* 18 */
  --text-xl: 1.25rem;    /* 20 */
  --text-2xl: 1.5rem;    /* 24 */
  --text-3xl: 1.875rem;  /* 30 */
  --text-4xl: clamp(2rem, 1.5rem + 2vw, 3rem); /* hero */
  --leading-tight: 1.25;
  --leading-normal: 1.6;
  --weight-normal: 400;
  --weight-medium: 500;
  --weight-semibold: 600;

  /* ---- Spacing (4px base) ---- */
  --space-1: 0.25rem;  /* 4 */
  --space-2: 0.5rem;   /* 8 */
  --space-3: 0.75rem;  /* 12 */
  --space-4: 1rem;     /* 16 */
  --space-5: 1.25rem;  /* 20 */
  --space-6: 1.5rem;   /* 24 */
  --space-8: 2rem;     /* 32 */
  --space-10: 2.5rem;  /* 40 */
  --space-12: 3rem;    /* 48 */
  --space-16: 4rem;    /* 64 */

  /* ---- Shape & depth ---- */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-full: 9999px;
  --radius-control: 8px;             /* buttons, inputs, chips; 9999px = pill style */
  --shadow-sm: 0 1px 2px rgb(15 23 42 / 0.06);
  --shadow-md: 0 4px 12px rgb(15 23 42 / 0.08);
  --shadow-lg: 0 12px 32px rgb(15 23 42 / 0.12);
  --ring: 0 0 0 3px rgb(37 99 235 / 0.35);   /* focus ring; match primary */

  /* ---- Layout ---- */
  --container-max: 1200px;
  --sidebar-width: 256px;
  --topbar-height: 60px;
  --control-height: 40px;        /* buttons & inputs */
  --control-height-sm: 32px;

  /* ---- Motion & layers ---- */
  --ease: cubic-bezier(0.2, 0, 0, 1);
  --duration: 160ms;
  --z-dropdown: 1000;
  --z-sticky: 1100;
  --z-overlay: 1200;
  --z-modal: 1300;
  --z-toast: 1400;
}

@media (prefers-reduced-motion: reduce) {
  :root { --duration: 0ms; }
}
```

Breakpoints can't be custom properties inside media queries; document them and use them
consistently: `sm 640px`, `md 768px`, `lg 1024px`, `xl 1280px`. Write mobile-first
(`@media (min-width: 768px)`).

### Base layer (pair with tokens)

```css
*, *::before, *::after { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body {
  margin: 0;
  font-family: var(--font-sans);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  color: var(--color-text);
  background: var(--color-bg);
  -webkit-font-smoothing: antialiased;
}
h1, h2, h3, h4 { line-height: var(--leading-tight); font-weight: var(--weight-semibold); margin: 0 0 var(--space-3); }
h1 { font-size: var(--text-3xl); }
h2 { font-size: var(--text-2xl); }
h3 { font-size: var(--text-xl); }
p { margin: 0 0 var(--space-4); }
img, svg, video { max-width: 100%; height: auto; display: block; }
a { color: var(--color-primary-text); text-decoration: none; }
a:hover { text-decoration: underline; }
:focus-visible { outline: none; box-shadow: var(--ring); border-radius: var(--radius-sm); }
input, select, textarea, button { font: inherit; color: inherit; }
.container { width: 100%; max-width: var(--container-max); margin-inline: auto; padding-inline: var(--space-4); }
@media (min-width: 768px) { .container { padding-inline: var(--space-6); } }
```

## Dark mode

Only add if the user wants it or the project already has it (or a theme switcher is in
scope — see `theming.md`). Override semantic tokens only:

```css
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { /* same block as below */ }
}
:root[data-theme="dark"] {
  --color-bg: #0b1120;
  --color-surface: #111827;
  --color-surface-muted: #1f2937;
  --color-border: #1f2937;
  --color-border-strong: #374151;
  --color-text: #e5e7eb;
  --color-text-muted: #9ca3af;
  --color-text-subtle: #6b7280;
  --color-primary-soft: rgb(37 99 235 / 0.15);
  --color-primary-text: #93c5fd;
  --color-ink: #f8fafc;              /* ink flips to near-white in dark mode */
  --color-success-soft: rgb(22 163 74 / 0.16);   /* soft tints must be re-tinted, or badges glow white */
  --color-warning-soft: rgb(217 119 6 / 0.16);
  --color-danger-soft:  rgb(220 38 38 / 0.16);
  --color-info-soft:    rgb(2 132 199 / 0.16);
  --color-success: #4ade80; --color-warning: #fbbf24; --color-danger: #f87171; --color-info: #38bdf8;
  --color-on-ink: #0b1120;
  --shadow-md: 0 4px 12px rgb(0 0 0 / 0.4);
}
```

Because components only use semantic tokens, nothing else changes.

## Tailwind

Map tokens into the theme so utilities and CSS variables stay in sync. Keep the CSS
variables (above) as the source, and point Tailwind at them:

```js
// tailwind.config.js (v3) — for v4, put the same values in @theme { } in CSS
export default {
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: 'var(--color-primary)', hover: 'var(--color-primary-hover)', soft: 'var(--color-primary-soft)' },
        surface: { DEFAULT: 'var(--color-surface)', muted: 'var(--color-surface-muted)' },
        border: 'var(--color-border)',
        muted: 'var(--color-text-muted)',
        success: 'var(--color-success)', warning: 'var(--color-warning)',
        danger: 'var(--color-danger)', info: 'var(--color-info)',
      },
      borderRadius: { sm: 'var(--radius-sm)', md: 'var(--radius-md)', lg: 'var(--radius-lg)' },
      boxShadow: { sm: 'var(--shadow-sm)', md: 'var(--shadow-md)', lg: 'var(--shadow-lg)' },
      fontFamily: { sans: 'var(--font-sans)' },
    },
  },
};
```

Then extract repeated utility strings into components (React/Vue) or `@apply` classes
(`.btn`, `.card`) — long duplicated class lists are the Tailwind equivalent of
copy-pasted CSS.

## Bootstrap 5 (Sass or CSS variables)

With Sass, override before importing Bootstrap:

```scss
$primary: #2563eb;
$body-bg: #f8fafc;
$body-color: #0f172a;
$border-color: #e2e8f0;
$border-radius: 6px;
$border-radius-lg: 10px;
$font-family-sans-serif: "Inter", system-ui, sans-serif;
$enable-shadows: false;
$card-border-color: $border-color;
$card-cap-bg: transparent;
$input-focus-box-shadow: 0 0 0 3px rgba($primary, .35);
@import "bootstrap/scss/bootstrap";
```

Without Sass (CDN Bootstrap), override CSS variables in a file loaded after Bootstrap:

```css
:root {
  --bs-primary: #2563eb; --bs-primary-rgb: 37, 99, 235;
  --bs-body-bg: #f8fafc; --bs-body-color: #0f172a;
  --bs-border-color: #e2e8f0; --bs-border-radius: 6px; --bs-border-radius-lg: 10px;
  --bs-body-font-family: "Inter", system-ui, sans-serif;
}
.btn-primary { --bs-btn-bg: var(--bs-primary); --bs-btn-border-color: var(--bs-primary); }
```

## Deriving a palette from an existing brand color

If the project has a brand color, keep it as `--color-primary`. Then:
- `--color-primary-hover`: same hue, ~8–10% darker.
- `--color-primary-soft`: same hue at ~6–10% opacity on white (or a 50-level tint).
- `--ring`: brand color at 35% alpha.
- Check `--color-on-primary` contrast: white text needs ≥ 4.5:1 on the brand color; if the
  brand is light (yellow, lime, cyan), use dark text on it instead.
- Keep neutrals neutral (slate/gray/zinc). Tinting all grays with the brand hue is a
  common way to make a UI look dated.

## Consolidating messy existing values

Use `scripts/style_audit.py` output:
1. Cluster near-duplicate colors (visually indistinguishable) and map each cluster to one token.
2. Map every font size to the nearest step of the type scale.
3. Map every padding/margin/gap to the nearest step of the spacing scale.
4. Replace in code, starting with shared components, then layouts, then pages.
5. Remove `!important` that only existed to fight other one-off styles.
