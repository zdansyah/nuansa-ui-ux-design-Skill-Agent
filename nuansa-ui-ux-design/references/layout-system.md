# Layout System — why some layouts feel "rapi banget"

A layout looks tidy when the eye finds **few, strong lines** and **predictable gaps**.
It's not talent; it's a handful of rules applied without exception. Use this file when
building or fixing any page layout, and verify with `scripts/responsive_check.js`, which
reports near-miss alignments.

## Contents
- The 8 rules
- Grid & container
- Alignment lines
- Split header formula
- Spacing rhythm
- Card anatomy
- Dashboard grids
- Numbers & tabular data
- Responsive collapse
- Self-check before shipping

---

## The 8 rules

1. **Everything sits on a grid.** A centered container with a 12-column grid; blocks
   start and end on column lines.
2. **Few alignment lines.** The logo, headline, cards and footer share one left edge;
   the nav CTA, the right column and the last card share one right edge. Each extra edge
   is visual noise. A 2–6px near-miss looks like a mistake.
3. **One gap per relationship.** Use the same value every time for the same
   relationship: inside a group, between groups, between sections.
4. **Proximity = meaning.** Space between groups is clearly larger than space within
   them (roughly 2–3× at each level).
5. **Repeated things are identical.** Cards in a row share padding, header structure,
   height and inner alignment.
6. **Strong type contrast, few sizes.** One huge display size, one heading size, body,
   and small. Per card, 2–3 sizes at most.
7. **Numbers line up.** Right-align numbers, use tabular figures, and make units smaller
   and muted.
8. **Whitespace is structure.** Big section padding (64–128px desktop) keeps sections
   distinct, so you can drop dividers and background stripes.

## Grid & container

```css
.container { width: 100%; max-width: var(--container-max, 1200px); margin-inline: auto; padding-inline: var(--space-4); }
@media (min-width: 768px)  { .container { padding-inline: var(--space-6); } }
@media (min-width: 1024px) { .container { padding-inline: var(--space-8); } }
.grid-12 { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); column-gap: var(--gutter, 24px); }
```

- Container 1120–1240px for marketing pages; 760px for single-task tools (an inbox, a form, a
  checkout); fluid up to ~1440px for dashboards.
- **The header uses the same container as the content.** That's why the logo's left edge
  lines up with the hero headline and the Dashboard button's right edge lines up with
  the cards below. Most "berantakan" pages break this rule first.
- Gutter: 16px on mobile, 20–24px on desktop. Dashboards can go to 12–16px.

## Alignment lines

- Left-aligned text is tidier than centered text for anything longer than 2 lines.
  Center only short hero/section headers and empty states.
- Icons inside cards sit on the same left inset as the text below them, not indented.
- In a 4-up feature row, each icon, title and paragraph starts on its column line, and
  all four titles share a baseline (same icon size, same margins).
- Right column contents (paragraph, checklist, CTA) align to **one** left edge, and their
  first line aligns with the **top** of the headline (or its cap height) in the left column.
- Buttons in a row are the same height. A text-only secondary CTA shares the primary
  button's vertical center.
- Optical fixes: icons a little larger than the text cap height, centered on the first
  line, not the block. Big headlines with negative tracking can look indented; nudge with
  `margin-left: -0.04em` if needed.

## Split header formula

The most reliable "premium" section header, used across editorial and SaaS sites:

```
/EYEBROW LABEL
Big heading spanning           Short supporting paragraph,
columns 1–7, two lines.         2–4 lines, columns 8–12.
                                [ Primary action ]
```

```css
.split-head { display: grid; gap: var(--space-6); }
@media (min-width: 1024px) {
  .split-head { grid-template-columns: repeat(12, minmax(0, 1fr)); column-gap: var(--gutter, 24px); align-items: start; }
  .split-head__title { grid-column: 1 / span 7; }
  .split-head__aside { grid-column: 8 / span 5; padding-top: .5em; } /* aligns paragraph with the heading's first line */
}
.eyebrow { font-size: var(--text-xs); font-weight: var(--weight-semibold); letter-spacing: .08em; text-transform: uppercase; color: var(--color-text-muted); margin-bottom: var(--space-3); }
```

Variant for centered sections: eyebrow (in the accent color), heading, one-line subtext,
max-width ~640px, then the content grid below.

Hero version: headline left (7 cols), on the right a subtext plus a 3-item checklist with
icons, rows separated by hairlines, plus the CTA. Or headline + CTAs left with a product
visual right (6/6).

## Spacing rhythm

Pick values from the scale and keep them fixed per relationship:

| Relationship | Mobile | Desktop |
|---|---|---|
| label → control, title → subtitle | 4–8px | 4–8px |
| items inside a card | 12–16px | 16px |
| card padding | 16–20px | 20–24px |
| between cards (gutter) | 12–16px | 16–24px |
| section header → section content | 32px | 48–64px |
| between sections | 64px | 96–128px |

Write these as tokens (`--space-*`) or utility classes, and never "eyeball" a 13px margin.

## Card anatomy

Every card in a product follows **one** anatomy:

```
┌───────────────────────────────────────────┐
│ Title                       [control ▾][⋯] │  ← header row: title (16–18/500), optional
│ Muted subtitle / period                    │     muted subtitle, controls right-aligned
│                                            │
│ $12,450        ← primary value (big)       │  ← body: one focal element
│ ▂▃▅▇▅▃  chart / list / progress            │
│                                            │
│ footnote or link →                         │  ← optional footer, muted
└───────────────────────────────────────────┘
```

- Same padding on all four sides, same radius, same header height across cards.
- In one row, cards stretch to equal height (`align-items: stretch`). Content inside
  aligns to the top, and footers pin to the bottom with `margin-top: auto`.
- Feature cards: icon box (32–40px, hairline border) + small uppercase label on the same
  row, then the title, then a description, then an optional **live mini-demo** of the
  feature (a sample toast, chips, a progress bar), which shows the feature better than an
  illustration does.
- Step cards: a large faint number (01 / 02 / 03) top-right, icon top-left, with dashed
  connectors between cards on desktop.

## Dashboard grids

- One gap value for the whole dashboard. Outer page padding is equal to the gap or 2×.
- Build on a 12-column grid with spans 3/4/6/8/12. A right "rail" column (KPI stack or
  activity list) spans 3–4 columns and the full height.
- Row 1: hero metric/chart (8 cols) plus a KPI column (4 cols) with 3 stacked
  value/label/delta blocks separated by space, not boxes.
- Tables inside cards: rows as hairline-separated lines, or as separate rounded
  row-cards with an 8px gap. Use one style per product.
- Tabs with counts ("Pending 70 · Assigned 53"): a segmented pill with the active
  segment on a white surface.
- Horizontally scrolling selectable cards (vehicles, accounts) with the active one raised
  (white, shadow) and the rest muted.

## Numbers & tabular data

```css
.num { font-variant-numeric: tabular-nums; text-align: right; }
.money { font-weight: var(--weight-semibold); letter-spacing: -0.02em; }
.money .cents, .money .unit { color: var(--color-text-muted); font-weight: var(--weight-normal); font-size: .6em; }
.delta { display: inline-flex; align-items: center; gap: 2px; padding: 2px 6px; border-radius: var(--radius-full); font-size: var(--text-xs); font-weight: var(--weight-medium); }
.delta--up { background: var(--color-success-soft); color: var(--color-success); }
.delta--down { background: var(--color-danger-soft); color: var(--color-danger); }
```

- Price lists: name and meta on the left, value right-aligned, with the unit
  ("per orang/bulan") muted under the value.
- Breakdown tables (cost transparency): colored legend dot · label · amount (right) ·
  percent (right, muted), with a stacked bar above using the same colors.
- Indonesian currency: `Rp1.062.000` (no space, dot thousands). Format with
  `Intl.NumberFormat('id-ID')` and keep it consistent everywhere.

## Responsive collapse

| Desktop | Tablet (768) | Mobile (≤ 640) |
|---|---|---|
| 12-col split header 7/5 | stacked, aside below title | stacked |
| 4-up feature row | 2 × 2 | 1 column (or a 2-col compact grid for tiny items) |
| 3 step cards with connectors | 3-up or stacked | stacked, connectors hidden or vertical |
| bento 8/4 + 4/8 | 6/6 | 1 column, keep the order of importance |
| hero text + product visual | stacked, visual below | stacked, visual below or hidden if decorative |
| table | scroll container | stacked rows / row-cards |

When stacking, keep the **reading order** (headline → value → action) and the **left
edge** (16px gutter) consistent. On phones, hero headlines stay big (40–56px) with tight
tracking; that's what keeps a mobile layout from feeling generic.

## Self-check before shipping

- [ ] Header, sections and footer share one container, so left and right edges match.
- [ ] `responsive_check.js` shows no near-miss alignment warnings at 1280/1440.
- [ ] The same relationship always uses the same gap (inspect 3 random spots).
- [ ] Cards in a row are equal height with identical header structure.
- [ ] Numbers are right-aligned and tabular, and units are muted.
- [ ] Each section has one focal point; nothing competes with the headline.
- [ ] At 375px, the left gutter is identical for every block.
