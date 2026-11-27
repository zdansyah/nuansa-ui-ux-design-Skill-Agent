# Audit & QA Checklist

Use Part A per page during the audit (Phase 2). Use Part B before reporting done (Phase 5).
Record findings as `page — problem — fix`, not as a wall of ticks.

## Contents
- Part A — Page audit
  - Layout & structure
  - Spacing & alignment
  - Typography
  - Color & contrast
  - Navigation
  - Components
  - Content & clutter
  - Responsiveness
  - Feedback & states
  - Code-level styling health
- Part B — Final QA

---

## Part A — Page audit

### Layout & structure
- [ ] Is there one clear page title and one obvious primary action?
- [ ] Is content inside a consistent max-width container (e.g. 1200–1280px public, fluid admin)?
- [ ] Is there a visible grid/column structure, or do elements float at arbitrary positions?
- [ ] Are related items grouped (same card/section) and unrelated items separated?
- [ ] Is the reading order logical top→bottom, left→right (and on mobile, single column)?
- [ ] Are there nested cards inside cards inside cards? (Flatten.)

### Spacing & alignment
- [ ] Are spacing values from one scale, or a mix of 5px/7px/13px/15px?
- [ ] Do left edges of headings, text, inputs and buttons line up?
- [ ] Is spacing *between* groups larger than spacing *within* groups?
- [ ] Are buttons in a row equal height and vertically centered with adjacent inputs?
- [ ] Is padding consistent across cards/sections of the same type?

### Typography
- [ ] How many distinct font sizes/weights/families are used? (Target: ≤ 6 sizes, ≤ 3 weights, 1–2 families.)
- [ ] Is body text ≥ 16px on public pages (≥ 14px in dense admin tables)?
- [ ] Line length ≤ ~75 characters for paragraphs? Line-height 1.5–1.7 for body?
- [ ] ALL CAPS, underline, or italic used for emphasis in many places? (Reduce.)

### Color & contrast
- [ ] How many distinct colors appear? Are near-duplicates (`#3b82f6` vs `#3a7bd5`) present?
- [ ] Is there one primary accent, used consistently for primary actions and links?
- [ ] Are semantic colors (success/warning/danger) used only for their meaning?
- [ ] Body text contrast ≥ 4.5:1, large text/UI ≥ 3:1?
- [ ] Is color the only signal for status? (Add text/icon.)

### Navigation
- [ ] Is the current page indicated in the nav?
- [ ] Are menu items grouped logically and ordered by frequency/importance?
- [ ] More than ~7 top-level items? (Group or nest.)
- [ ] Does mobile nav work (hamburger/drawer), close on selection, trap focus while open?
- [ ] Are there duplicate entry points to the same page that add confusion?

### Components
- [ ] Buttons: how many visual variants exist? Do they map to primary/secondary/ghost/danger?
- [ ] Forms: labels above inputs, visible required markers, inline error messages, consistent heights?
- [ ] Tables: aligned numbers (right) and text (left), readable header, row hover, works on mobile?
- [ ] Cards: consistent padding/radius/border, no heavy shadows?
- [ ] Modals: consistent size, close button, Esc to close, focus trapped, scrolls internally on small screens?
- [ ] Empty, loading and error states exist for lists/tables?

### Content & clutter
- [ ] Repeated titles/labels? Filler intro paragraphs? Placeholder text duplicating labels?
- [ ] Decorative elements adding noise (icons on every line, dividers, gradients, banners)?
- [ ] Any information that is clearly needed but buried? (Promote it.)
- [ ] For every removal candidate: is it referenced by JS/tests/SEO? Is it needed for a task?

### Responsiveness
- [ ] Horizontal scroll at 360–375px?
- [ ] Fixed widths (`width: 800px`), large min-widths, or `white-space: nowrap` causing overflow?
- [ ] Tables overflowing the viewport?
- [ ] Text overlapping images/buttons, or buttons overlapping each other?
- [ ] Touch targets < 40px? Inputs < 16px font on iOS (causes zoom)?
- [ ] Images without `max-width: 100%` or aspect-ratio, causing layout shift?

### Feedback & states
- [ ] Any `alert()`, `confirm()`, `prompt()`? (List from `find_native_dialogs.py`.)
- [ ] Do actions give feedback (toast, inline message, button loading state)?
- [ ] Are destructive actions confirmed with a specific message and danger styling?
- [ ] Hover, focus-visible, active, disabled states on all interactive elements?

### Code-level styling health
- [ ] Output of `style_audit.py`: number of unique colors, font sizes, inline styles, `!important`.
- [ ] Multiple CSS frameworks loaded at once? Unused stylesheets?
- [ ] Styles duplicated per page instead of shared?

---

## Part B — Final QA

Do not report done until each is true or explicitly called out as unverified.

**Visual**
- [ ] All pages use the shared tokens; no new hard-coded colors/sizes introduced.
- [ ] All pages use the shared components; one look per component type.
- [ ] Consistent page header pattern across pages of the same kind.
- [ ] No leftover debug borders, lorem ipsum, or commented-out blocks of old markup.

**Responsive** (`responsive_check.mjs` clean + screenshots reviewed)
- [ ] 375px: no horizontal scroll, single-column, nav usable, tables usable, modals fit.
- [ ] 768px: layout adapts sensibly (not just a stretched mobile or squeezed desktop).
- [ ] 1280px & 1440px: content not over-stretched; max-width respected.
- [ ] No overlapping or clipped elements at any width.

**Behavior**
- [ ] `find_native_dialogs.py` reports 0 in app code.
- [ ] Every item in the Phase 2 feature inventory verified working.
- [ ] Forms submit the same field names/values; validation still shows.
- [ ] Destructive actions still require confirmation.
- [ ] Role/permission-based visibility unchanged.
- [ ] Build, lint and tests pass (or failures pre-existed and are reported).

**Accessibility**
- [ ] Keyboard: tab through every page; focus always visible; modals trap and restore focus; Esc closes.
- [ ] Labels on all inputs; `aria-label` on icon-only buttons.
- [ ] Contrast meets 4.5:1 for text.
- [ ] `prefers-reduced-motion` respected.

**Maintainability**
- [ ] The report tells the user exactly where tokens live and how to re-theme.
- [ ] Component usage is documented briefly (variants, sizes) if a component library was introduced.
