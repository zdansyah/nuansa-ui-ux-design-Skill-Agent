# Admin Panel & Dashboard Patterns

Admin panels get cluttered because features accumulate without a structure. The goal is a
calm workspace: predictable layout, grouped navigation, dense-but-readable data, and fast
access to the actions people do every day.

## Contents
- Layout shell
- Sidebar & menu grouping
- Topbar
- Dashboard (home)
- List pages (index)
- Detail & edit pages
- Settings pages
- Bulk actions & destructive actions
- Responsive behavior

---

## Layout shell

```
┌──────────┬──────────────────────────────────────────┐
│          │ Topbar: [☰] breadcrumb/search   🔔  👤   │
│ Sidebar  ├──────────────────────────────────────────┤
│ (256px)  │ Page header: Title          [Secondary][Primary]
│          │                                          │
│ groups   │ Content (cards / table / form)           │
│          │                                          │
└──────────┴──────────────────────────────────────────┘
```

```css
.app { display: grid; min-height: 100dvh; grid-template-columns: 1fr; }
@media (min-width: 1024px) { .app { grid-template-columns: var(--sidebar-width) 1fr; } }
.app__sidebar { background: var(--color-surface); border-right: 1px solid var(--color-border); }
.app__main { min-width: 0; /* prevents wide tables from blowing out the grid */ display: flex; flex-direction: column; }
.app__topbar { position: sticky; top: 0; z-index: var(--z-sticky); height: var(--topbar-height); display: flex; align-items: center; gap: var(--space-3); padding: 0 var(--space-4); background: color-mix(in srgb, var(--color-surface) 85%, transparent); backdrop-filter: blur(8px); border-bottom: 1px solid var(--color-border); }
.app__content { padding: var(--space-4); width: 100%; max-width: 1440px; margin-inline: auto; }
@media (min-width: 768px) { .app__content { padding: var(--space-6) var(--space-8); } }
```

`min-width: 0` on the main column is the single most common fix for "the table pushes the
whole admin layout off-screen".

## Sidebar & menu grouping

- Group items under short uppercase-free section labels (small, muted): e.g.
  **Utama** (Dashboard), **Konten** (Produk, Kategori, Artikel), **Transaksi** (Pesanan,
  Pembayaran), **Pengguna** (Pengguna, Peran), **Sistem** (Pengaturan, Log).
- Order groups by daily frequency; settings/system at the bottom.
- ≤ ~7 items per group; nest deeper items as a collapsible sub-list or as tabs inside the page.
- Each item: icon (18–20px, one set) + label; 36–40px tall; active item uses
  `--color-primary-soft` background + `--color-primary` text; hover uses `--color-surface-muted`.
- Respect existing permission checks around menu items — keep the conditionals
  (`@can`, `{% if perms %}`, `v-if="can(...)"`) exactly; move them along with the item.
- Logo/app name at top (≤ 60px), user/account or collapse toggle at bottom.
- Optional collapsed mode (72px, icons only, tooltips) on desktop.

```css
.nav-group { padding: var(--space-3) var(--space-3) 0; }
.nav-group__label { padding: 0 var(--space-3); margin-bottom: var(--space-1); font-size: var(--text-xs); font-weight: var(--weight-medium); color: var(--color-text-subtle); }
.nav-item { display: flex; align-items: center; gap: var(--space-3); height: 38px; padding: 0 var(--space-3); border-radius: var(--radius-sm); color: var(--color-text-muted); font-size: var(--text-sm); font-weight: var(--weight-medium); }
.nav-item:hover { background: var(--color-surface-muted); color: var(--color-text); text-decoration: none; }
.nav-item[aria-current="page"] { background: var(--color-primary-soft); color: var(--color-primary); }
```

## Topbar

Left: hamburger (mobile only), breadcrumb or page context. Center/left: global search if
the app has one. Right: notifications, user menu (avatar → dropdown with profile,
settings, logout). Don't repeat the page title in both topbar and page header — pick one
(page header).

## Dashboard (home)

- Row of 3–4 KPI stat cards: label (muted, sm), value (2xl, semibold, tabular nums),
  optional delta badge. No icons-in-colored-circles unless they carry meaning.
- Below: 1–2 charts or the most-used list ("Pesanan terbaru") with a "Lihat semua" link.
- Quick actions only if they're genuinely frequent.
- Remove "Welcome back, Admin!" banners, motivational copy, server info tiles and
  decorative illustrations unless the user wants them.
- Grid: 1 col mobile → 2 cols tablet → 4 cols desktop for stats; 1 → 3/2 split for chart + list.
- **Bento variant** (modern SaaS look, see Preset 2 in `style-presets.md`): a 12-column
  grid of cards with different spans and heights; each card = title + circular icon
  action top-right + one focused visualization or list. Period filter as pill chips in
  the page header (Hari ini / Minggu ini / Bulan ini) instead of a date form.
  ```css
  .bento { display: grid; gap: var(--space-4); grid-template-columns: repeat(12, minmax(0, 1fr)); }
  .bento > * { grid-column: span 12; }
  @media (min-width: 768px)  { .bento .span-6 { grid-column: span 6; } }
  @media (min-width: 1200px) { .bento .span-4 { grid-column: span 4; } .bento .span-8 { grid-column: span 8; } .bento .row-2 { grid-row: span 2; } }
  ```
- Icon-rail sidebar (72px, circular icons, active = ink circle) is an option for apps
  with ≤ 10 destinations; keep tooltips and `aria-label`s.

## List pages (index)

Order from top: page header → toolbar → table → pagination.

- **Toolbar**: search input (left, grows), filters (select/dropdown chips), then view
  options. On mobile, search full-width and filters behind a "Filter" button opening a
  sheet/modal. Show active filters as removable chips with "Reset".
- **Table**: see `components.md`. Key column first and clickable to the detail page;
  status as badges; dates in a consistent short format; numbers right-aligned; actions
  column last, right-aligned, compact.
- **Empty state** distinguishes "no data yet" (with primary action) from "no results for
  this filter" (with reset filters).
- Keep existing query parameters for search/filter/sort/page so links and back-button
  behavior keep working.

## Detail & edit pages

- Page header with record name as title, status badge, and actions (Edit, More ▾).
- Two-column on desktop: main info (2/3) + side meta card (1/3: status, created/updated,
  owner). Single column on mobile, meta after main.
- Edit forms: grouped into cards by topic ("Informasi dasar", "Harga", "Media"), sticky
  bottom action bar on long forms (Cancel / Save), unsaved-changes guard only if the app
  had one.
- Inline validation errors next to fields + a toast/summary on submit failure.

## Settings pages

Left vertical tabs (desktop) / top scrollable tabs (mobile) per settings area. Each
section: title + one-line description on the left, controls on the right (desktop),
stacked on mobile. Save per section.

## Bulk actions & destructive actions

- Row checkboxes → a contextual bar appears ("3 dipilih · Ekspor · Hapus · Batal").
- Every destructive action is confirmed via `UI.confirm` (or `data-confirm`) with the
  item name/count and danger styling: "Hapus 3 pesanan? Tindakan ini tidak bisa dibatalkan."
- After success: toast + list refresh. After failure: error toast with reason.

## Responsive behavior

- **< 1024px**: sidebar becomes an off-canvas drawer opened by the topbar hamburger;
  overlay behind it; closes on navigation, overlay click and Esc; body scroll locked.
- **< 768px**: page header actions wrap below the title; secondary actions collapse into
  a "More" dropdown; KPI cards 1–2 per row; tables use scroll container or stack mode;
  forms single column; sticky action bar full-width.
- Check at 375px that topbar items don't overlap (hide search into an icon, keep avatar).
