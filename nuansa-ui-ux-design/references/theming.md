# Theming — let the whole site change color (and more) from one place

Goal: an admin (site-wide brand) and/or each visitor (personal preference) can change
the accent color, light/dark mode, corner style and density, and **every page updates
without touching component code**. This only works if components use semantic tokens
(see `design-tokens.md`); theming is the payoff of that discipline.

## Contents
- How it works
- Rules components must follow
- Option A — Drop-in runtime theming (`assets/theme.js`)
- Option B — Site-wide brand set by an admin (server-persisted)
- Option C — Framework-native (Tailwind / React / Vue)
- Preventing the flash of the default theme
- The "Appearance" settings page
- Guardrails for user-chosen colors

---

## How it works

```
User/admin picks  ──►  Theme.apply({ primary, mode, radius, density })
                          │  derives hover / soft / on-primary / text-safe / ring
                          ▼
                 CSS custom properties on <html>
                          ▼
     every .btn, .badge, .nav-item, link, chart accent … re-renders instantly
```

Theme dimensions (keep it to these; more knobs = more ways to make it ugly):

| Dimension | Values | Tokens touched |
|---|---|---|
| Accent color | any hex, plus presets | `--color-primary`, `-hover`, `-soft`, `--color-on-primary`, `--color-primary-text`, `--ring` |
| Mode | light / dark / system | `data-theme` on `<html>` → neutral + surface tokens |
| Corners | sharp / soft / round | `--radius-sm/md/lg`, `--radius-control` |
| Density | comfortable / compact | `--control-height`, `--control-height-sm`, `--density` |

## Rules components must follow

1. Never hard-code the accent. Use `var(--color-primary)` for fills,
   `var(--color-on-primary)` for text/icons on those fills, and
   **`var(--color-primary-text)` for accent-colored text on normal surfaces** (links,
   active tab label, "See all"). A light accent like lime `#d4ff3a` is a great fill but
   unreadable as text on white; `--color-primary-text` is auto-darkened to 4.5:1.
2. Buttons, inputs, chips use `--radius-control`; cards use `--radius-md`/`--radius-lg`.
   That's what makes the "round" preset turn controls into pills.
3. Heights/paddings of controls derive from `--control-height` so density works.
4. Charts read the accent from CSS at render time
   (`getComputedStyle(document.documentElement).getPropertyValue('--color-primary')`)
   and re-render on the `themechange` event.
5. Dark mode only overrides neutral/surface tokens under `[data-theme="dark"]`
   (see `design-tokens.md`). Never write per-component dark styles.

## Option A — Drop-in runtime theming (`assets/theme.js`)

For any stack (plain HTML, Blade, Django, PHP, or as a utility inside an SPA):

1. Copy `assets/theme.js` and `assets/theme.css` into the project.
2. Load `tokens.css` first, then `theme.js` (end of body or `defer`).
3. Add the boot snippet (below) in `<head>` to avoid a flash.
4. Put a picker somewhere (settings page, user menu, or a floating "Tampilan" button):
   ```html
   <div id="appearance"></div>
   <script>Theme.mountPicker(document.getElementById('appearance'));</script>
   ```
   Or wire your own controls: `Theme.apply({ primary: '#16a34a' })`,
   `Theme.apply({ mode: 'dark' })`, `Theme.reset()`.
5. Custom presets: `Theme.mountPicker(el, { presets: [{ name: 'Brand', primary: '#0f766e' }, …] })`.
   Turn off groups you don't want: `{ density: false, radius: false }`.

`theme.js` stores choices in `localStorage` (per browser) and emits a `themechange`
event with the current state.

## Option B — Site-wide brand set by an admin (server-persisted)

When the admin should choose the color for **all visitors**:

1. Add an "Appearance / Tampilan" section to admin settings (pattern below) that saves
   `{ primary, radius, mode_default }` to the existing settings store (settings table,
   config JSON, CMS options). Reuse the app's existing settings mechanism; don't invent
   a new one.
2. Render the brand into `<head>` on every page, server-side, so there's no flash:
   ```html
   <!-- Blade example; same idea in Jinja/Twig/PHP/ERB -->
   <style>:root{ --color-primary: {{ $settings->primary ?? '#2563eb' }}; }</style>
   <script>window.__SITE_THEME__ = @json($settings->only(['primary','radius']));</script>
   ```
3. After `theme.js` loads: `Theme.apply(window.__SITE_THEME__, { persist: false })` —
   this computes the derived tokens (hover, soft, on-primary, text-safe) from the brand.
4. If visitors may also personalize (e.g. dark mode), apply the site brand first, then
   the visitor's saved `mode` only. Decide which dimensions visitors can override —
   usually mode yes, accent no.
5. Validate on the server: accept only `#rrggbb`, whitelist radius/density values.
   Sanitize before printing into `<style>` (it's user input reaching CSS).

## Option C — Framework-native

- **Tailwind**: map theme colors to the CSS variables (see `design-tokens.md`), then
  theming is exactly Option A/B — utilities like `bg-primary` follow the variable.
  Use `darkMode: ['selector', '[data-theme="dark"]']` (v3.4+) or the v4 `@custom-variant`.
- **React/Next/Vue/Svelte**: a small `ThemeProvider`/store that holds the same state
  shape and writes the same CSS variables on `document.documentElement` (you can import
  the `derive()` logic from `theme.js` or port it). Avoid passing colors through props or
  CSS-in-JS theme objects for every component — variables are cheaper and work in plain
  CSS too. For Next.js SSR, read the saved theme from a cookie and render it into
  `<html data-theme style="--color-primary:…">` to avoid a flash.
- **Bootstrap**: set `--bs-primary` and `--bs-primary-rgb` alongside `--color-primary`
  (add a `themechange` listener that mirrors them), because Bootstrap components read
  `--bs-*`.

## Preventing the flash of the default theme

Put this tiny inline script in `<head>`, before stylesheets finish loading. It applies
the saved mode and accent before first paint; `theme.js` later computes the rest.

```html
<script>
  (function () {
    try {
      var t = JSON.parse(localStorage.getItem('nuansa-theme') || '{}');
      var d = document.documentElement;
      var dark = t.mode === 'dark' || (t.mode === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
      if (t.mode) d.setAttribute('data-theme', dark ? 'dark' : 'light');
      if (t.primary) d.style.setProperty('--color-primary', t.primary);
    } catch (e) {}
  })();
</script>
```

## The "Appearance" settings page

Place it in admin **Pengaturan → Tampilan** (site-wide) and/or the user menu (personal).

```
Tampilan
Atur warna dan gaya antarmuka.
┌──────────────────────────────────────────────┐
│ Warna utama   ● ● ● ● ● ● ● ●  (🎨 kustom)   │
│ Mode          [ Terang | Gelap | Sistem ]    │
│ Sudut         [ Tegas | Lembut | Bulat ]     │
│ Kepadatan     [ Lega | Rapat ]               │
│                                              │
│ Pratinjau:  [Tombol utama] [Sekunder] (badge)│
│             link teks · input · toggle       │
│                                  Atur ulang  │
└──────────────────────────────────────────────┘
```

- Live preview: changes apply instantly to the real UI; that *is* the preview. A small
  sample strip (primary button, link, badge, input, switch) helps people judge contrast.
- For site-wide settings, changes preview instantly but persist only on "Simpan", with a
  toast on success.

## Guardrails for user-chosen colors

`theme.js` already: picks black/white `--color-on-primary` by contrast, and darkens
`--color-primary-text` to 4.5:1 against the surface. Additionally:

- Don't let the accent replace semantic colors. Danger stays red, success stays green,
  even if the brand is red or green — use the soft/strong variants to distinguish.
- If the chosen accent is very close to danger red, consider warning the admin.
- Very light accents (lime, yellow, cyan) work best as fills with dark text, as in the
  lime reference style — the derivation handles that automatically.
- Keep neutrals neutral; don't tint the gray scale with the accent.
