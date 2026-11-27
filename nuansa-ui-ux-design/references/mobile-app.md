# Mobile & App-like Patterns

For mobile web, PWAs, and the mobile layout of any responsive site. Mobile is not a
shrunken desktop: navigation moves to the bottom, actions move to the thumb zone, and
content becomes a vertical stack of cards and sheets.

## Contents
- Viewport & safe areas
- Thumb zone & touch targets
- App bar (top)
- Bottom navigation
- Cards, lists & sheets
- Onboarding / hero screens
- Forms on mobile
- Performance feel

---

## Viewport & safe areas

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```
```css
.app-bottom { padding-bottom: max(var(--space-3), env(safe-area-inset-bottom)); }
.app-top    { padding-top: max(var(--space-3), env(safe-area-inset-top)); }
.screen     { min-height: 100dvh; } /* dvh avoids the mobile address-bar jump */
```
Never disable zoom (`maximum-scale=1`, `user-scalable=no`).

## Thumb zone & touch targets

- Primary actions at the bottom (sticky CTA, bottom nav, FAB); destructive actions away
  from where thumbs rest.
- Touch targets ≥ 44×44px (40 minimum) with ≥ 8px between them.
- Inputs at 16px font to avoid iOS zoom on focus.

## App bar (top)

```
[ ← ]        Title        [ ⌕ ][ ⋮ ]
```
- Circular icon buttons (40–44px, surface or outline) for back and actions.
- Title centered (sub-screens) or left-aligned large title (top-level screens:
  "Applications", "Select Department" at 28–34px, can scroll-collapse).
- Filter chips row directly below the title when the screen is a filterable list.

## Bottom navigation

Use on mobile when the app has 3–5 top-level destinations (more → "Lainnya" tab).

Variants seen in modern apps:
1. **Floating pill bar**: detached from edges (margin 12–16px), radius full, surface or
   black background, subtle shadow.
2. **Center action**: a raised black/accent circle "+" in the middle for the main create action.
3. **Segmented**: items are separate circles; the active item becomes a wider pill
   (black with white icon, or accent fill).

```css
.bottom-nav { position: fixed; left: var(--space-4); right: var(--space-4); bottom: max(var(--space-4), env(safe-area-inset-bottom));
  display: flex; justify-content: space-between; align-items: center; gap: var(--space-2);
  padding: var(--space-2); background: var(--color-surface); border-radius: var(--radius-full); box-shadow: var(--shadow-lg); z-index: var(--z-sticky); }
.bottom-nav__item { flex: 1; height: 48px; display: grid; place-items: center; border-radius: var(--radius-full); color: var(--color-text-muted); }
.bottom-nav__item[aria-current="page"] { flex: 1.8; background: var(--color-ink, var(--color-text)); color: var(--color-on-ink); }
.bottom-nav__item--action { flex: none; width: 52px; height: 52px; background: var(--color-ink, var(--color-text)); color: var(--color-on-ink); }
@media (min-width: 1024px) { .bottom-nav { display: none; } } /* desktop uses sidebar/topnav */
body.has-bottom-nav { padding-bottom: 96px; } /* content never hides behind the bar */
```
- Icons with labels when possible; icon-only requires `aria-label` and very familiar icons.
- On desktop, the same destinations live in a sidebar/top nav — same routes, different layout.

## Cards, lists & sheets

- Full-width cards with 16px side gutters, 12–16px gap, radius 20–28px for app style.
- List rows: leading avatar/icon (40px) · title + muted meta · trailing action (chevron,
  "+", kebab). Row height ≥ 56px.
- **Bottom sheet** instead of centered modal for mobile actions/forms: slides from bottom,
  radius on top corners, drag handle, max-height 90dvh, content scrolls inside.
- Horizontal scrollers (chips, categories, avatars) with `scroll-snap-type: x mandatory`
  and a peeking next item to signal scrollability; hide the scrollbar.
- Grid/List toggle for collections; grid = 2 columns on phones.

## Onboarding / hero screens

- Full-bleed image top ~60%, content sheet bottom with radius-top 28–32px.
- Large 2–3 line headline (28–34px, bold), one short line of supporting text (optional).
- Pagination dots: active dot becomes a short pill in accent.
- One full-width primary pill button ("Get started"), optional text link below.

## Forms on mobile

- One column, labels above, generous spacing.
- Correct `type`/`inputmode`/`autocomplete` (`email`, `tel`, `numeric`, `one-time-code`).
- Sticky bottom action bar for the submit button on long forms.
- Pickers (date, select) as bottom sheets in app-like UIs; native inputs are acceptable
  and often better on mobile web.

## Performance feel

- Skeletons that match final layout; avoid spinners on whole screens.
- Instant tap feedback (`:active` scale .98 or background change), 150ms transitions.
- Optimistic UI for toggles/likes with a toast + undo on failure.
- Lazy-load images with fixed aspect ratios to prevent layout shift.
