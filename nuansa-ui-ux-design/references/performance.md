# Performance as UX — fast feels premium

A slow or jumpy page feels cheap no matter how good it looks. Treat Core Web Vitals
as design constraints: what loads first, what size images are, how many fonts, and what
reserves space.

## Contents
- Budgets
- Measure
- Images
- Fonts
- CSS & JavaScript
- Layout stability (CLS)
- Perceived performance
- Quick wins checklist

---

## Budgets

| Metric | Good | Meaning |
|---|---|---|
| LCP (Largest Contentful Paint) | ≤ 2.5s on mobile 4G | main content visible |
| CLS (Cumulative Layout Shift) | ≤ 0.1 | nothing jumps while loading |
| INP (Interaction to Next Paint) | ≤ 200ms | taps respond quickly (proxy: total blocking time ≤ 200–300ms) |
| Page weight | ≤ 1–1.5 MB first load (landing), ≤ 500 KB for app shells | data cost for users on mobile plans |
| Web fonts | ≤ 2 families, ≤ 4 files | each file delays text |
| Requests | as few as practical; avoid 10+ third-party scripts | |

Indonesian users often browse on mid-range Android phones and mobile data: test throttled.

## Measure

```bash
node <skill>/scripts/responsive_check.js --url http://localhost:8000 --paths / /produk --slow
```
The first width (375px by default) gets a performance pass: LCP, CLS, blocking time,
page weight by type, oversized images, images without dimensions, offscreen images not
lazy-loaded, number of web font files. `--slow` emulates a mid-range phone (4× CPU) on
~1.6 Mbps. For a deeper audit, Lighthouse in Chrome DevTools or PageSpeed Insights for
public URLs.

## Images

- Right size: serve images near their displayed size × device pixel ratio. Use
  `srcset`/`sizes` (or the framework's image component: Next `<Image>`, Nuxt Image,
  Laravel/Intervention resizing).
- Modern formats: WebP or AVIF, with JPEG/PNG fallback only if needed. SVG for icons and logos.
- Always set `width` and `height` (or CSS `aspect-ratio`) to reserve space.
- `loading="lazy"` for images below the fold; **not** for the hero/LCP image. Give the
  hero `fetchpriority="high"` (and `<link rel="preload">` if it's a CSS background).
- Compress: photos 70–80% quality; hero ≤ 200 KB, thumbnails ≤ 50 KB.
- Decorative backgrounds: a CSS gradient instead of a huge image.

```html
<img src="/img/hero-800.webp" srcset="/img/hero-480.webp 480w, /img/hero-800.webp 800w, /img/hero-1400.webp 1400w"
     sizes="(min-width: 1024px) 50vw, 100vw" width="1400" height="900" alt="…" fetchpriority="high">
```

## Fonts

- One family (variable font if available) with only the weights used. Two families max.
- `font-display: swap`; preconnect to the font host or self-host (`woff2`).
- Preload the main text font file when it's critical to the LCP text.
- Use a system font stack for admin tools and utilities when brand isn't crucial.
- Match fallback metrics (`size-adjust`, or `next/font` / Fontaine) to avoid layout shift
  when the font swaps.

## CSS & JavaScript

- One CSS framework, not two. Purge unused CSS (Tailwind does this; for Bootstrap, import
  only needed parts).
- Inline critical CSS for above-the-fold on landing pages if the build supports it.
- `defer` scripts; load third-party widgets (chat, analytics, maps) after interaction or
  idle. Embed maps as a static image with a "Buka peta" link where possible.
- Avoid heavy libraries for small effects (jQuery for one toggle, a 300 KB carousel for
  3 slides, full icon fonts for 10 icons; use inline SVG instead).
- Code-split routes in SPAs; avoid shipping admin code to public pages.
- The bundled assets (`ui-feedback.js` ~10 KB, `theme.js` ~8 KB unminified) are fine; minify in production.

## Layout stability (CLS)

- Reserve space for images, embeds, ads and async content (fixed aspect ratios, min-heights,
  skeletons with the final dimensions).
- Don't insert banners above existing content after load (cookie bars go at the bottom,
  overlaying).
- Fonts: see above. Animations: use `transform`/`opacity`, not `top`/`height`.

## Perceived performance

- Show the layout instantly (skeletons), then fill.
- Optimistic UI for quick actions (`states-and-edge-cases.md`).
- Prefetch the likely next page on hover/viewport (framework link prefetching).
- Keep transitions short (150–200ms); long animations make apps feel slow.

## Quick wins checklist

- [ ] Hero image: right size, WebP/AVIF, `fetchpriority="high"`, not lazy
- [ ] All other images: dimensions set, lazy, responsive sizes
- [ ] ≤ 4 font files, `font-display: swap`
- [ ] Scripts deferred; third-party widgets delayed
- [ ] No duplicate CSS frameworks / unused libraries
- [ ] `responsive_check.js --slow`: LCP ≤ 2.5s, CLS ≤ 0.1, blocking ≤ 300ms
