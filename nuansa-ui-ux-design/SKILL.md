---
name: nuansa-ui-ux-design
description: Audit, redesign and tidy the UI/UX of a website or web app (landing pages, dashboards, admin panels, mobile web) into a modern, minimalist, clean, responsive, easily re-themed design while keeping every feature working. Use this skill whenever the user asks to redesign, restyle, "rapikan", "perbaiki tampilan", modernize, declutter, or make a site look premium/professional/not outdated ("tidak jadul"); fix layout, spacing, alignment, responsive/mobile issues, overflow or overlapping elements; clean up an admin panel or dashboard; standardize buttons, forms, tables, cards, modals; remove any native browser/Windows UI (alert/confirm/prompt, validation bubbles, "Leave site?", OS-styled controls); make a UI look like reference screenshots, Dribbble shots or a reference website URL; build or tidy a landing/product page; or let the site's colors/theme/dark mode be set from one place ("bisa ganti warna", theme switcher) — even for one page or component, and even when written in Indonesian.
---

# Nuansa UI/UX Design

Turn a working-but-messy web UI into one that feels calm, modern and premium — without
breaking anything. The two goals pull against each other, so the whole skill is about
holding both at once:

1. **Look**: modern, minimalist, clean, simple, professional, consistent, responsive.
2. **Safety**: every feature, route, form field, handler, permission check and workflow
   that worked before still works after.

When in doubt, choose the option that keeps behavior intact and makes future visual
changes cheap (one token or one component changes, not fifty files).

## Design principles (the "why" behind every decision)

The one-line test for every decision: **is it clean, tidy, and light on text?**
("bersih, rapi, tidak kebanyakan teks"). Modern doesn't mean glass, gradients or 3D;
those are optional styles. Clean structure with little text is not optional.

- **Hierarchy over decoration.** A page should have one obvious primary action and a clear
  reading order. Use size, weight, spacing and color contrast — not borders, gradients,
  shadows and icons everywhere — to show what matters.
- **Less text, more structure.** Users scan, they don't read. Move information out of
  sentences into numbers, chips, badges, icons, progress, avatars and color. Cards follow
  the 1-1-1 rule (one title, one meta line, one action); buttons ≤ 3 words; headings
  ≤ 8 words; no intro paragraphs on app pages. Details move behind "Lihat detail" or a
  detail page instead of being deleted. See `references/content-clarity.md`.
- **Remove, then refine.** Most "jadul" or "ramai" UIs are cluttered, not ugly. Cut
  redundant headings, repeated helper text, decorative dividers, stacked badges, welcome
  banners nobody reads, and duplicate navigation *before* polishing what remains. But
  removing *information the user needs to do a task* is a regression, not a cleanup (see
  "What may be removed").
- **One system, applied everywhere.** A fixed spacing scale, type scale, color palette,
  radius and shadow set — defined once as tokens — is what makes a site look designed.
  Random one-off values (`margin: 13px`, `#3a7bd5` in one place and `#3b82f6` in another)
  are what make it look amateur.
- **Reusable components, not page-specific styling.** Buttons, inputs, cards, tables,
  modals, toasts and badges are built once with variants. Pages compose them. This is
  what makes "easy to change later" true.
- **Tidy = few alignment lines + fixed gaps.** Layouts feel "rapi" when the header,
  content and footer share one container and grid, edges line up exactly, and each
  relationship (inside a group, between groups, between sections) always uses the same
  gap. See `references/layout-system.md`.
- **Mobile is a layout, not an afterthought.** Design for the narrowest screen first,
  then let the layout expand. Nothing should overflow horizontally, overlap, or require
  pinch-zoom at 360px.
- **Themeable by design.** Because everything runs on tokens, the accent color, dark
  mode, corner style and density can be switched site-wide from one place — offer this
  (see `references/theming.md`) whenever the user wants the site's colors to be settable.
- **No native browser/OS UI.** `alert()`, `confirm()` and `prompt()` look broken, block
  the thread, can't be styled, and are suppressed in some contexts. The same goes for
  "Please fill out this field" bubbles, "Leave site?" dialogs for in-app links, yellow
  `title` tooltips and OS-styled checkboxes/selects/file inputs. Replace them with one
  consistent toast + modal + inline-error system and restyled controls
  (`references/native-ui.md`).

## Workflow

Follow these phases in order. Don't jump to restyling before the audit — redesigns that
skip the audit are the ones that silently delete a form field or break a submit handler.

### Phase 1 — Understand the project (read, don't change)

1. Identify the stack: plain HTML/CSS/JS, Bootstrap, Tailwind, React/Vue/Svelte/Next,
   Laravel Blade, Django/Jinja, PHP templates, etc. Check `package.json`, framework config,
   template folders, existing CSS entry points.
2. **Work with the stack, not against it.** If the project uses Tailwind, extend
   `tailwind.config` / theme tokens. If it uses Bootstrap, override Sass/CSS variables. If
   it's plain CSS, introduce a token file. Don't add a second CSS framework or rewrite the
   app in a new framework — that's a migration, not a redesign.
3. List every page/view (public and admin) and every shared layout/partial. Note which
   layout each page uses.
4. Run the bundled scanners to get facts instead of guesses:
   - `python <skill>/scripts/find_native_dialogs.py <project-root>` — every
     `alert/confirm/prompt` call with file and line.
   - `python <skill>/scripts/style_audit.py <project-root>` — hard-coded colors, font
     sizes, `!important` and inline styles, so you know how fragmented the styling is.
5. If the app can be run locally, start it and capture "before" screenshots with
   `node <skill>/scripts/responsive_check.js` (see Phase 5). Keep these for comparison.

### Phase 2 — Audit and plan

Read `references/audit-checklist.md` and audit every page against it. Produce a short
audit (in the conversation, or as `UI-AUDIT.md` if the project is large) with:

- **Problems found**, grouped by type (layout, spacing, typography, color, navigation,
  components, responsiveness, native dialogs, clutter), each with file/page references.
- **Feature inventory** of what must survive: forms and their fields, buttons and the
  action each triggers, links/routes, table columns, filters, bulk actions, role-based
  visibility. This list is your regression checklist in Phase 5.
- **Plan**: tokens → base styles → components → layouts → pages, in that order.

If the user only asked for one page or component, scope the audit to that, but still
check whether a shared component or token change is the right fix.

**Choose a style direction.** Read `references/style-presets.md` and pick one preset
(Clean Pro, Soft Bento, Mono + Accent, Status Pastel, Editorial Neutral, Soft Glass, Pastel Blocks) that fits the product and any
reference images. If the user shared reference images/screenshots, write a short
"reference style spec" first (colors, radius, type scale, density, signature components)
as described there, and map it to tokens — borrow the visual language, keep the app's
own features and information architecture. If the user gave **reference URLs**, run
`node <skill>/scripts/extract_design.js --url <url> --out <dir>` for each one and look at
the screenshots it saves; it measures fonts, type scale and tracking, palette, radius,
buttons, section order, grid columns and container width. If the host is unreachable,
ask for screenshots instead.

Ask the user only about things that are genuinely theirs to decide and that you can't
infer: brand color/logo if none exists, whether a piece of content is really safe to
remove, whether dark mode is wanted. Otherwise pick sensible defaults and state them.

### Phase 3 — Build the foundation (tokens + base + components)

1. **Tokens.** Read `references/design-tokens.md` and create (or consolidate into) a single
   token source: CSS custom properties, Tailwind theme, or Sass variables, matching the
   stack. Include color (with semantic names like `--color-primary`, `--color-danger`,
   `--color-surface`, `--color-text-muted`), spacing scale, type scale, radius, shadow,
   z-index, transition and breakpoints, plus `--color-primary-text`, `--color-ink` and
   `--radius-control` (these make presets and runtime theming work). If the project has
   an existing brand color, keep it and derive the palette from it.
2. **Base styles.** Reset/normalize, `box-sizing: border-box`, body font and color,
   heading scale, link styles, focus-visible ring, `img { max-width: 100% }`, sensible
   form-control defaults.
3. **Components.** Read `references/components.md` and build or refactor the shared
   components the audit identified: button, input/select/textarea/checkbox, form field
   (label + control + hint + error), card, table (with responsive behavior), badge,
   modal/dialog, toast, dropdown, tabs, pagination, empty state, skeleton/loading — and,
   where the preset calls for them, the modern patterns: pill chips/segmented control,
   circular icon buttons, big-number stats, avatar stack, switch, progress, chart legend,
   grid↔list toggle, search pill, status card.
   In component frameworks, make these real components with props/variants. In
   server-rendered or plain HTML projects, make them CSS classes (e.g. `.btn`,
   `.btn--primary`) plus partials/includes where the templating supports it.
4. **Feedback system (no native UI).** Read `references/native-ui.md`. For plain
   JS/server-rendered projects, copy `assets/ui-feedback.js`, `assets/ui-feedback.css` and
   `assets/ui-controls.css` into the project and wire them in. They provide
   `UI.toast()`, `UI.confirm()`, `UI.prompt()` and `UI.alert()` (Promise-based),
   `data-confirm` for links/forms, automatic inline validation messages instead of
   browser bubbles, `data-unsaved-guard` for forms, `data-tooltip`, and restyled native
   controls. In React/Vue/etc., build the equivalent as components
   (or use the project's existing UI library's dialog/toast) with the same API shape.
   See "Replacing native dialogs safely" below — this is the most common place to
   introduce bugs.

5. **Theming (when wanted).** If the user wants colors to be settable — by an admin for
   the whole site, or per visitor — follow `references/theming.md`: copy
   `assets/theme.js` + `assets/theme.css`, add the head boot snippet, and add an
   "Tampilan / Appearance" settings section. Even if not requested, structure tokens so
   this is possible later, and mention it in the report.

### Phase 4 — Redesign layouts and pages

1. **Layouts first.** Read `references/layout-system.md` (grid, alignment lines, split
   header formula, spacing rhythm, card anatomy). Public site: header/nav, footer,
   content container, using the same container for header and content. Landing or
   product pages: follow the section formula and hero/feature patterns in
   `references/landing-page.md`. Admin panel:
   read `references/admin-panel.md` for sidebar + topbar layout, menu grouping, page
   header pattern, data tables, filters and forms. Mobile layouts and app-like UIs
   (bottom nav, app bar, sheets, onboarding): read `references/mobile-app.md`.
2. **Then pages**, one at a time, composing the components. For each page:
   - Establish the page header (title, optional one-line description, primary action).
   - Group related content into sections/cards; align everything to the grid and spacing scale.
   - Cut clutter (see below) and apply the text budgets and rewrite patterns in
     `references/content-clarity.md`: turn sentences into numbers/chips/badges, one
     primary CTA per view, one job per screen.
   - Replace one-off styles with tokens/components. Remove inline styles you've replaced.
   - Keep every `id`, `name`, `data-*` attribute, form `action`/`method`, event handler,
     route and CSRF token that the code or tests depend on. Changing a class name is fine
     only after you've checked no JS/tests select by it (grep for it).
3. Preserve accessibility while restyling: real `<button>` for actions, `<a>` for
   navigation, `<label for>` on inputs, visible focus states, color contrast ≥ 4.5:1 for
   body text, touch targets ≥ 40px on mobile, `aria-*` on modals/menus.

### Phase 5 — Verify (this is not optional)

1. **Responsive check.** If the app runs, use
   `node <skill>/scripts/responsive_check.js --url <base-url> --paths / /admin ...`
   (run with `--help` for options). It screenshots each page at mobile (375), tablet
   (768), laptop (1280) and desktop (1440) widths and reports horizontal overflow,
   elements wider than the viewport, overlapping interactive elements, clipped text,
   small touch targets, near-miss alignments (edges 2–6px off a shared line) and the text budget. Fix every
   finding, then re-run until clean. Look at the screenshots yourself — the script
   catches mechanical problems, not ugliness.
2. **Text budget.** `responsive_check.js` also reports too much text in the first phone
   screen, paragraphs over 30 words, button labels over 3 words and headings over 10
   words (long-form content in `<article>`/`[data-long-text]` is exempt). Rewrite until
   clean, or justify the exceptions in the report.
3. **Native UI gone.** Re-run `find_native_dialogs.py --all`; it should report zero
   `alert/confirm/prompt` calls in app code (vendor/minified files are excluded by
   default), and every "other native UI" item should be fixed or deliberately kept. Submit
   each form empty once: you should see inline errors, never a browser bubble.
4. **Feature regression check.** Walk the feature inventory from Phase 2: every form
   still submits with the same fields, every button still triggers its action, every
   route still renders, every confirm still guards the destructive action. Run the
   project's test suite and linter/build if they exist.
5. **Report** to the user: what changed (grouped), where the tokens/components live and
   how to re-theme (e.g. "change `--color-primary` in `styles/tokens.css`"), what was
   removed and why, anything you weren't able to verify, and before/after screenshots
   if you captured them.

## What may be removed (and what may not)

The brief "remove unimportant text and elements" is easy to over-apply. Use this test:
*does a user need this to understand where they are, decide what to do, or complete a
task?* If yes, keep it (you can restyle, shorten or move it). If no, remove it.

Usually safe to remove or merge:
- Repeated titles (breadcrumb + H1 + card title all saying "Data User").
- Filler copy ("Selamat datang di halaman manajemen data pengguna, di sini Anda dapat…").
- Decorative icons on every label, clip-art, heavy gradients, drop shadows on everything.
- Redundant buttons that do the same thing, duplicate nav links, dead links.
- Version numbers, copyright blocks or "Powered by" in places other than the footer.
- Placeholder text that only repeats the label.

Never remove without asking:
- Form fields, table columns, filters, actions, menu entries, or settings — even if they
  look rarely used. Hide behind "More"/overflow menus or collapse into detail views
  instead.
- Validation messages, legal text, prices, error states, empty states, status info.
- Anything referenced by JS, tests, analytics or SEO metadata.

## Replacing native dialogs safely

Native dialogs are synchronous; custom ones are asynchronous. A blind find-and-replace
breaks logic. For each call site from `find_native_dialogs.py`:

- `alert(msg)` → `UI.toast(msg, { type })` for notifications (success/error/info). Use
  `await UI.alert(msg)` only if the following code must wait for acknowledgement.
- `if (confirm(msg)) { doX() }` → make the enclosing function `async` and use
  `if (await UI.confirm({ title, message, confirmText, variant: 'danger' })) { doX() }`.
- `onclick="return confirm('Hapus?')"` on links/forms → remove the inline handler, add a
  `data-confirm="Hapus data ini?"` attribute, and let the bundled `ui-feedback.js`
  intercept the click/submit, show the modal, then continue the original navigation or
  `form.submit()` on confirmation. This keeps server-side flows (e.g. Laravel/PHP delete
  forms) working unchanged.
- `const v = prompt(msg, def)` → `const v = await UI.prompt({ title, label, defaultValue })`,
  which resolves to `null` on cancel, just like native `prompt`. Make callers `async`.
- After making a function `async`, check its callers: anything that relied on its return
  value now receives a Promise. Event handlers are fine; return-value consumers must
  `await`.
- Keep the same wording intent but make messages specific: "Hapus pengguna *Budi*? Tindakan
  ini tidak bisa dibatalkan." beats "Are you sure?".

## Style defaults (use unless the project already has a brand)

- **Font**: system UI stack or one clean sans (Inter, Plus Jakarta Sans, Geist). Max two
  weights for body (400/500) plus 600 for headings. Base size 16px on public sites,
  14–15px is acceptable inside dense admin tables.
- **Color**: neutral gray scale for 90% of the UI, one primary accent, semantic
  success/warning/danger/info. White or near-white surfaces on a very light gray app
  background. Avoid pure black text; use a dark neutral (e.g. `#0f172a`/`#111827`).
- **Spacing**: 4px base scale (4, 8, 12, 16, 20, 24, 32, 40, 48, 64). Generous section
  spacing, tight related-element spacing — proximity communicates grouping.
- **Radius**: one small (6px) for inputs/buttons and one medium (10–12px) for cards/modals.
- **Shadow**: subtle, used for elevation only (dropdowns, modals, sticky headers), not on
  every card — prefer a 1px border on cards.
- **Motion**: 150–200ms ease-out for hover/focus/open; respect `prefers-reduced-motion`.
- **Icons**: one icon set, one size per context, always paired with text for primary
  actions (icon-only buttons need `aria-label` and a tooltip).

## Bundled resources

- `references/audit-checklist.md` — page-by-page audit + final QA checklist. Read in Phase 2 and Phase 5.
- `references/design-tokens.md` — token templates for plain CSS, Tailwind and Bootstrap/Sass, plus dark mode. Read in Phase 3.
- `references/components.md` — specs and markup patterns for every core component, including responsive tables. Read in Phase 3.
- `references/admin-panel.md` — admin/dashboard layout, menu grouping, bento dashboards, tables, filters, forms. Read when an admin panel or dashboard is in scope.
- `references/style-presets.md` — 7 visual directions (Clean Pro, Soft Bento, Mono + Accent, Status Pastel, Editorial Neutral, Soft Glass, Pastel Blocks) with token overrides, how to extract a style spec from reference images or URLs, dated patterns to avoid. Read in Phase 2.
- `references/layout-system.md` — the rules behind a tidy layout: grid, alignment lines, split header, spacing rhythm, card anatomy, dashboard grids, numbers, responsive collapse. Read in Phase 4.
- `references/landing-page.md` — product/landing page formula: navbar, hero variants, stat strip, steps, bento features with live mini-demos, pricing/transparency, CTA band, footer, typography/color recipes, Indonesian copywriting. Read for public/marketing pages.
- `references/mobile-app.md` — safe areas, thumb zone, app bar, bottom nav, sheets, onboarding. Read when mobile/app-like UI is in scope.
- `references/theming.md` — site-wide / per-user color, dark mode, corner and density switching. Read when colors should be settable.
- `references/content-clarity.md` — the "less text" rules: text budgets, turning sentences into structure, the 1-1-1 card rule, one screen one job, microcopy lengths, Indonesian before/after rewrites, color as information. Read in Phase 2 and Phase 4.
- `references/native-ui.md` — map of every native popup/control to its replacement, setup, validation customization, unsaved-changes guard, what must stay native. Read in Phase 3.
- `assets/ui-feedback.js` + `assets/ui-feedback.css` — drop-in, dependency-free toast/confirm/prompt/alert, `data-confirm`, automatic inline validation (no browser bubbles), unsaved-changes guard, tooltips.
- `assets/ui-controls.css` — restyles native checkbox/radio/switch, select, file input, range, date, number, scrollbars, autofill and focus ring to match the tokens.
- `assets/theme.js` + `assets/theme.css` — runtime theme engine (accent with auto-derived hover/soft/contrast-safe text, light/dark/system, sharp/soft/round, density) and a ready-made picker panel.
- `scripts/find_native_dialogs.py` — locate `alert/confirm/prompt` calls; `--all` also lists beforeunload, window.open, title tooltips and unstyled native controls.
- `scripts/style_audit.py` — measure styling fragmentation (hard-coded colors, font sizes, inline styles, `!important`).
- `scripts/responsive_check.js` — Playwright screenshots at 4 widths + overflow/overlap/clipping/touch-target/near-miss-alignment/text-budget/native-dialog detection.
- `scripts/extract_design.js` — learn a reference site's design system from its URL (screenshots + fonts, type scale, palette, radius, buttons, sections, grid, CSS variables).
