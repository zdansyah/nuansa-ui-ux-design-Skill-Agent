# Design Direction — same quality bar, a different face for every project

The skill's rules (tidy layout, little text, clear hierarchy, full states, accessibility,
responsiveness) are **invariants**: every project gets them. The visual identity is a
**variable**: every project should get its own. If every site built with this skill
looked like the Nuansa example, the skill would have failed, because sameness is just
another kind of "template look".

Use this file in Phase 2 to create a direction for *this* project before writing CSS.

## Contents
- Invariants vs variables
- Step 1 — Read the project (personality, audience, context)
- Step 2 — Choose each dimension deliberately
- Step 3 — One signature detail
- Step 4 — The sameness check
- Direction examples by kind of business
- Writing the direction down
- Re-skinning the starter

---

## Invariants vs variables

| Always the same (quality bar) | Different per project (identity) |
|---|---|
| Grid, container, alignment lines, spacing rhythm | Typeface(s) and type personality |
| One primary action per view, clear hierarchy | Color strategy and palette |
| Text budget, 1-1-1 cards, one job per screen | Shape language (sharp, soft, pill, mixed) |
| Tokens + reusable components | Density (airy ↔ compact) |
| Full component and data states | Surfaces (borderless, outlined, tinted, dark-first) |
| WCAG contrast, focus, labels, touch targets | Imagery (photo, illustration, 3D, none) and icon style |
| No native browser UI | Signature detail (the memorable thing) |
| Responsive at 375 / 768 / 1280 / 1440 | Motion personality |
| Performance budget | Copy voice (formal, friendly, playful) |

## Step 1 — Read the project

Start from the user's answers to the taste questions (`discovery-questions.md`) if they
gave any. Otherwise answer briefly (infer from the brief, existing brand, content and
references; ask only if there's nothing to go on):
1. **Three personality words**: e.g. *hangat, rumahan, jujur* (home bakery); *tegas,
   terpercaya, tenang* (law firm); *cepat, presisi, teknis* (developer tool); *ceria,
   aman, sederhana* (kids education).
2. **Audience & context**: who, on what device, how often, in what mood (quick task at
   work vs. leisurely browsing).
3. **Existing brand assets**: logo, colors, fonts, photography. These are constraints:
   keep them, and build the rest around them.
4. **References** the user likes (images/URLs → `style-presets.md` "extract a spec").

## Step 2 — Choose each dimension deliberately

Pick one option per row that fits the personality. Don't take the first option by habit.

**Typography**
| Personality | Direction | Example families (any good equivalent works) |
|---|---|---|
| modern, neutral, efficient | grotesk / neo-grotesk | Inter, Geist, Plus Jakarta Sans, Manrope |
| friendly, rounded, approachable | geometric rounded | Urbanist, Outfit, Nunito, Poppins |
| editorial, warm, premium, craft | serif display + sans body | Fraunces, Instrument Serif, Newsreader, DM Serif + Inter |
| technical, precise, developer | sans + monospace accents | Geist + Geist Mono, IBM Plex Sans + Plex Mono, JetBrains Mono |
| bold, energetic, youth | condensed/heavy display | Archivo, Bricolage Grotesque, Anton (headings only) |
| institutional, trustworthy | humanist sans, conservative scale | Source Sans 3, Public Sans, Noto Sans |

**Color strategy**
| Strategy | Feels | Notes |
|---|---|---|
| Neutral + one accent | calm, modern, flexible | the safe default; choose an accent that isn't the usual blue/violet |
| Warm neutrals + earthy accent | handmade, food, hospitality | cream/sand canvas, terracotta, olive, mustard |
| Monochrome ink + highlighter | confident, editorial | black/white with one bright highlight (lime, orange, pink) |
| Brand-saturated | bold, consumer | large color-blocked areas in the brand color, neutral elsewhere |
| Pastel category system | friendly, playful, learning | one pastel per category, same lightness |
| Dark-first | technical, premium, media | near-black surfaces, one luminous accent, visible hairlines |
| Duotone | distinctive, campaign | two brand colors carry everything; neutrals minimal |

**Shape language**: sharp (2–6px, institutional/technical) · soft (8–14px, balanced) ·
round/pill (16–28px + pill controls, friendly/consumer) · mixed (sharp cards + pill
buttons, editorial).

**Surfaces**: borderless cards on tinted canvas · outlined cards with hairlines · tinted
color blocks · flat sections without cards (editorial) · glass (sparingly) · dark panels.

**Density**: airy (marketing, consumer) · balanced · compact (admin, data tools, power users).

**Imagery & icons**: real photography (one treatment) · flat illustration · line doodles
· 3D objects · product UI as imagery · none (type-only). Icons: outline vs. filled vs.
duotone, with one stroke weight.

**Motion**: none/minimal (institutional) · crisp 150ms (tools) · springy/bouncy (playful)
· slow fades (premium).

## Step 3 — One signature detail

Pick **one** memorable element and use it consistently; it's what makes the site
recognizable. Examples: a highlighter mark behind key words; oversized numbers; hatched
pattern for "remaining" values; hand-drawn underlines; grain texture on hero; stamped
labels; outlined cards with offset solid shadow; a mascot; monospace labels; a color-blocked
hero card; photo cut-outs breaking the grid. One, not five.

## Step 4 — The sameness check

Before building, compare your direction with the Nuansa reference skin
(`assets/starter/nuansa.css`: Plus Jakarta Sans, cool gray canvas, borderless white
cards, ink pill buttons, violet accent, pastel stat tiles). **At least 3 of these
dimensions must differ** (typeface, color strategy/accent, shape language, surfaces,
density, signature detail), unless the user explicitly asked for the Nuansa look or the
existing brand already matches it.

Also avoid the global defaults that make AI-generated sites look alike: Inter + blue
primary + 8px radius + gradient hero + three icon cards. If your direction matches that,
change at least two dimensions.

## Direction examples by kind of business

| Project | Personality | Type | Color | Shape | Signature |
|---|---|---|---|---|---|
| Toko kue rumahan | hangat, rumahan, jujur | Fraunces + Nunito | cream canvas, terracotta, sage | soft 12px, pill buttons | hand-drawn underline on key words |
| Kantor hukum | tegas, tenang, terpercaya | Newsreader + Source Sans | ivory, deep navy, brass | sharp 4px, outlined | thin rules and numbered sections |
| Developer tool | cepat, presisi, teknis | Geist + Geist Mono | dark-first, electric green | 6px, visible hairlines | monospace uppercase labels |
| Kursus anak | ceria, aman, sederhana | Urbanist | pastel blocks, orange action | round 24px, tactile shadow | mascot + chunky buttons |
| Klinik / kesehatan | bersih, menenangkan, profesional | Plus Jakarta Sans | white, teal, soft mint | soft 14px | gentle illustrations, generous whitespace |
| Layanan publik | jelas, inklusif, resmi | Public Sans | white, government blue, high contrast | soft 8px | step numbers, big touch targets |
| Brand fashion | berani, eksklusif | Bricolage Grotesque / serif | monochrome + one hot accent | sharp, edge-to-edge images | oversized type over photos |
| Fintech app | aman, modern, cepat | Manrope + tabular numbers | neutral + one confident accent | round 20px | big balance numbers with delta pills |

## Writing the direction down

```
Design direction — <project>
Personality: hangat · rumahan · jujur
Type: Fraunces (headings, 600) + Nunito (UI/body)
Color: cream #f6f0e6 canvas, white cards, ink #2b211a, terracotta #b4532a (action), sage #7d8f6a (secondary)
Shape: cards 12px outlined; buttons 8px (not pill); images 12px
Density: airy (marketing), balanced (checkout)
Imagery: real product photos, warm light, same crop ratio 4:5
Signature: hand-drawn underline under one key word per headline
Motion: soft 200ms fades
Sameness check vs Nuansa: type ✔ different, color ✔, shape ✔, surfaces ✔ (outlined), signature ✔
```

## Re-skinning the starter

`assets/starter/nuansa.css` separates **mechanics** (layout, responsive behavior, states,
accessibility hardening) from **skin** (the tokens in its Brand/Neutrals/Type/Shape
blocks). To use its mechanics with your own direction, override the skin tokens and a
few component rules. Don't ship the Nuansa skin by default. `assets/examples/skins.css`
shows three very different skins (editorial, tech, playful) applied to the same example
page without changing its HTML: open `assets/examples/admin-produk.html?skin=editorial`,
`?skin=tech` or `?skin=playful`.
