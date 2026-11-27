# Component Patterns

Specs for the core reusable components. Markup is plain HTML + token-based CSS so it maps
onto any stack: in React/Vue make these real components with the same variants; in
Blade/Jinja/PHP make them partials/includes; in Tailwind express the same values with
theme utilities.

Rules that apply to all components:
- Every visual value comes from a token.
- Every interactive element has hover, `:focus-visible`, active and disabled states.
- Variants are modifiers (`.btn--danger`), not new components.
- Keep the component count small. Five well-made components beat twenty half-made ones.

## Contents
- Button
- Form field (input, select, textarea, checkbox, switch)
- Card
- Page header
- Table (+ responsive strategies)
- Badge / status
- Modal / dialog
- Toast
- Dropdown menu
- Tabs
- Pagination
- Empty, loading and error states
- Navigation (public header)
- Modern patterns (from current dashboard/app styles)
  - Segmented control & filter chips
  - Circular icon button
  - KPI / big-number stat
  - Avatar stack
  - Switch
  - Progress bar (with hatched remainder)
  - Chart legend & minimal charts
  - Grid ↔ list view toggle
  - Search pill with filter button
  - Status card

---

## Button

Variants: `primary` (one per view), `secondary` (bordered), `ghost` (text-like), `danger`.
Sizes: default (40px) and `sm` (32px). Optional icon left; icon-only needs `aria-label`.

```html
<button class="btn btn--primary" type="button">Simpan</button>
<button class="btn btn--secondary">Batal</button>
<button class="btn btn--ghost btn--sm">Lihat detail</button>
<button class="btn btn--danger" data-confirm="Hapus data ini?">Hapus</button>
<button class="btn btn--icon btn--ghost" aria-label="Edit"><svg …/></button>
```

```css
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: var(--space-2);
  height: var(--control-height); padding: 0 var(--space-4);
  border: 1px solid transparent; border-radius: var(--radius-control);
  font-size: var(--text-sm); font-weight: var(--weight-medium); line-height: 1;
  white-space: nowrap; cursor: pointer; text-decoration: none;
  transition: background var(--duration) var(--ease), border-color var(--duration) var(--ease), color var(--duration) var(--ease);
}
.btn:hover { text-decoration: none; }
.btn:disabled, .btn[aria-disabled="true"] { opacity: .5; pointer-events: none; }
.btn--primary { background: var(--color-primary); color: var(--color-on-primary); }
.btn--primary:hover { background: var(--color-primary-hover); }
.btn--secondary { background: var(--color-surface); border-color: var(--color-border-strong); color: var(--color-text); }
.btn--secondary:hover { background: var(--color-surface-muted); }
.btn--ghost { background: transparent; color: var(--color-text-muted); }
.btn--ghost:hover { background: var(--color-surface-muted); color: var(--color-text); }
.btn--danger { background: var(--color-danger); color: #fff; }
.btn--danger:hover { filter: brightness(.92); }
.btn--sm { height: var(--control-height-sm); padding: 0 var(--space-3); font-size: var(--text-xs); }
.btn--icon { width: var(--control-height); padding: 0; }
.btn--block { width: 100%; }
.btn.is-loading { position: relative; color: transparent; pointer-events: none; }
.btn.is-loading::after { content: ""; position: absolute; width: 1em; height: 1em; border: 2px solid currentColor; border-right-color: transparent; border-radius: 50%; animation: spin .6s linear infinite; color: var(--color-on-primary); }
@keyframes spin { to { transform: rotate(360deg); } }
```

Guidance: button labels are verbs ("Simpan", "Tambah pengguna"), not "OK"/"Submit". In a
button group, the primary is on the right on desktop; on mobile, stack full-width with the
primary first.

## Form field

Structure: label (above) → control → hint or error. Group related fields in a card or
fieldset with a short heading. Two columns on ≥ 768px only for short related fields
(first/last name, city/postcode); long forms stay single-column.

```html
<div class="field">
  <label class="field__label" for="email">Email <span class="field__req" aria-hidden="true">*</span></label>
  <input class="input" id="email" name="email" type="email" required aria-describedby="email-hint">
  <p class="field__hint" id="email-hint">Dipakai untuk login.</p>
</div>

<div class="field has-error">
  <label class="field__label" for="phone">No. HP</label>
  <input class="input" id="phone" name="phone" aria-invalid="true" aria-describedby="phone-err">
  <p class="field__error" id="phone-err">Nomor HP tidak valid.</p>
</div>
```

```css
.field { display: grid; gap: var(--space-1); margin-bottom: var(--space-4); }
.field__label { font-size: var(--text-sm); font-weight: var(--weight-medium); color: var(--color-text); }
.field__req { color: var(--color-danger); }
.field__hint { font-size: var(--text-xs); color: var(--color-text-muted); margin: 0; }
.field__error { font-size: var(--text-xs); color: var(--color-danger); margin: 0; }
.input, .select, .textarea {
  width: 100%; min-height: var(--control-height); padding: var(--space-2) var(--space-3);
  background: var(--color-surface); border: 1px solid var(--color-border-strong); border-radius: var(--radius-control);
  font-size: max(16px, var(--text-sm)); /* ≥16px avoids iOS zoom; drop to --text-sm on desktop if desired */
  transition: border-color var(--duration) var(--ease), box-shadow var(--duration) var(--ease);
}
@media (min-width: 768px) { .input, .select, .textarea { font-size: var(--text-sm); } }
.input:focus, .select:focus, .textarea:focus { outline: none; border-color: var(--color-primary); box-shadow: var(--ring); }
.has-error .input, .input[aria-invalid="true"] { border-color: var(--color-danger); }
.input:disabled { background: var(--color-surface-muted); color: var(--color-text-muted); }
.textarea { min-height: 96px; resize: vertical; }
.form-grid { display: grid; gap: 0 var(--space-4); }
@media (min-width: 768px) { .form-grid--2 { grid-template-columns: 1fr 1fr; } }
.form-actions { display: flex; flex-direction: column-reverse; gap: var(--space-2); margin-top: var(--space-6); }
@media (min-width: 640px) { .form-actions { flex-direction: row; justify-content: flex-end; } }
```

Checkbox/radio: native input with `accent-color: var(--color-primary)` and a clickable
label; size 16–18px. Switch: only for settings that apply immediately.

Don't change `name`, `id`, `value`, `required`, or `form`/`action` attributes while
restyling — these are behavior.

## Card

```html
<section class="card">
  <header class="card__header">
    <h2 class="card__title">Profil</h2>
    <button class="btn btn--ghost btn--sm">Edit</button>
  </header>
  <div class="card__body">…</div>
</section>
```

```css
.card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
.card__header { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); padding: var(--space-4) var(--space-5); border-bottom: 1px solid var(--color-border); }
.card__title { font-size: var(--text-base); font-weight: var(--weight-semibold); margin: 0; }
.card__body { padding: var(--space-5); }
.card__footer { padding: var(--space-4) var(--space-5); border-top: 1px solid var(--color-border); }
```

Prefer border over shadow. Don't nest cards; use sections with headings inside one card.

## Page header

The consistent top of every page (especially admin):

```html
<div class="page-header">
  <div>
    <h1 class="page-header__title">Pengguna</h1>
    <p class="page-header__desc">Kelola akun dan hak akses.</p>  <!-- optional, one line -->
  </div>
  <div class="page-header__actions">
    <button class="btn btn--secondary">Ekspor</button>
    <a class="btn btn--primary" href="/users/create">Tambah pengguna</a>
  </div>
</div>
```

```css
.page-header { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: var(--space-4); margin-bottom: var(--space-6); }
.page-header__title { font-size: var(--text-2xl); margin: 0; }
.page-header__desc { color: var(--color-text-muted); font-size: var(--text-sm); margin: var(--space-1) 0 0; }
.page-header__actions { display: flex; flex-wrap: wrap; gap: var(--space-2); }
```

## Table

```html
<div class="table-wrap">
  <table class="table">
    <thead><tr><th>Nama</th><th>Email</th><th>Status</th><th class="num">Saldo</th><th class="actions"><span class="sr-only">Aksi</span></th></tr></thead>
    <tbody>
      <tr>
        <td data-label="Nama">Budi Santoso</td>
        <td data-label="Email">budi@contoh.id</td>
        <td data-label="Status"><span class="badge badge--success">Aktif</span></td>
        <td data-label="Saldo" class="num">Rp 1.250.000</td>
        <td class="actions">…</td>
      </tr>
    </tbody>
  </table>
</div>
```

```css
.table-wrap { width: 100%; overflow-x: auto; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
.table { width: 100%; border-collapse: collapse; font-size: var(--text-sm); }
.table th { text-align: left; font-weight: var(--weight-medium); color: var(--color-text-muted); background: var(--color-surface-muted); padding: var(--space-3) var(--space-4); white-space: nowrap; border-bottom: 1px solid var(--color-border); }
.table td { padding: var(--space-3) var(--space-4); border-bottom: 1px solid var(--color-border); vertical-align: middle; }
.table tbody tr:last-child td { border-bottom: 0; }
.table tbody tr:hover { background: var(--color-surface-muted); }
.table .num { text-align: right; font-variant-numeric: tabular-nums; }
.table .actions { text-align: right; white-space: nowrap; width: 1%; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
```

### Responsive table strategies (pick per table)

1. **Scroll container** (default, safest): `.table-wrap { overflow-x: auto }`. The page
   never overflows; only the table scrolls. Good for wide data tables in admin.
2. **Stacked cards on mobile**: for tables with ≤ 6 meaningful columns that users scan
   on phones.
   ```css
   @media (max-width: 640px) {
     .table--stack thead { display: none; }
     .table--stack tr { display: block; padding: var(--space-3) var(--space-4); border-bottom: 1px solid var(--color-border); }
     .table--stack td { display: flex; justify-content: space-between; gap: var(--space-4); padding: var(--space-1) 0; border: 0; text-align: right; }
     .table--stack td::before { content: attr(data-label); color: var(--color-text-muted); text-align: left; }
     .table--stack td.actions { justify-content: flex-end; padding-top: var(--space-2); }
     .table--stack td.actions::before { content: none; }
   }
   ```
3. **Hide low-priority columns** below a breakpoint (`.col-optional { display: none }`)
   and expose them in a detail view. Only if the data is reachable elsewhere.

Row actions: 1–2 visible icon buttons (edit, more) plus an overflow dropdown for the rest.
Destructive actions go in the dropdown or are styled danger and confirmed.

## Badge / status

```css
.badge { display: inline-flex; align-items: center; gap: var(--space-1); height: 22px; padding: 0 var(--space-2); border-radius: var(--radius-full); font-size: var(--text-xs); font-weight: var(--weight-medium); background: var(--color-surface-muted); color: var(--color-text-muted); white-space: nowrap; }
.badge--success { background: var(--color-success-soft); color: var(--color-success); }
.badge--warning { background: var(--color-warning-soft); color: var(--color-warning); }
.badge--danger  { background: var(--color-danger-soft);  color: var(--color-danger); }
.badge--info    { background: var(--color-info-soft);    color: var(--color-info); }
```

Map each status value to exactly one variant, project-wide.

## Modal / dialog

Use the native `<dialog>` element (good focus handling, Esc to close, top layer) or the
framework's dialog component. `assets/ui-feedback.js` implements confirm/prompt/alert on
top of `<dialog>`; for content modals (forms, details) use the same visual classes:

```html
<dialog class="modal" aria-labelledby="m-title">
  <form method="dialog" class="modal__panel">
    <header class="modal__header">
      <h2 id="m-title" class="modal__title">Edit pengguna</h2>
      <button class="btn btn--icon btn--ghost" value="cancel" aria-label="Tutup">✕</button>
    </header>
    <div class="modal__body">…</div>
    <footer class="modal__footer">
      <button class="btn btn--secondary" value="cancel">Batal</button>
      <button class="btn btn--primary" value="ok">Simpan</button>
    </footer>
  </form>
</dialog>
```

Sizes: `sm` 400px (confirm), `md` 560px (forms), `lg` 800px (details). On ≤ 640px the
modal is full-width with margin `var(--space-4)` (or a bottom sheet) and its body scrolls
(`max-height: calc(100dvh - 2rem)`), so tall content never gets cut off.

## Toast

Short, non-blocking feedback after an action. Top-right on desktop, top-center (full
width minus gutter) on mobile. Auto-dismiss after ~4s (errors may persist until closed).
Variants: success, error, warning, info. Max 3 stacked. Use `role="status"` (or
`role="alert"` for errors). `assets/ui-feedback.js` implements this.

## Dropdown menu

Trigger button with `aria-haspopup="menu"` and `aria-expanded`. Menu: surface, border,
`--shadow-md`, `--radius-md`, items 36px tall, danger items last and separated. Closes
on outside click, Esc and item selection. Must flip/stay within the viewport on mobile.

## Tabs

Underline style: inactive `--color-text-muted`, active `--color-text` + 2px primary
underline. Horizontally scrollable on mobile (`overflow-x: auto; scrollbar-width: none`)
instead of wrapping into multiple rows.

## Pagination

"Menampilkan 1–20 dari 312" on the left, compact prev/next + page numbers on the right.
On mobile show only prev / "3 / 16" / next.

## Empty, loading and error states

- **Empty**: icon (muted, 40px), one-line title, one-line hint, primary action if
  relevant ("Belum ada produk. Tambah produk pertama.").
- **Loading**: skeleton rows/blocks matching final layout for content; spinner only inside
  buttons or tiny areas. Never let the layout jump when data arrives.
- **Error**: short message + retry button. Field-level errors stay inline next to fields.

## Navigation (public header)

- Logo left, ≤ 5–6 links, one CTA button right.
- Sticky with a subtle bottom border on scroll; height 60–72px.
- ≤ 1024px (or when links don't fit): hamburger → slide-in drawer or full-width panel,
  with links at 48px tall, CTA at the bottom, body scroll locked while open, Esc/overlay
  closes, focus returns to the trigger.
- Current page: `aria-current="page"` + color/weight change.

Footer: compact; group links in 2–4 columns that stack on mobile; copyright line small and muted.

---

## Modern patterns (from current dashboard/app styles)

These are what make a UI read as "2025+" rather than "admin template". Use the ones that
fit the chosen preset (`style-presets.md`); they all run on the same tokens.

### Segmented control & filter chips

Use for switching a view or filter (Today / This Week / This Month, All / Active / Completed).
Active = ink fill (or accent), inactive = outline or soft fill. Scrolls horizontally on mobile.

```html
<div class="chips" role="tablist" aria-label="Periode">
  <button class="chip" role="tab" aria-selected="false">Hari ini</button>
  <button class="chip" role="tab" aria-selected="true">Bulan ini</button>
</div>
```
```css
.chips { display: flex; gap: var(--space-2); overflow-x: auto; scrollbar-width: none; padding-bottom: 2px; }
.chips::-webkit-scrollbar { display: none; }
.chip { flex: none; height: 36px; padding: 0 var(--space-4); border-radius: var(--radius-full); border: 1px solid var(--color-border-strong);
  background: transparent; color: var(--color-text); font-size: var(--text-sm); font-weight: var(--weight-medium); cursor: pointer; white-space: nowrap; }
.chip:hover { background: var(--color-surface-muted); }
.chip[aria-selected="true"], .chip[aria-pressed="true"] { background: var(--color-ink); border-color: var(--color-ink); color: var(--color-on-ink); }
.chip .count { display: inline-grid; place-items: center; min-width: 20px; height: 20px; margin-left: var(--space-2); border-radius: var(--radius-full); background: var(--color-surface-muted); font-size: var(--text-xs); }
```
Keep these wired to the same query params / handlers the old filter used.

### Circular icon button

Secondary actions at the top-right of cards or app bars (add, open ↗, filter, edit).

```css
.icon-btn { display: inline-grid; place-items: center; width: 40px; height: 40px; flex: none; border-radius: 50%;
  border: 1px solid var(--color-border-strong); background: var(--color-surface); color: var(--color-text); cursor: pointer; }
.icon-btn:hover { background: var(--color-surface-muted); }
.icon-btn--ink { background: var(--color-ink); border-color: var(--color-ink); color: var(--color-on-ink); }
.icon-btn--accent { background: var(--color-primary); border-color: var(--color-primary); color: var(--color-on-primary); }
.icon-btn svg { width: 18px; height: 18px; }
```
Always `aria-label`; add `title` for a tooltip on desktop.

### KPI / big-number stat

```html
<div class="stat">
  <p class="stat__label">Pendapatan minggu ini</p>
  <p class="stat__value">+20%</p>
  <p class="stat__hint">Lebih tinggi dari minggu lalu</p>
</div>
```
```css
.stat__label { margin: 0; font-size: var(--text-sm); color: var(--color-text-muted); }
.stat__value { margin: var(--space-1) 0 0; font-size: clamp(1.75rem, 1.2rem + 2vw, 3rem); font-weight: var(--weight-medium); letter-spacing: -0.02em; line-height: 1.1; font-variant-numeric: tabular-nums; }
.stat__value sup { font-size: .45em; vertical-align: .9em; margin-right: 2px; } /* $<sup>$</sup>1,680 style currency */
.stat__hint { margin: var(--space-1) 0 0; font-size: var(--text-xs); color: var(--color-text-muted); }
```
A row of stats can be separated by thin vertical rules instead of putting each in a card.

### Avatar stack

```css
.avatars { display: flex; align-items: center; }
.avatars > * { width: 36px; height: 36px; border-radius: 50%; border: 2px solid var(--color-surface); object-fit: cover; }
.avatars > * + * { margin-left: -10px; }
.avatars .more { display: grid; place-items: center; background: var(--color-ink); color: var(--color-on-ink); font-size: var(--text-xs); }
```

### Switch

For settings that apply immediately. Keep the native checkbox for behavior.

```html
<label class="switch"><input type="checkbox" role="switch" name="direct"><span class="switch__track"></span><span>Direct</span></label>
```
```css
.switch { display: inline-flex; align-items: center; gap: var(--space-2); cursor: pointer; }
.switch input { position: absolute; opacity: 0; width: 1px; height: 1px; }
.switch__track { position: relative; width: 44px; height: 26px; border-radius: var(--radius-full); background: var(--color-border-strong); transition: background var(--duration) var(--ease); }
.switch__track::after { content: ""; position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 50%; background: #fff; box-shadow: var(--shadow-sm); transition: transform var(--duration) var(--ease); }
.switch input:checked + .switch__track { background: var(--color-primary); }
.switch input:checked + .switch__track::after { transform: translateX(18px); }
.switch input:focus-visible + .switch__track { box-shadow: var(--ring); }
```

### Progress bar (with hatched remainder)

```html
<div class="progress" role="progressbar" aria-valuenow="68" aria-valuemin="0" aria-valuemax="100" aria-label="Wallet">
  <div class="progress__fill" style="--value: 68%">68%</div>
</div>
```
```css
.progress { height: 40px; border-radius: var(--radius-full); overflow: hidden;
  background: repeating-linear-gradient(135deg, transparent 0 6px, rgb(0 0 0 / .07) 6px 7px), var(--color-surface-muted); }
.progress__fill { width: var(--value); height: 100%; display: flex; align-items: center; padding-left: var(--space-4);
  border-radius: var(--radius-full); background: var(--color-primary); color: var(--color-on-primary); font-size: var(--text-xs); font-weight: var(--weight-medium); }
.progress--thin { height: 8px; } .progress--thin .progress__fill { padding: 0; font-size: 0; }
```
The `--value` custom property is the one acceptable inline style (it's data, not styling).

### Chart legend & minimal charts

- Legend = colored dot + label + value, inline under or beside the chart:
  `<span class="legend"><i style="--c: var(--chart-1)"></i>In progress: 14</span>`
  ```css
  .legend { display: inline-flex; align-items: center; gap: var(--space-2); font-size: var(--text-sm); color: var(--color-text-muted); }
  .legend i { width: 10px; height: 10px; border-radius: 50%; background: var(--c); }
  ```
- Define chart colors as tokens (`--chart-1…5`) separate from the UI accent, and read them
  from CSS in the chart library so themes apply.
- Minimal styling: no chart border, faint or no gridlines, no 3D, rounded bar ends,
  donut thickness ~ 18–24% of radius, one highlighted point with a dark pill tooltip.
- If the `dataviz` skill is available, follow it for chart construction.

### Grid ↔ list view toggle

Same data, two layouts — let users pick, remember the choice (localStorage).
```html
<div class="chips" role="radiogroup" aria-label="Tampilan">
  <button class="icon-btn" role="radio" aria-checked="true" aria-label="Grid">▦</button>
  <button class="icon-btn" role="radio" aria-checked="false" aria-label="List">☰</button>
</div>
<div class="collection" data-view="grid">…items…</div>
```
```css
.collection[data-view="grid"] { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 220px), 1fr)); gap: var(--space-3); }
.collection[data-view="list"] { display: grid; gap: var(--space-2); }
```

### Search pill with filter button

```html
<div class="search">
  <svg aria-hidden="true">…</svg>
  <input type="search" name="q" placeholder="Cari tugas, proyek…" aria-label="Cari">
</div>
<button class="icon-btn" aria-label="Filter">⚙</button>
```
```css
.search { display: flex; align-items: center; gap: var(--space-2); height: 44px; padding: 0 var(--space-4); flex: 1; min-width: 0;
  background: var(--color-surface-muted); border: 1px solid transparent; border-radius: var(--radius-full); }
.search:focus-within { border-color: var(--color-primary); box-shadow: var(--ring); background: var(--color-surface); }
.search input { flex: 1; min-width: 0; border: 0; background: transparent; outline: none; font-size: max(16px, var(--text-sm)); }
```

### Status card

Tinted card whose color comes from its status (see Preset 4 in `style-presets.md`).
Badge + relative time on the first line, title, chevron. Status must also be in text,
never color alone.
