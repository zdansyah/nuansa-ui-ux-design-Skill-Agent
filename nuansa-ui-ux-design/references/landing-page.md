# Landing Page & Product Site Patterns

Patterns distilled from well-made modern product sites (Indonesian SaaS/utility sites
and editorial corporate sites). Use for home pages, product/marketing pages and public
pages of an app. Pair with `layout-system.md` for the grid rules.

## Contents
- The formula (section order)
- Navbar
- Hero variants
- Proof strip (stats)
- Steps ("Cara kerja")
- Feature bento with live mini-demos
- Product list / pricing / transparency
- CTA band
- Footer
- Single-task tool pages
- Typography recipe
- Color recipe
- Copywriting (Bahasa Indonesia)
- Signature details checklist

---

## The formula (section order)

```
Navbar (sticky, same container as content)
Hero      → one promise + one primary action + product shown
Proof     → 3 stats or logos (optional)
How       → 3 steps
Features  → bento grid, 4–6 cards, each with a mini-demo
Offer     → list / pricing / cost breakdown
CTA band  → repeat the main action
Footer
```

Keep it short. Good product sites have 4–6 sections; each section answers one
question (What is it? Why trust it? How does it work? What do I get? What does it cost?
What now?).

## Navbar

- Height 56–64px, sticky, background = page background (or translucent with blur) plus a
  hairline bottom border.
- Left: logo mark (rounded square icon) + wordmark. Middle or left after logo: 2–4 links.
  Right: theme toggle (sun/monitor/moon segmented, or a single icon), secondary "Masuk"
  (ghost), primary "Daftar"/"Dashboard" (filled, small: 32–36px tall).
- Mobile: logo + theme icon + hamburger; the drawer contains the links and the primary
  action at the bottom.
- Include a "Lompat ke konten" skip link (visually hidden until focused).

## Hero variants

1. **Product-as-hero (split)**: headline + subtext + CTAs on the left (6–7 cols); a real
   product UI on the right (phone mockup showing the live feature, or the dashboard).
   Better than stock photos: it proves the product exists.
2. **Interactive hero**: the core tool *is* the hero, e.g. a price/split calculator
   or a search box, right under the headline. Visitors get value before scrolling.
3. **Editorial split**: huge headline left (2 lines), short paragraph + CTA right,
   aligned to the headline's first line; a full-bleed image below (corporate/logistics).
4. **Tool hero band**: a dark band with a soft radial glow; the tool's key output (e.g. a
   generated address in monospace) + 3 round action buttons with labels underneath;
   a white card overlaps the band's bottom edge (`margin-top: -48px`).

Hero details that read as premium:
- An **eyebrow pill** above the headline: `● Gratis · Setup 5 menit` (dot, 13px, pill
  border).
- A **two-tone headline**: the first line in ink, the second line in muted gray (or with a
  **highlighter** block in the accent color behind the key words).
  ```css
  .hl-muted { color: var(--color-text-subtle); }
  .hl-mark { background: var(--color-primary); color: var(--color-on-primary); padding: 0 .12em; border-radius: .12em; box-decoration-break: clone; -webkit-box-decoration-break: clone; }
  ```
- Primary CTA (ink or accent pill, with a → arrow) + a secondary text link
  ("Gimana caranya?") that scrolls to the steps.
- A short subtext (≤ 2 lines, ~60ch), sometimes with the key number in bold
  ("mulai **Rp88.500** per orang").

## Proof strip (stats)

A single bordered box split into 3 cells by hairlines: big value (20–24px/700) + tiny
muted label ("< 3 dtk · Muncul di live", "0% · Potongan platform", "5 menit · Waktu
setup"). Sits under the hero CTAs, aligned to the text column. Or: a logo strip in gray.

## Steps ("Cara kerja")

- Centered section header: accent-colored uppercase eyebrow ("CARA KERJA") + a short,
  punchy heading ending with a period ("Tiga langkah. Selesai.") + one-line subtext.
- 3 cards: icon box top-left, a large faint step number top-right ("01"), title,
  1–2 line description. Dashed connector lines between cards on desktop.

## Feature bento with live mini-demos

- A 2-row bento: row 1 = wide (7–8 cols) + narrow (4–5 cols); row 2 = narrow + wide.
  It creates rhythm without imbalance.
- Card: icon box + uppercase label ("PEMBAYARAN"), title as a statement with a period
  ("QRIS instan."), an optional italic second line for emphasis ("Kurang dari 3 detik."),
  a description, then a **mini-demo**: a sample notification row, preset amount chips
  ("☕ 1rb", "🍜 10rb"), banned words shown struck through, a progress bar. The demo is
  real HTML styled with the same components, not an image.

## Product list / pricing / transparency

- **List rows** for offers (groups, plans, items): logo · name + meta · status
  (capacity boxes, "4 seat kosong") · price right-aligned with unit · small primary
  action ("Gabung"). All rows share one bordered container with hairline separators.
- **Cost transparency**: a stacked horizontal bar + a breakdown table with legend dots,
  amounts and percentages. It builds trust: "Semua tertulis di struk sebelum kamu bayar."
- Pricing cards (if needed): 2–3 plans, the recommended one highlighted with an ink or
  accent border and a badge. The same feature rows in each card, aligned across cards.
- Interactive selectors: chips for the product, a segmented control for the mode, number
  buttons for quantity, avatar slots that fill as you choose (the "Kamu / Teman" pattern).
  The selected state = accent fill + darker accent border.

## CTA band

A full-width card in the accent color (or ink) inside the container, radius 16–24px:
heading + one-line subtext left, primary (ink) + secondary (outline) buttons right.
Stacks on mobile with full-width buttons.

## Footer

Background = page background with a hairline top border. A 3-column grid: brand
(logo + 2-line description) · link group · link group, with small uppercase group
labels ("TAUTAN", "LEGAL"). A bottom row with © and one muted line (payment processor or
legal note). No social-icon clutter unless it's relevant.

## Single-task tool pages

For utilities (temp mail, converters, link shorteners, calculators):
- A narrow container (720–800px). The tool output is the hero: large, monospace if it's
  code/an address, with a copy button.
- 2–4 primary actions as round icon buttons with labels (Salin · Ganti · Acak).
- Results in one card with a title + count badge + refresh icon. The empty state is
  centered: icon in a rounded square, a "Menunggu email masuk…" message, optional
  helper text.
- Real-time hints: a subtle pulse/skeleton while waiting; a toast on copy ("Disalin").
- Check that every image asset loads. A broken banner with visible alt text ruins
  the polish (seen in the wild; `responsive_check.js` screenshots make it obvious).

## Typography recipe

- **One family**, chosen for character: Plus Jakarta Sans, Geist, Inter, Manrope, or
  the system UI stack for tools. Load only the weights you use (variable fonts allow
  550/650 for finer hierarchy).
- Display: `clamp(2.5rem, 6vw, 4.5rem)` up to 104px on wide screens; weight 650–800;
  **tracking −0.03 to −0.055em**; line-height 0.95–1.05.
- H2: `clamp(1.75rem, 3.5vw, 2.75rem)`, weight 600–800, tracking −0.015 to −0.02em.
- Body: 15–18px, line-height 1.55–1.6, muted ink (`#54555a`/`#555`) instead of black.
- Labels: 11–13px, uppercase, tracking +0.08em, semibold.
- Optional editorial warmth: a serif display (e.g. Fraunces, Instrument Serif, Newsreader)
  for headlines only, paired with a sans for UI. Good for wellness, content and
  community products.
- Store these as fluid tokens:
  ```css
  --fs-display: clamp(2.5rem, 6vw, 4.5rem); --fs-h2: clamp(1.75rem, 3.5vw, 2.75rem);
  --fs-h3: clamp(1.125rem, 1.5vw, 1.375rem); --fs-body-lg: clamp(1rem, 1.2vw, 1.125rem);
  --ls-display: -0.03em; --ls-heading: -0.015em; --ls-label: 0.08em; --lh-tight: 1.05;
  ```

## Color recipe

- Neutral canvas (`#fafafa` cool or `#fafaf8` warm) + white surfaces + hairline borders
  (`#e5e5e5` / `#e5e5e1`), ink text `#111`–`#16171a`, muted `#555`, subtle `#888`.
- **Warm neutrals** (`#fafaf8 / #f2f2ef / #e8e8e3 / #d3d3cd`) pair well with lime and
  orange accents; **cool neutrals** (slate) pair with blue and violet.
- **One signature accent**, used for:
  - eyebrow labels (e.g. a brand pink `#fe2c55` for a TikTok-related product), or
  - fills: the primary button, the selected state, the highlighter and the CTA band (e.g. lime
    `#c5f82d`, with dark text and a darker border `#96c900` for definition on white).
- Primary buttons are often **ink** (black) when the accent is used for highlights only.
- Dark mode + a theme toggle are expected on modern product sites. See `theming.md`.

## Copywriting (Bahasa Indonesia)

- Casual and direct, second person "kamu". Short sentences ending with a period read
  as confident: "Tiga langkah. Selesai." "Satu akun, dibagi rata."
- The headline states the outcome in ≤ 8 words. The subtext explains the mechanism in ≤ 2
  lines ("Scan QRIS → bayar → pesan muncul di overlay stream.").
- Buttons are verbs with an object: "Buka Dashboard →", "Pesan seat", "Cari teman
  patungan", "Gabung". Avoid "Klik di sini", "Submit", "OK".
- Form labels can be questions: "Mau gabung gimana?", "Patungan berapa orang?".
- Put numbers in copy: "< 3 detik", "0% potongan", "Hemat 74%".
- Microcopy for trust near actions: "Seat dikunci 15 menit selama kamu bayar."

## Signature details checklist

- [ ] Eyebrow pill or label above the headline/section titles
- [ ] Display headline with tight tracking and a two-tone or highlighter emphasis
- [ ] Product UI shown (mockup, live demo or the interactive tool) instead of stock art
- [ ] A stat strip or proof element near the hero
- [ ] Feature cards with live mini-demos built from real components
- [ ] Hairline borders + generous whitespace instead of shadows and dividers
- [ ] One accent, used consistently for the same role
- [ ] A theme toggle and a working dark mode
- [ ] Logo/edges aligned with content; header uses the content container
- [ ] Every section header follows the same formula
