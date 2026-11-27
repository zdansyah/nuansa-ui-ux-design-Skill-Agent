---
name: nuansa-ui-ux-design
description: Design, redesign and tidy the UI/UX of any website or web app, new or existing (company profiles, landing/SaaS, e-commerce, blogs and docs, portfolios, booking, education, dashboards, admin panels, government forms, mobile web) into a clean, tidy, low-text, modern design that is responsive and easy to re-theme, without breaking features. Use whenever the user wants to build or design a site, page or UI; redesign, "rapikan", "perbaiki tampilan", modernize, declutter or make it premium/"tidak jadul"; fix layout, spacing, alignment, responsive or overflow issues; standardize buttons, forms, tables, cards, modals; remove native browser/Windows UI (alert/confirm/prompt, validation bubbles); match reference screenshots or a reference URL; or make colors, theme or dark mode settable. Applies even to a single page or component, and even when the request is in Indonesian.
---

# Nuansa UI/UX Design

A design guide for **any** website or web app, whether you're building it new or
cleaning up an existing one: make it feel calm, modern and premium, clean, tidy and light
on text, without breaking anything. For an existing site, two goals pull against each
other, so the skill holds both at once:

1. **Look**: modern, minimalist, clean, simple, professional, consistent, responsive.
2. **Safety**: every feature, route, form field, handler, permission check and workflow
   that worked before still works after.

When in doubt, choose the option that keeps behavior intact and makes future visual
changes cheap (one token or one component changes, not fifty files).

## Design principles (the "why" behind every decision)

The one-line test for every decision: **is it clean, tidy, and light on text?**
("bersih, rapi, tidak kebanyakan teks"). Modern doesn't mean glass, gradients or 3D;
those are optional styles. Clean structure with little text is not optional.

- **Same quality bar, own identity.** Rules make a site tidy; the brand and personality
  make it recognizable. Never ship one house style to every project
  (`references/design-direction.md`).
- **Path before pixels.** Know the 3–5 top tasks and make them short (≤ 3 steps where
  possible) before styling anything. A beautiful page on a confusing path still fails.
  See `references/ux-flows.md`.
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

**Pick the mode first.**
- **Redesign / tidy an existing site**: follow Phases 1–5 below as written.
- **Build a new site or page**: Phase 1 becomes *Define*. Identify the site type in
  `references/site-types.md` (company profile, landing, e-commerce, blog/docs,
  portfolio, booking, education, admin, government/forms, auth, utility, mobile web),
  list the pages it needs and the content you have, and pick a stack (match an existing
  project; otherwise plain HTML/CSS or the framework the user named). In Phase 2, the
  "feature inventory" is the list of pages and features to build. Phases 3–5 are the
  same: tokens → components → layouts → pages → verify.
- **Not a website** (native app, Figma, slides): the principles and references still
  apply; the scripts are web-only.

Whatever the mode, read `references/site-types.md` for the type of site in front of
you: it says which pages, components, text level and preset fit.

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
5. If the app can be run locally, start it and capture a baseline with
   `node <skill>/scripts/responsive_check.js --url <base-url> --paths … --out ui-before`
   (see Phase 5). The screenshots and `report.json` feed the before/after report at the end.
   Install `axe-core` (`npm i -D axe-core`) if allowed so the accessibility audit runs too.

### Phase 2 — UX first, then audit and plan

1. **UX brief.** Read `references/ux-flows.md`. Write the top tasks, map each flow with a
   step count (now → proposed), the sitemap/navigation, naming fixes, and for each key
   screen "purpose · main element · main action". Flow changes that alter behavior need
   the user's OK; visual changes don't.
2. **Heuristic evaluation.** Score the key screens against Nielsen's 10 heuristics with
   severities 0–4 (`references/heuristics.md`). This catches usability problems the
   visual checklist misses (no feedback, no undo, jargon, errors that don't help).
3. **Visual audit.** Read `references/audit-checklist.md` and audit every page against it.

Produce a short audit (in the conversation, or as `UI-AUDIT.md` if the project is large) with:

- **Problems found**, grouped by type (layout, spacing, typography, color, navigation,
  components, responsiveness, native dialogs, clutter), each with file/page references.
- **Feature inventory** of what must survive: forms and their fields, buttons and the
  action each triggers, links/routes, table columns, filters, bulk actions, role-based
  visibility. This list is your regression checklist in Phase 5.
- **Plan**: flows/IA → tokens → base styles → components (with every state from
  `references/states-and-edge-cases.md`) → layouts → pages, in that order.

If the user only asked for one page or component, scope the audit to that, but still
check whether a shared component or token change is the right fix.

**Create a design direction for this project.** Read `references/design-direction.md`:
three personality words, audience, existing brand assets, then choose typeface, color
strategy, shape language, surfaces, density, imagery, motion and one signature detail.
Presets in `references/style-presets.md` (Clean Pro, Soft Bento, Mono + Accent, Status
Pastel, Editorial Neutral, Soft Glass, Pastel Blocks) are starting points to adapt, not
uniforms. Run the **sameness check**: at least 3 dimensions must differ from the Nuansa
reference skin, unless the user wants that look or the brand already matches. Write the
direction down (format in the reference) and show it to the user before building when
the project is new or the change is large. If the user shared reference images/screenshots, write a short
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

1. **Tokens.** Express the design direction as tokens. Without an existing design system
   you may start from the mechanics in `assets/starter/nuansa.css`, but replace its skin
   tokens (fonts, colors, radius, surfaces) with the project's direction, as
   `assets/examples/skins.css` demonstrates. Otherwise read
   `references/design-tokens.md` and create (or consolidate into) a single token source: CSS custom properties, Tailwind theme, or Sass variables, matching the
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
   grid↔list toggle, search pill, status card. Give every component its full state set
   (hover, focus, active, selected, disabled, loading, error, empty) and make it survive
   long text and big numbers (`references/states-and-edge-cases.md`).
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

5. **Style guide.** Generate a living style guide from the tokens and component CSS:
   `python <skill>/scripts/make_styleguide.py --tokens <tokens.css> --css <components.css> … --out <public>/styleguide.html`.
   It renders swatches, type scale, spacing, radius, shadows and component samples using
   the real CSS (with a dark toggle if a dark theme exists). Open it: inconsistencies and
   broken dark-mode tokens show up immediately. Ship it (e.g. `/styleguide`) so the team
   reuses components instead of inventing new ones.
6. **Theming (when wanted).** If the user wants colors to be settable — by an admin for
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
3. Preserve and improve accessibility while restyling (`references/accessibility.md`):
   real `<button>` for actions, `<a>` for navigation, `<label for>` on inputs, visible
   focus, contrast ≥ 4.5:1 for body and muted text, one `<h1>` and ordered headings,
   landmarks (`<main>`, `<nav>`), touch targets ≥ 24px (44px recommended).
4. Design every page's data states: first load (skeleton), empty, no results, error,
   many items (`references/states-and-edge-cases.md`).
5. Respect the performance budget (`references/performance.md`): right-sized WebP/AVIF
   images with dimensions, lazy below the fold, ≤ 4 font files, deferred scripts.

### Phase 5 — Verify (this is not optional)

1. **Responsive check.** If the app runs, use
   `node <skill>/scripts/responsive_check.js --url <base-url> --paths / /admin ...`
   (run with `--help` for options). It screenshots each page at mobile (375), tablet
   (768), laptop (1280) and desktop (1440) widths and reports horizontal overflow,
   elements wider than the viewport, overlapping interactive elements, clipped text,
   small touch targets, near-miss alignments (edges 2–6px off a shared line) and the text
   budget. Once per page it also runs a WCAG 2.2 audit with axe-core (if installed) and a
   performance pass (LCP, CLS, blocking time, image and font problems; add `--slow` for a
   mid-range phone on 4G). Add `--stress` to re-check every page with doubled text, long
   unbroken words and huge numbers. Fix every finding, then re-run until clean. Look at the
   screenshots yourself: the script catches mechanical problems, not ugliness. Then do
   the manual 10-minute accessibility pass (keyboard, zoom, screen reader skim) in
   `references/accessibility.md`.
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
5. **Heuristic re-score.** Re-score the same screens from Phase 2 and note before → after.
6. **Report** to the user: what changed (grouped), flow changes with step counts, where
   the tokens/components/style guide live and how to re-theme (e.g. "change
   `--color-primary` in `styles/tokens.css`"), what was removed and why, accessibility
   and performance results, anything you weren't able to verify. If you captured a
   baseline, run `responsive_check.js … --out ui-after`, then
   `node <skill>/scripts/before_after.js --before ui-before --after ui-after --out ui-report --notes CHANGES.md`
   and give the user `ui-report/index.html`: side-by-side screenshots per page and width
   with issue counts, plus your notes. It's the deliverable a client or team can review.

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

## Quality bar, not a template

The skill fixes **how well** a site is designed, not **what it looks like**. Every project
gets the same invariants (tidy grid and alignment, little text, clear hierarchy, full
states, accessibility, responsiveness, no native UI, performance) and its **own visual
identity** chosen from its brand, audience and personality (`references/design-direction.md`).

**Calibrate the quality bar, then design something of your own.** Look at
`assets/examples/admin-produk.html`, the messy eval page redesigned with every feature
intact. It shows the *level*: spacing rhythm, hierarchy, density, states, and how little text
is enough. Then open the same page with `?skin=editorial`, `?skin=tech` and
`?skin=playful`: the identical markup and rules wear three unrelated identities. That
range is the point. Don't reproduce the Nuansa look (cool gray canvas, borderless white
cards, ink pills, violet accent) unless the user asks for it or the brand already matches.

`assets/starter/nuansa.css` is a **starter for mechanics** (app shell with mobile drawer,
responsive table, form fields, chips, stat tiles, states, long-content and contrast
hardening) with one example skin. Reuse the mechanics; replace the skin tokens with the
project's direction. If it looks like a default Bootstrap/admin template, or like an
unchanged Nuansa page, it isn't done.

## Bundled resources

- `references/design-direction.md` — invariants vs variables, deriving a unique visual identity (personality → type, color strategy, shape, surfaces, density, imagery, motion, signature detail), the sameness check, direction examples by business type. Read in Phase 2.
- `assets/examples/skins.css` — three unrelated identities (editorial, tech, playful) on the same markup; proof and recipe for re-skinning the starter.
- `assets/starter/nuansa.css` — starter mechanics with one example skin (Nuansa): tokens (light + dark), base, app shell (sidebar drawer, topbar), page header, buttons, chips, cards, stat tiles, badges, responsive table, forms, search, progress, empty state. Hardened against long text and WCAG contrast.
- `assets/examples/admin-produk.html` — reference implementation of the quality bar (add `?skin=editorial|tech|playful` to see other identities): the messy eval admin page redesigned with all features intact, passing every check, including stress and axe.
- `assets/examples/styleguide.html` — the Nuansa style guide generated with `make_styleguide.py`.
- `references/audit-checklist.md` — page-by-page audit + final QA checklist. Read in Phase 2 and Phase 5.
- `references/design-tokens.md` — token templates for plain CSS, Tailwind and Bootstrap/Sass, plus dark mode. Read in Phase 3.
- `references/components.md` — specs and markup patterns for every core component, including responsive tables. Read in Phase 3.
- `references/admin-panel.md` — admin/dashboard layout, menu grouping, bento dashboards, tables, filters, forms. Read when an admin panel or dashboard is in scope.
- `references/style-presets.md` — 7 visual directions (Clean Pro, Soft Bento, Mono + Accent, Status Pastel, Editorial Neutral, Soft Glass, Pastel Blocks) with token overrides, how to extract a style spec from reference images or URLs, dated patterns to avoid. Read in Phase 2.
- `references/layout-system.md` — the rules behind a tidy layout: grid, alignment lines, split header, spacing rhythm, card anatomy, dashboard grids, numbers, responsive collapse. Read in Phase 4.
- `references/landing-page.md` — product/landing page formula: navbar, hero variants, stat strip, steps, bento features with live mini-demos, pricing/transparency, CTA band, footer, typography/color recipes, Indonesian copywriting. Read for public/marketing pages.
- `references/mobile-app.md` — safe areas, thumb zone, app bar, bottom nav, sheets, onboarding. Read when mobile/app-like UI is in scope.
- `references/theming.md` — site-wide / per-user color, dark mode, corner and density switching. Read when colors should be settable.
- `references/ux-flows.md` — top tasks, flow mapping with step counts, step-cutting patterns, sitemap/IA rules, naming, per-screen hierarchy, the UX brief template. Read in Phase 2 (both modes).
- `references/heuristics.md` — Nielsen's 10 heuristics with what to look for, fixes, severity 0–4 and a report template. Read in Phase 2 and Phase 5.
- `references/states-and-edge-cases.md` — component state matrix, page/data states, content edge cases, coping rules (clamp, truncate, wrap), optimistic UI and undo, offline. Read in Phase 3–4.
- `references/accessibility.md` — WCAG 2.2 AA: automated + manual 10-minute pass, contrast, keyboard/focus, semantics, forms, media, motion, touch, axe fixes table. Read in Phase 4–5.
- `references/performance.md` — Core Web Vitals budgets, measuring, images, fonts, CSS/JS, layout stability, perceived speed. Read in Phase 4–5.
- `references/site-types.md` — per site type (company profile, landing, e-commerce, blog/docs, portfolio, booking, education, admin, government/forms, auth, utility, mobile web): core pages, key components, text level, preset, pitfalls, plus pages every site needs. Read first, in both modes.
- `references/content-clarity.md` — the "less text" rules: text budgets, turning sentences into structure, the 1-1-1 card rule, one screen one job, microcopy lengths, Indonesian before/after rewrites, color as information. Read in Phase 2 and Phase 4.
- `references/native-ui.md` — map of every native popup/control to its replacement, setup, validation customization, unsaved-changes guard, what must stay native. Read in Phase 3.
- `assets/ui-feedback.js` + `assets/ui-feedback.css` — drop-in, dependency-free toast/confirm/prompt/alert, `data-confirm`, automatic inline validation (no browser bubbles), unsaved-changes guard, tooltips.
- `assets/ui-controls.css` — restyles native checkbox/radio/switch, select, file input, range, date, number, scrollbars, autofill and focus ring to match the tokens.
- `assets/theme.js` + `assets/theme.css` — runtime theme engine (accent with auto-derived hover/soft/contrast-safe text, light/dark/system, sharp/soft/round, density) and a ready-made picker panel.
- `scripts/find_native_dialogs.py` — locate `alert/confirm/prompt` calls; `--all` also lists beforeunload, window.open, title tooltips and unstyled native controls.
- `scripts/style_audit.py` — measure styling fragmentation (hard-coded colors, font sizes, inline styles, `!important`).
- `scripts/responsive_check.js` — Playwright screenshots at 4 widths + overflow/overlap/clipping/touch-target/near-miss-alignment/text-budget/native-dialog detection, WCAG audit (axe-core), performance metrics (`--slow`), and stress test (`--stress`).
- `scripts/before_after.js` — client-ready before/after report (side-by-side screenshots per page and width, issue counts, notes).
- `scripts/make_styleguide.py` — living style guide page generated from tokens + component CSS.
- `scripts/extract_design.js` — learn a reference site's design system from its URL (screenshots + fonts, type scale, palette, radius, buttons, sections, grid, CSS variables).
