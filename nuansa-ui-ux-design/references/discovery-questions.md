# Discovery Questions — ask about taste, never block on it

Taste differs: some people love pastel, some want one solid brand color, some want
everything in shades of one color, some want two colors, some want only black and white
with their logo. Instead of guessing, ask a few quick multiple-choice questions, and
always let the user skip them. When they skip, use the skill's own recommendation
(`design-direction.md`) and say what you chose.

## Contents
- When to ask (and when not to)
- How to ask
- The questions (Bahasa Indonesia, with English)
- Quick mode (3 questions)
- Skip → recommended defaults
- Turning answers into a direction
- Color style recipes
- Reference images and URLs
- Confirm before building

---

## When to ask (and when not to)

Ask **once**, at the start of Phase 2, when:
- building a new site or page, or
- doing a large redesign where the look is changing, and
- the brief, the existing brand and the references don't already answer the question.

Don't ask when:
- the user said "langsung saja / terserah / pakai rekomendasi / skip": go with defaults;
- the task is small (one component, a bug, spacing fixes): keep the existing look;
- the answer is already known (brand guide, existing tokens, a reference they gave).
  Only ask what's missing. Never re-ask something they already told you.

## How to ask

- **One message, all questions, multiple choice**, with a letter per option so they can
  reply "1b, 2a, 3 skip".
- If the environment has a structured question tool (e.g. `AskUserQuestion`), use it:
  up to 4 questions per call, 2–4 options each, the recommended option first and marked
  "(Rekomendasi)". The user can always type their own answer.
- Always include a way out: **"Lewati semua — pakai rekomendasi"**.
- Invite references: "Punya contoh web atau gambar yang disukai? Kirim link/gambarnya."
- Keep it short: 3 questions in quick mode, at most 7 in full mode. Ask full mode only for
  new brands or when the user seems to care about the look.
- Write the questions in the user's language.

## The questions (Bahasa Indonesia, with English)

**1. Gaya warna** (*color style*)
- a. **Solid**: satu warna utama yang tegas untuk tombol & aksen *(one strong brand color)*
- b. **Pastel**: lembut dan ceria *(soft pastels)*
- c. **Senada**: satu warna dalam beberapa gradasi muda–tua *(tonal, shades of one hue)*
- d. **Dua warna**: warna utama + warna pendamping *(duotone)*
- e. **Hitam-putih + logo**: netral, warna hanya dari logo *(monochrome, logo is the only color)*
- f. **Gelap**: latar gelap dengan satu warna menyala *(dark mode first)*
- g. **Terserah**: pakai rekomendasi *(use the recommendation)*

**2. Warna brand/logo** (*brand color*)
- a. Saya kirim logonya *(I'll upload the logo)* → extract the palette with `scripts/extract_colors.py`
- b. Kode warnanya: `#______` *(hex code)*
- c. Belum punya, pilihkan *(none yet, choose for me)*

**3. Kesan yang diinginkan (pilih 2–3)** (*personality*)
profesional · ramah · mewah · ceria · tenang · berani · minimalis · hangat · modern · terpercaya · teknis · elegan

**4. Bentuk** (*shape*)
- a. Tegas (sudut kecil) *(sharp)* · b. Lembut *(soft)* · c. Bulat / pill *(round)* · d. Terserah

**5. Kepadatan** (*density*)
- a. Lega, banyak ruang *(airy)* · b. Seimbang *(balanced)* · c. Padat, banyak data *(compact)* · d. Terserah

**6. Referensi** (*references*)
"Ada web/aplikasi/gambar yang Anda suka? Kirim link atau screenshot, dan sebutkan apa yang
disukai (warna, tata letak, font, kesan)." Also ask for an **anti-reference**:
"Ada yang tidak Anda suka?"

**7. Tema** (*theming*)
- a. Pengunjung bisa pilih mode terang/gelap *(visitor light/dark toggle)*
- b. Admin bisa ganti warna utama dari panel *(admin-settable brand color)*
- c. Keduanya *(both)* · d. Tidak perlu *(neither)*

## Quick mode (3 questions)

For most projects, ask only:

```
Biar tampilannya sesuai selera, 3 pertanyaan singkat (boleh dilewati):

1. Gaya warna: a) Solid  b) Pastel  c) Senada  d) Dua warna  e) Hitam-putih + logo  f) Gelap  g) Terserah
2. Warna brand: a) Saya kirim logo  b) Kode warna #……  c) Pilihkan
3. Kesan (pilih 2–3): profesional · ramah · mewah · ceria · tenang · berani · minimalis · hangat

Punya contoh web/gambar yang disukai? Kirim saja linknya.
Atau balas "lewati" dan saya pakai rekomendasi yang cocok untuk jenis web ini.
```

## Skip → recommended defaults

When the user skips (or answers "terserah"), decide from the **site type** and **what you
can infer** (business, audience, existing logo), then state the choice in one line so they
can change it later:

| Site type | Color style | Shape | Density | Personality |
|---|---|---|---|---|
| Company profile / corporate | solid (brand) or monochrome + accent | soft | airy | profesional, terpercaya |
| Landing / SaaS | monochrome + one accent highlight | soft/round | airy | modern, berani |
| E-commerce | solid brand + neutral, product photos carry color | soft | balanced | ramah, terpercaya |
| Food, bakery, hospitality | warm tonal (senada) | soft | airy | hangat, ramah |
| Education / kids | pastel categories + solid action | round | airy | ceria, ramah |
| Admin / dashboard | neutral + one accent | soft | compact | tenang, profesional |
| Finance / legal / government | solid deep color, high contrast | sharp/soft | balanced | terpercaya, tenang |
| Developer tool / tech | dark-first + one luminous accent | sharp | compact | teknis, modern |
| Fashion / premium | black-white + one accent or none | sharp | airy | mewah, elegan |

Example line: *"Saya pakai gaya senada hangat (terakota), sudut lembut, tata letak lega.
Warnanya bisa diganti kapan saja dari panel Tampilan."*

## Turning answers into a direction

Map answers to the dimensions in `design-direction.md`, then write the direction block
(type, color, shape, density, imagery, signature). Answers win over presets; presets fill
gaps. If answers conflict (e.g. "mewah" + "pastel ceria"), pick the reading that fits the
business and mention it ("pastel lembut dengan tipografi serif agar tetap terasa mewah").

## Color style recipes

Implemented by `assets/theme.js` (`Theme.apply({ primary, secondary, palette })`) and
expressible as static tokens:

| Style | Action buttons | Accents / tints | Canvas & surfaces | Notes |
|---|---|---|---|---|
| **solid** | primary fill | primary at low strength for soft states | neutral | the classic; one strong color |
| **pastel** | primary deepened until text contrast passes | light pastel tints of primary + analogous hues | very light tint of primary | keep text dark; pastel is for surfaces, not text |
| **senada (tonal)** | primary | all tints are shades of the same hue | canvas, muted surfaces and borders lightly tinted with primary | elegant and calm; vary lightness, not hue |
| **duo** | primary | secondary for highlights, tints, charts' second series | neutral | pick a secondary that contrasts in hue (not two similar blues) and check contrast |
| **mono (hitam-putih)** | ink (black) | neutral grays only; primary appears only in the logo and focus ring | white / near-white | the logo becomes the hero color; very premium if spacing is generous |
| **dark** | primary on dark | primary glow at low alpha | near-black surfaces | use `mode: 'dark'` with any of the above |

Always run the contrast guardrails (theme.js does: on-primary text and text-safe accent).

## Reference images and URLs

- **Images (screenshots, Dribbble, a logo)**: run
  `python <skill>/scripts/extract_colors.py <image> [--count 6]` to get the dominant
  colors with shares, plus suggested primary, secondary, ink and canvas colors and contrast
  notes. Then write the reference style spec (`style-presets.md`): what they like = colors,
  shapes, density, type mood, signature details.
- **URLs**: `node <skill>/scripts/extract_design.js --url <url>` (fonts, type scale, palette,
  radius, buttons, sections, grid). If the host is blocked, ask for screenshots.
- Ask what they like about it. "Warnanya" and "tata letaknya" lead to different decisions.
- Borrow the system, never the content, logo or images.

## Confirm before building

Summarize in 3–5 lines and offer one last chance to adjust:

```
Arah desain:
• Warna: senada terakota (#b4532a), latar krem lembut
• Kesan: hangat, ramah · Font: serif untuk judul, sans untuk teks
• Bentuk: sudut lembut · Tata letak: lega
• Tema: pengunjung bisa mode gelap, admin bisa ganti warna utama
Lanjut dengan ini? (atau sebutkan yang mau diubah)
```
If the user already said "langsung saja", skip the confirmation and build; mention the
direction in the final report instead.
