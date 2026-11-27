# Data Dashboards & Statistics — numbers people can read in one glance

Statistics pages succeed when the user gets the answer in seconds: *how are we doing,
compared to what, and what needs attention?* That comes from a few disciplined patterns:
KPI cards with context, one highlighted data point per chart, quiet axes, correct number
formatting, and colors that mean something. Use with `layout-system.md` (grids,
numbers) and `admin-panel.md` (shell). If the `dataviz` skill is available, use it for
chart construction details.

## Contents
- Page anatomy
- KPI card anatomy
- Deltas: color by meaning, not direction
- Choosing the chart
- Chart card anatomy
- Highlight one thing
- Axes, gridlines, labels
- Tooltips & crosshair
- Color for data
- Period controls
- Lists, tables and maps next to charts
- Number formatting (Indonesia)
- Responsive charts
- States & accessibility
- Styling chart libraries (Chart.js, ApexCharts, Recharts)
- The bundled chart helper
- Mistakes seen in polished-looking shots

---

## Page anatomy

```
Title + one-line context            [7h | 30h | 12b]  [📅 1 Jan – 31 Mar]  [Ekspor]
[KPI] [KPI] [KPI] [KPI]                       ← 3–4 cards, the answers
[Main trend chart (8 cols)        ] [Top list / breakdown (4 cols)]
[Secondary chart / funnel (8 cols)] [Share / progress list (4 cols)]
[Detail table with search + filters (12 cols)]
```
- Answers first (KPIs), explanation second (charts), evidence last (tables).
- One period control for the whole page. Every card follows it and says which period it shows.
- 4–6 visualizations per page max. More belongs on a drill-down page.

## KPI card anatomy

```
┌─────────────────────────────────┐
│ Total penjualan            (↗)  │  label (muted, 14px) + optional circular icon/link
│                                 │
│ Rp68,8 jt                       │  value: big (28–40px), semibold, tabular, tight tracking
│ ▲ 2,4%  vs minggu lalu          │  delta pill (meaning color) + comparison context (muted)
└─────────────────────────────────┘
```
- **Always give context.** A number without comparison ("vs minggu lalu", "dari target
  Rp80 jt") isn't an insight.
- Abbreviate large values in cards (Rp68,8 jt, 12,4 rb) and show the exact value in a
  tooltip or the detail view.
- Units small and muted ("pcs", "/bln"), currency prefix consistent.
- Same height, same anatomy for all KPI cards in a row. Never enlarge or "pop out" one
  card beyond the grid. Emphasize with color fill instead (one tinted card at most).

## Deltas: color by meaning, not direction

| Metric | Value went up | Value went down |
|---|---|---|
| Revenue, orders, conversion, visitors | good → green | bad → red |
| Refunds, churn, cost, errors, response time | bad → red | good → green |
| Neutral metrics (page count, items) | neutral gray | neutral gray |

- The arrow shows direction (▲/▼); the color shows good/bad. Keep both, plus the sign
  and the number (color must never be the only signal).
- Use `.delta--good` / `.delta--bad` / `.delta--neutral`, not `--up` / `--down`.
- Brand accent colors (orange, violet) are never used for deltas.

## Choosing the chart

| Question | Chart | Avoid |
|---|---|---|
| How does it change over time? | line / area (continuous), bars (discrete periods ≤ 14) | pie |
| Which is bigger? (categories) | horizontal bars, sorted | 3D, radar |
| Part of a whole (≤ 5 parts) | stacked bar, single bar with segments, donut only if 2–4 parts | pie with 8 slices |
| Progress to target | progress bar, bullet chart, gauge (sparingly) | — |
| Steps of a process | funnel as bars with % drop between steps | — |
| Where? | map with values + a ranked list beside it | map alone |
| Exact values matter | table | chart |
| Trend inside a KPI | sparkline (no axes) | full chart in a card |

Two series at most per chart in dashboards; three only with clear distinct colors.

## Chart card anatomy

```
Total pendapatan                                ⋯
Rp98,6 jt  ▲ 8,4%                      ● Pendapatan  ○ Pesanan
                                              [Pendapatan | Pesanan]  ← optional series tabs
│ chart ───────────────────────────────────────────── │
Jan  Feb  Mar  …                                   ← x labels
```
- Title (what), headline number (how much), delta (vs what), legend (top right, dots),
  overflow menu for export/settings.
- Tabs switch the metric or funnel stage instead of drawing four lines at once.

## Highlight one thing

The strongest pattern in good dashboards: **one emphasized data point, everything else
muted.**
- Bars: the selected/latest/max bar in the accent color; others neutral or **hatched**.
- Lines: the main series in ink or accent; comparison series light gray; the selected
  point gets a dot, a vertical guide line and a dark tooltip.
- Default highlight = the latest period or the most important value; hover/focus moves
  it.

## Axes, gridlines, labels

- 3–5 horizontal gridlines, light (`--color-border`), dashed or solid 1px; no vertical
  gridlines; no chart border.
- Y labels abbreviated (10 rb, 20 rb / 10k), starting at 0 for bars. Never "05k".
- X labels: short and correct month names (Jan, Feb, Mar, Apr, Mei, Jun, Jul, Agu, Sep,
  Okt, Nov, Des). Show every other label on small screens.
- Labels 11–12px, muted, tabular numbers.
- Direct labels on bars/points beat a legend when there's room.

## Tooltips & crosshair

- Dark pill (`--color-ink` bg, `--color-on-ink` text), 8–12px radius, small arrow.
  Content: period label (muted), value (bold), and the series name if there are several.
- A vertical guide line (1px dashed) for line/area charts.
- Shows on hover **and** keyboard focus; tap on mobile; never covers the highlighted point.
- Exact values in tooltips, abbreviated values on axes.

## Color for data

- Data colors are separate tokens from UI colors: `--chart-1 … --chart-4`, plus
  `--chart-muted` for de-emphasized marks. Read them from CSS so themes apply.
- One accent + neutrals covers most dashboards; add a second hue only for a second series.
- Categorical colors share lightness and saturation (no neon next to pastel).
- Semantic colors (green/red) only for good/bad meaning.
- Check contrast of marks against the card (≥ 3:1) and in dark mode.

## Period controls

- Segmented pill tabs for presets: `7 hari · 30 hari · 12 bulan`.
- A date-range pill button with a calendar icon showing the active range
  ("1 Jan – 31 Mar 2026") opening a range picker.
- Keep the period in the URL (`?periode=30h`) so reload/back/share keep it.
- Show the comparison period in deltas ("vs 30 hari sebelumnya").

## Lists, tables and maps next to charts

- **Top lists**: thumbnail/logo · name + muted meta · value right-aligned. 4–6 rows, "Lihat
  semua" link. Equal row heights; never offset one row out of line for decoration.
- **Tables with progress**: a thin progress bar + value pill (e.g. 70%) in a column; a
  checkbox column only if bulk actions exist.
- **Maps**: tint regions by value (sequential, one hue), callouts for the top 3, and
  always a ranked list beside the map for exact comparison.

## Number formatting (Indonesia)

Use `Intl.NumberFormat`, never hand-built strings.

```js
const n   = new Intl.NumberFormat('id-ID');                                        // 12.485
const rp  = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }); // Rp 12.485
const cmp = new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 });               // 12,5 rb · 68,8 jt
const pct = new Intl.NumberFormat('id-ID', { style: 'percent', maximumFractionDigits: 1, signDisplay: 'exceptZero' }); // +2,4%
```
- Indonesian: dot for thousands, comma for decimals (12.485 · 2,4%). English: the reverse.
  One locale per page; match `<html lang>`.
- Currency: `Intl` outputs `Rp 68.837` (with a non-breaking space). Pick one style for the
  whole product: if compact values are `Rp68,8 jt`, strip the space from full values too
  (`.replace(/\s/g, '')` → `Rp68.837`). Compact: `Rp68,8 jt`, `Rp1,2 M` (miliar).
- Numeric table headers align like their values (right).
- Same metric, same format everywhere (card, tooltip, table).
- `responsive_check.js` flags malformed numbers (e.g. "45,6370", "637,73.83") and
  grouping that doesn't match the page language.

## Responsive charts

- Charts fill their card width and re-render on resize; fixed heights (200–280px desktop,
  180–220px mobile).
- On phones: fewer x labels, no secondary series, legend under the title, tooltip on tap,
  KPI cards 2-up or stacked; tables become stacked rows.
- Horizontal scrolling inside a chart only for long time series with a clear affordance.

## States & accessibility

- Loading: a skeleton block with the chart's height; empty: "Belum ada data untuk periode
  ini" + change-period action; error: retry.
- Each chart has an accessible name and summary (`role="img"` +
  `aria-label="Pendapatan 12 bulan, tertinggi Mei Rp9,8 jt"`) and a data table
  alternative (visually hidden or a "Lihat tabel" toggle).
- Don't rely on color alone: labels, patterns (hatching) and direct annotations.
- Respect reduced motion: no animated chart drawing.

## Styling chart libraries (Chart.js, ApexCharts, Recharts)

Most projects already use a library; its defaults look dated. Apply the rules above via
config, reading colors from CSS tokens:

```js
const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
// Chart.js
new Chart(ctx, {
  type: 'bar',
  data: { labels, datasets: [{ data, borderRadius: 8, borderSkipped: false,
    backgroundColor: (c) => (c.dataIndex === highlight ? css('--color-primary') : css('--color-border-strong')) }] },
  options: {
    plugins: { legend: { display: false },
      tooltip: { backgroundColor: css('--color-ink'), titleColor: css('--color-on-ink'), bodyColor: css('--color-on-ink'), padding: 10, cornerRadius: 10, displayColors: false } },
    scales: {
      x: { grid: { display: false }, border: { display: false }, ticks: { color: css('--color-text-muted') } },
      y: { grid: { color: css('--color-border') }, border: { display: false }, ticks: { color: css('--color-text-muted'), maxTicksLimit: 5,
        callback: (v) => new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(v) } } },
  },
});
// ApexCharts: chart.toolbar.show=false, grid.borderColor=--color-border, grid.xaxis.lines.show=false,
//   plotOptions.bar.borderRadius=8, dataLabels.enabled=false, tooltip.theme='dark', legend.position='top', colors from tokens.
// Recharts: <CartesianGrid vertical={false} stroke="var(--color-border)" />, <Bar radius={[8,8,0,0]}>, custom <Tooltip content={DarkPill}/>,
//   <XAxis axisLine={false} tickLine={false} />, <YAxis axisLine={false} tickLine={false} tickFormatter={compact} />.
```
Re-render or update colors on the `themechange` event when runtime theming is used.

## The bundled chart helper

`assets/charts.js` (+ styles in `assets/starter/nuansa.css`) draws dependency-free,
token-driven SVG charts for projects without a chart library:

```js
Charts.bar(el,  { labels, values, highlight: 4, format: (v) => rp.format(v), label: 'Pendapatan per bulan' });
Charts.area(el, { labels, values, highlight: 7, format: (v) => n.format(v), label: 'Produk dilihat' });
```
Hatched muted bars + one accent bar, smooth area with gradient, dark tooltip with guide
line, hover and keyboard (arrow keys) to move the highlight, compact Indonesian axis labels,
responsive re-render, theme-aware, and a visually hidden data table for screen readers.
See `assets/examples/admin-statistik.html`.

## Mistakes seen in polished-looking shots

Concept shots often look great and still contain these. Don't copy them:
- Broken digit grouping ("45,6370", "$637,73.83"), unformatted big numbers ("23000"
  next to "25.000"), axis label "05k".
- Typos in labels ("Fab", "Set" for Feb/Sep) and cut-off copy ("n overview of…").
- Delta colors that carry no meaning (positive in orange, negative in violet).
- One KPI card bigger and floating outside the grid; one table row shifted out of
  line to fake a hover. It breaks alignment and reads as a bug.
- Help "?" icons on every card instead of a clear label.
- Charts without a stated period or comparison.
