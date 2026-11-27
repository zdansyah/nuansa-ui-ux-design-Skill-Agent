# Style Presets & Learning From Reference Images

"Modern minimalist" covers several distinct looks. Pick one direction per project and
apply it consistently — mixing them is what makes a UI feel generic. Each preset below is
a set of token overrides plus component-shape rules, so switching presets is mostly a
token change.

## Contents
- How to extract a style from reference images
- Preset 1 — Clean Pro (default; admin-heavy apps)
- Preset 2 — Soft Bento (dashboards, SaaS)
- Preset 3 — Mono + Accent (bold, Gen-Z, mobile-first; e.g. black + lime)
- Preset 4 — Status Pastel (task/application tracking, utility apps)
- Preset 5 — Editorial Neutral (product sites, corporate, landing pages)
- Preset 6 — Soft Glass (fintech, wellness, consumer apps, hero dashboards)
- Preset 7 — Pastel Blocks (learning, health, lifestyle, booking apps — no glass needed)
- Learning from a live reference URL
- Shared "modern" signals across all presets
- What makes a UI look dated (avoid)
- Dribbble-to-production adjustments

---

## How to extract a style from reference images

When the user shares screenshots/Dribbble shots, don't copy pixels — extract a spec and
map it to tokens before writing code. Write the spec down (in the conversation) like this:

```
Reference style spec
- Background: very light cool gray (#eef0f4); cards white, borderless, soft shadow or none
- Accent: lime #d4ff3a used as FILL only (cards, active chip, progress); text on it black
- Primary action: near-black pill (#111) with white text
- Radius: cards 24–28px, controls fully pill (9999px), icon buttons circular 40–44px
- Type: large display headings (32–40px mobile, 48–64px desktop), weight 500, tight tracking (-0.02em);
  muted eyebrow/subtitle above title; big numbers for KPIs with small muted label below
- Density: airy; 20–24px card padding; 12–16px gaps in bento grid
- Signature details: circular outline icon buttons at card top-right (↗, +, filter);
  hatched/striped pattern for the "remaining" part of progress bars & inactive chart bars;
  avatar stack + "+" button; segmented bottom nav with wider active black pill
- Maps to: Preset 3 (Mono + Accent) with radius=round
```

Then: set tokens (`design-tokens.md`), set `--radius-control` / radius preset, build the
signature components (`components.md` → "Modern patterns"), and apply to pages. If the
user only gives images and an existing app, keep the app's information architecture and
features; borrow the visual language, not the content.

## Preset 1 — Clean Pro (default)

Best for: admin panels, internal tools, data-heavy apps, conservative brands.

- Background `#f8fafc`, white cards with 1px `--color-border`, no or tiny shadow.
- Accent: one saturated brand color (blue/indigo/teal). Primary button = accent fill.
- Radius: soft (`6 / 10 / 16`, controls 8px).
- Type: 14–16px body, page titles 24px/600.
- Density: comfortable, can go compact in tables.
- This is what `design-tokens.md` ships by default.

## Preset 2 — Soft Bento (reference: project dashboards, income trackers)

Best for: SaaS dashboards, analytics home pages, portfolio/freelancer apps.

```css
:root {
  --color-bg: #eef1f5;              /* soft cool gray canvas */
  --color-surface: #fbfcfd;         /* cards almost white */
  --color-border: transparent;      /* borderless cards */
  --color-text: #111318;
  --color-text-muted: #6b7280;
  --color-primary: #111318;         /* near-black is the "primary"; color is for data */
  --color-on-primary: #ffffff;
  --radius-sm: 12px; --radius-md: 24px; --radius-lg: 32px; --radius-control: 9999px;
  --shadow-sm: 0 1px 2px rgb(16 24 40 / .04), 0 8px 24px rgb(16 24 40 / .04);
}
```

Signature rules:
- **Bento grid**: dashboard made of cards of different spans on a 12-col grid
  (e.g. tasks 4 cols tall, overview 4, chart 4, invoice 8). Gap 16–24px.
- **Card header** = title (18–20px/500) left + circular outline icon button right
  (`+` add, `↗` open, sliders filter). No card footers.
- **Pill segmented filters** at page or card level (Today / This Week / This Month):
  active = black fill, inactive = outlined pill.
- **Big page title** (40–56px desktop) with a muted one-line eyebrow above it.
- **Icon rail sidebar**: 72px, circular icon buttons, active = black filled circle.
- **Data colors** carry the color: orange/blue/purple series on a neutral UI;
  legends as colored dots + label + value ("● In Progress: 14").
- Tinted task cards (very soft orange/blue backgrounds) for items needing attention.

## Preset 3 — Mono + Accent (reference: black + lime mobile apps)

Best for: consumer/mobile apps, fintech-lite, HR/team apps, modern landing pages, brands
that want energy without clutter.

```css
:root {
  --color-bg: #e9eaec;              /* light neutral gray canvas */
  --color-surface: #ffffff;
  --color-surface-muted: #f2f3f5;
  --color-border: transparent;
  --color-text: #0a0a0a;
  --color-text-muted: #6b6f76;
  --color-primary: #d4ff3a;         /* lime accent = FILL color */
  --color-on-primary: #0a0a0a;      /* dark text on lime */
  --color-primary-text: #4d6400;    /* lime darkened for text on white (theme.js derives this) */
  --color-ink: #0a0a0a;             /* black for primary CTAs, active chips, active nav */
  --radius-sm: 14px; --radius-md: 28px; --radius-lg: 36px; --radius-control: 9999px;
}
```

Signature rules:
- **Two-level emphasis**: black (`--color-ink`) for the main action/active state, accent
  for highlight surfaces (one hero card, progress fill, selected chart bar, toggle on).
  Everything else is white/gray. Use the accent on ≤ 10–15% of the screen.
- **Color-blocked hero card**: one card per screen fully filled with the accent,
  containing a big number (48–64px) + small label ("28 / In Team").
- **Hatched "remaining" fill**: progress bars and inactive chart bars use a diagonal
  stripe pattern instead of a flat gray:
  `background: repeating-linear-gradient(135deg, transparent 0 6px, rgb(0 0 0 / .08) 6px 7px);`
- **Pill chart bars**: rounded-full bars; the selected one in accent with value label above.
- **Circular icon buttons** (44px) grouped top-right; the "go" action (↗) in black.
- **Avatar stack** (overlap -10px, 2px white ring) ending with a black "+" circle.
- **Big display type** with tight tracking; currency symbol as superscript (`$1,680`).
- **Segmented bottom nav**: floating pill container; active item is a wider black pill.
- Calendar: days as rounded squares, selected = black square with check.

## Preset 4 — Status Pastel (reference: grid vs list application tracker)

Best for: request/application tracking, ticketing, task lists, government/service apps.

- Neutral white UI, cool very light background (`#f3f4fb`).
- **Status drives color**: each status maps to one hue used as a soft card background
  + a solid pill badge with icon/dot:
  revision/pending → orange, ongoing → gray, issued/completed → green, rejected → red.
  ```css
  .status-card { border-radius: var(--radius-md); padding: var(--space-4); background: var(--status-soft, var(--color-surface-muted)); }
  .status-card[data-status="revision"] { --status: #f97316; --status-soft: #fff4ec; }
  .status-card[data-status="ongoing"]  { --status: #6b7280; --status-soft: #f1f2f6; }
  .status-card[data-status="done"]     { --status: #10b981; --status-soft: #e8f8f3; }
  .status-card[data-status="rejected"] { --status: #e11d48; --status-soft: #fdecef; }
  ```
- **Sectioned lists**: small muted section labels ("Updates", "History"). Active items
  use tinted cards (they need attention); history uses plain white cards with a border
  (de-emphasized) — color is reserved for what's actionable now.
- **Grid ↔ List toggle** for the same data: grid = 2-col cards with status icon top,
  title, status text in status color, relative time muted; list = full-width rows with
  badge + time on top line, title, chevron right. Same component, two layouts.
- Filter chips row under the title (All / Active / Completed), active = dark fill.
- Relative time ("2 min ago") muted and right-aligned in list view.

## Preset 5 — Editorial Neutral (reference: modern Indonesian product sites, corporate logistics site)

Best for: product/landing pages, SaaS marketing, corporate sites, public pages of an app.
Full section patterns are in `landing-page.md`; grid rules in `layout-system.md`.

```css
:root {
  --font-sans: "Plus Jakarta Sans", "Geist", ui-sans-serif, system-ui, sans-serif;
  --color-bg: #fafafa;            /* or warm #fafaf8 */
  --color-surface: #ffffff;
  --color-surface-muted: #f5f5f5; /* warm: #f2f2ef */
  --color-border: #e5e5e5;        /* hairlines carry the structure */
  --color-text: #111111;
  --color-text-muted: #555555;
  --color-text-subtle: #888888;
  --color-ink: #111111;           /* primary buttons */
  --color-primary: #fe2c55;       /* ONE signature accent: labels/highlights (or lime #c5f82d as fill) */
  --radius-sm: 8px; --radius-md: 12px; --radius-lg: 16px; --radius-control: 9999px; /* or 8px for a crisper feel */
  --fs-display: clamp(2.5rem, 6vw, 4.5rem); --ls-display: -0.035em; --lh-tight: 1.02;
}
```

Signature rules:
- Huge display headline with heavy weight (650–800) and tight tracking; two-tone
  (ink + gray) or a highlighter block in the accent.
- An eyebrow pill above the hero headline; uppercase accent eyebrows above section titles.
- Hairline-bordered white cards on a near-white canvas; shadows only on floating mockups.
- The product shown as the hero visual (phone/dashboard mockup or an interactive tool).
- Split header formula (heading 7 cols / text 5 cols) for corporate sections; centered
  header formula for product sections.
- A theme toggle in the navbar. Dark mode is expected.

## Preset 6 — Soft Glass (reference: crypto/stake app, logistics hero dashboard, insurance app, wellness app)

Best for: consumer fintech, wellness, insurance/health apps, "hero" dashboards with a
central object. Use sparingly in dense admin screens.

```css
:root {
  --color-bg: #eef1f6;
  --glass: rgb(255 255 255 / .55);
  --glass-strong: rgb(255 255 255 / .8);
  --glass-border: rgb(255 255 255 / .7);
  --radius-md: 24px; --radius-lg: 32px; --radius-control: 9999px;
}
.glass { background: var(--glass); border: 1px solid var(--glass-border); border-radius: var(--radius-lg);
  backdrop-filter: blur(18px) saturate(140%); -webkit-backdrop-filter: blur(18px) saturate(140%);
  box-shadow: 0 1px 0 rgb(255 255 255 / .6) inset, 0 12px 32px rgb(15 23 42 / .08); }
.page-glow { background:
  radial-gradient(40% 35% at 15% 10%, rgb(147 197 253 / .45), transparent 70%),
  radial-gradient(35% 30% at 85% 30%, rgb(253 224 71 / .35), transparent 70%), var(--color-bg); }
@supports not (backdrop-filter: blur(1px)) { .glass { background: var(--glass-strong); } }
```

Signature rules:
- Soft color blobs behind (2 hues max, low saturation). Frosted cards float above them.
- Big numbers ($17,340) with small **delta pills** (+0.60%) in a warm accent.
- **Notch labels**: a small white pill sitting on a card's edge ("Your History",
  "Daily Expenses") instead of a full card header.
- A central hero object (product image, vehicle, mascot) with floating glass widgets
  around it (KPI, gauge, mini chart).
- Image cards with a dark gradient overlay at the bottom and white title + tag pill on top.
- Mesh/gradient hero cards (orange→red) for the one card that matters most (e-card,
  welcome card); everything else stays neutral.
- Serif display headings + pastel tints for wellness/emotional products.
- Guardrails: test text contrast **on the busiest part** of the blurred background; keep
  body text on solid or strong glass; limit blur layers (each one costs GPU on low-end
  phones); respect `prefers-reduced-transparency` where supported by falling back to
  `--glass-strong`.

## Preset 7 — Pastel Blocks (reference: learning roadmap app, parking finder, quiz app, yoga/fitness app, mood tracker)

Best for: consumer apps (learning, health, fitness, booking, wellbeing), friendly
dashboards. The cleanest "colorful" look: flat, no glass, and very little text. Pair
with `content-clarity.md`; this preset depends on its text budgets.

```css
:root {
  --font-sans: "Urbanist", "Outfit", "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif; /* geometric, friendly */
  --color-bg: #f4f5f9;              /* or pure white screens on a light gray canvas */
  --color-surface: #ffffff;
  --color-surface-muted: #eef0f5;
  --color-border: transparent;
  --color-text: #111111;
  --color-text-muted: #8a8f98;
  --color-ink: #111111;             /* primary CTA, active chip, active nav */
  --color-on-ink: #ffffff;
  /* category hues: one family (same lightness/saturation) */
  --cat-1: #a5b4fc; --cat-2: #f9a8d4; --cat-3: #fdba74; --cat-4: #86efac; --cat-5: #93c5fd;
  --radius-sm: 14px; --radius-md: 24px; --radius-lg: 32px; --radius-control: 9999px;
}
.block { border-radius: var(--radius-md); padding: var(--space-5); background: var(--cat, var(--color-surface-muted)); color: var(--color-text); }
```

Signature rules:
- **Color-blocked cards by category**: each card is one flat pastel fill (purple course,
  orange focus, blue balance). Category = color, consistently, which replaces labels.
- **1-1-1 cards**: icon/visual, title, one meta line, one action (ink circle with an
  arrow or a "Gabung" pill). Progress as a small ring ("2/3") in the corner.
- **Ink primary**: black pill CTAs ("Get Started", "Next", "Slide to Park"), black active
  chip, and an ink bottom-nav bar with the active item as a white circle (or a light
  pill bar with an ink active circle).
- **Chip rows** for categories and filters, with icons and count badges ("All 34").
- **Week strip** (Sun–Sat pills) for date-based apps; selected day = ink.
- **Big numbers, small units**: "$7.00 / hr", "12:15 pm", "53.3 kg"; stat tiles in pastel.
- **One question per screen** for onboarding/check-ins: big visual (illustration, 3D
  object, mascot), short question (≤ 6 words), large answer chips/tiles, segmented
  progress bar on top, "Skip" text + "Next" pill.
- **One illustration style** across the app (line doodles, flat vector or 3D, never mixed).
- Dark screens are allowed for focus moments (onboarding, mood check-in), with the same
  chips and pills inverted.
- Circular icon buttons (back, menu, notifications with a dot) in the top bar.

## Learning from a live reference URL

If the user gives URLs of sites they like:
1. Run `node scripts/extract_design.js --url <url> --out <dir>`. It saves desktop + mobile
   screenshots and a `-design.md` summary: fonts, type scale with tracking, palette by
   usage, radius, shadows, button styles, section order with grid columns, container
   width, `:root` CSS variables, dark-mode support, tech stack.
2. Look at the screenshots yourself; the numbers explain *how*, the screenshots show *what*.
3. Write the reference style spec (format above) and pick or blend a preset.
4. Map to tokens and components. Borrow the system (scale, rhythm, shapes, section
   formulas), never the content, brand, logo or imagery.
5. If the sandbox can't reach the URL (network policy), ask for screenshots instead, or
   ask the user to allow the host.

## Shared "modern" signals across all presets

- Generous whitespace; fewer, larger, clearer elements.
- Pill or softly-rounded controls; circular icon buttons for secondary actions.
- One accent; near-black for primary emphasis; color mostly for data and status.
- Large confident headings, medium weight, slightly tight tracking; small muted labels.
- Big numbers for KPIs with tiny labels; tabular numerals.
- Borderless cards separated by background contrast (or 1px hairline borders in Clean Pro).
- Minimal charts: no gridline clutter, rounded bars, dots-and-labels legends, a single
  highlighted data point with a dark tooltip pill.
- Mobile: floating bottom nav, circular back button, sheet-style cards, thumb-reachable CTAs.

## What makes a UI look dated (avoid)

- Gradient-filled buttons and headers, especially multi-hue (purple→teal), glossy effects.
- Many saturated colors competing; colored sidebars with white text and icons in boxes.
- Heavy drop shadows on every card, bevels, thick borders, small border-radius (2–4px)
  mixed with large ones.
- Tiny 12–13px body text, ALL-CAPS labels everywhere, centered long paragraphs.
- Default browser controls, native dialogs, table-based layouts, jQuery-UI themes.
- Icons in colored circles on every KPI card with no meaning.

## Dribbble-to-production adjustments

Concept shots optimize for a screenshot, not daily use. When adopting them:
- **Raise contrast**: shots often use light-gray text on light-gray backgrounds. Keep
  body text ≥ 4.5:1 and muted text ≥ 4.5:1 for anything people must read.
- **Raise text size**: keep body ≥ 14px (admin) / 16px (public & mobile).
- **Don't copy the presentation frame**: the gradient backdrop and tilted phone mockups
  are for the shot, not the product.
- **Real data is longer**: test with long names, big numbers, empty states, 0 items and
  100+ items; make cards wrap/truncate gracefully.
- **Keep it accessible**: pill toggles need labels; icon-only circles need `aria-label`;
  color-coded status needs text.
