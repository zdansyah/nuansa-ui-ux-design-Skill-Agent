# Accessibility (WCAG 2.2 AA) — clean also means usable by everyone

Accessible design is mostly the same discipline as clean design: clear hierarchy,
enough contrast, real labels, predictable behavior. About a third of issues can be found
automatically (`responsive_check.js` runs axe-core); the rest needs a quick manual pass.

## Contents
- Automated check
- The manual 10-minute pass
- Contrast
- Keyboard & focus
- Semantics & ARIA (use less ARIA)
- Forms
- Images, icons, media
- Motion & sensory
- Touch & mobile
- Common fixes table

---

## Automated check

```bash
npm i -D axe-core          # once, in the project (or anywhere on NODE_PATH)
node <skill>/scripts/responsive_check.js --url http://localhost:8000 --paths / /admin
```
Each page reports WCAG violations with impact (critical/serious/moderate/minor), the
rule id, how many elements, and an example selector. Best-practice findings are shown as
info. Fix all **critical** and **serious** before shipping. axe can't judge everything: an
empty report doesn't mean the page is accessible.

## The manual 10-minute pass

1. **Keyboard only**: unplug the mouse, Tab through the page. Is focus always visible?
   Can you open/close menus, modals and dropdowns, submit forms, and escape everything?
2. **Zoom 200%** and **text-only zoom**: nothing overlaps or gets cut off; no horizontal
   scroll at 320px CSS width (reflow).
3. **Screen reader skim** (VoiceOver: Cmd+F5 / NVDA): headings list makes sense, buttons
   and links have meaningful names, form fields announce their label and errors.
4. **Grayscale** (devtools rendering emulation): is any information carried by color alone?
5. **Reduced motion** on: animations stop or reduce.

## Contrast

- Body text ≥ **4.5:1**; large text (≥ 24px, or ≥ 18.7px bold) ≥ **3:1**.
- UI components and meaningful graphics (input borders, icons, focus ring, chart lines)
  ≥ **3:1** against their background.
- Muted/secondary text is the usual failure: `#888` on white is 3.5:1 (fails). Use
  `#6b7280` (4.8:1) or darker. Placeholder text counts if it conveys information.
- Text on images: use a dark overlay or a solid backing.
- Accent-colored text: light accents (lime, yellow, cyan) fail as text. Use
  `--color-primary-text` (theme.js derives a 4.5:1 variant).
- Check both light and dark themes.

## Keyboard & focus

- Every interactive element is reachable by Tab in a logical order (DOM order = visual order).
- Visible focus indicator on everything (`:focus-visible` ring, ≥ 3:1 contrast). Never
  `outline: none` without a replacement.
- Focus not obscured: sticky headers/footers must not cover the focused element
  (`scroll-padding-top` helps). (WCAG 2.2 2.4.11)
- Modals: focus moves in on open, is trapped inside, Esc closes, focus returns to the
  trigger (native `<dialog>` + `showModal()` does most of this; `ui-feedback.js` uses it).
- Skip link ("Lompat ke konten") as the first focusable element on content sites.
- Custom widgets (tabs, menus, comboboxes) follow the WAI-ARIA Authoring Practices
  keyboard patterns: arrows within, Tab out.

## Semantics & ARIA (use less ARIA)

- Use the right element: `<button>` for actions, `<a href>` for navigation, `<nav>`, `<main>`,
  `<header>`, `<footer>`, `<h1>`–`<h6>` in order (one `<h1>` per page, no skipped levels),
  `<ul>` for lists, `<table>` with `<th scope>` for data.
- No ARIA is better than wrong ARIA. Add `aria-*` only when no native element fits:
  `aria-expanded` on disclosure triggers, `aria-current="page"` in navigation,
  `aria-live` for async status, `aria-invalid` + `aria-describedby` on fields with errors.
- Icon-only buttons need `aria-label`. Decorative icons get `aria-hidden="true"`.
- `<html lang="id">` (or the right language) on every page.
- Page `<title>` unique and descriptive: "Pesanan · Toko Maju Admin".

## Forms

- Every input has a visible `<label for>` (placeholder is not a label).
- Required fields marked visibly (and with `required`); errors in text next to the
  field, linked via `aria-describedby` (`ui-feedback.js` does this automatically).
- Group radios/checkboxes with `<fieldset><legend>`.
- Correct `type`, `inputmode` and `autocomplete` (name, email, tel, street-address,
  one-time-code) so assistive tech and password managers help.
- Don't require re-entering data already provided in the same flow; allow paste in
  OTP/password fields. (WCAG 2.2 3.3.7, 3.3.8)
- Time limits (seat locks, OTP) show remaining time and allow extension where possible.

## Images, icons, media

- Informative images: meaningful `alt` ("Kaos polos putih, tampak depan"). Decorative:
  `alt=""`. Images of text: avoid; use real text.
- Charts: a text summary or data table alternative; don't rely on color alone (labels,
  patterns, direct annotation).
- Video: captions; audio: transcript; no autoplay with sound.

## Motion & sensory

- Respect `prefers-reduced-motion` (tokens set `--duration: 0ms`).
- No flashing > 3 times per second.
- Instructions never rely only on shape/position/color ("klik tombol hijau di kanan").

## Touch & mobile

- Target size ≥ **24×24px** minimum (WCAG 2.2 2.5.8), **44×44px** recommended; spacing between
  targets.
- No functionality that requires dragging only. Provide a tap alternative (e.g.
  "Slide to confirm" also needs a button). (WCAG 2.2 2.5.7)
- Works in portrait and landscape; no hover-only information on touch devices.

## Common fixes table

| axe rule / issue | Fix |
|---|---|
| `color-contrast` | darken muted text (`--color-text-muted` ≥ 4.5:1), avoid light accent text |
| `label` / `label-title-only` | add `<label for>` or `aria-label`; placeholders aren't labels |
| `button-name` / `link-name` | visible text, or `aria-label` on icon-only controls |
| `image-alt` | meaningful `alt`, or `alt=""` for decoration |
| `heading-order` / `page-has-heading-one` | one `<h1>`, then h2 → h3 in order; style with classes, not by picking tags |
| `landmark-one-main` / `region` | wrap content in `<main>`, use `<nav>`, `<header>`, `<footer>` |
| `html-has-lang` | `<html lang="id">` |
| `aria-*` errors | remove the ARIA or use the correct native element |
| `nested-interactive` | don't put buttons inside links (or vice versa); split them |
| `target-size` | increase padding/min-size to 24px+ (44px on touch) |
| focus invisible | `:focus-visible { box-shadow: var(--ring) }` (ui-controls.css) |
