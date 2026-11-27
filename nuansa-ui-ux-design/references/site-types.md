# Site Types — what each kind of website needs

The principles (clean, tidy, low text, tokens, no native UI, responsive) apply to every
site. What changes per type is **which pages exist, which components matter most, how
much text is right, and which preset fits**. Find the type below, then follow the linked
references.

## Contents
- Quick map
- Company profile / corporate
- Landing page / SaaS / product
- E-commerce / online shop
- Blog / news / documentation (long-form)
- Portfolio / personal / agency
- Booking / services / marketplace
- Education / course platform
- Admin panel / dashboard / internal tool
- Government / public service / form-heavy
- Auth pages (login, register, reset)
- Utility tool (single task)
- Mobile web app / PWA
- Pages every site needs

---

## Quick map

| Type | Core pages | Most important components | Text level | Preset (start here) |
|---|---|---|---|---|
| Company profile | Home, Layanan, Tentang, Klien/Proyek, Kontak | split headers, service cards, logo strip, contact form | low–medium | Editorial Neutral, Clean Pro |
| Landing / SaaS | Home, Harga, FAQ, Masuk/Daftar | hero, stat strip, steps, bento features, pricing, CTA band | low | Editorial Neutral, Soft Bento, Mono + Accent |
| E-commerce | Home, Kategori, Produk, Keranjang, Checkout, Pesanan | product card, filters, variant chips, sticky add-to-cart, order timeline | very low (except product description) | Clean Pro, Pastel Blocks, Mono + Accent |
| Blog / news / docs | Index, Artikel, Kategori/Tag, Cari | reading layout, TOC, article card, code block | **high (exempt from text budget)** | Editorial Neutral |
| Portfolio / agency | Home, Karya, Studi kasus, Tentang, Kontak | big thumbnails, case study layout | low | Editorial Neutral, Mono + Accent |
| Booking / services | Cari, Hasil, Detail, Pilih jadwal, Konfirmasi | search bar, result cards, date/slot picker, summary | low | Pastel Blocks, Clean Pro |
| Education | Katalog, Kursus, Pelajaran, Kuis, Progres | course card with progress, lesson player, quiz screen | low (lesson content exempt) | Pastel Blocks, Soft Bento |
| Admin / dashboard | Dashboard, list pages, detail/edit, settings | sidebar, tables, filters, KPI, forms | low | Clean Pro, Soft Bento |
| Government / forms | Layanan, Formulir, Status, Bantuan | stepper, form fields, upload, status timeline | medium, plain language | Clean Pro |
| Auth | Masuk, Daftar, Lupa sandi, Verifikasi | single-column form, social login, OTP input | very low | matches the product |
| Utility tool | one page | the tool as hero, result card, copy action | very low | Editorial Neutral |
| Mobile web / PWA | Home, list, detail, profile | bottom nav, app bar, sheets, chips | very low | Pastel Blocks, Mono + Accent |

Then read: `layout-system.md` (all types), `content-clarity.md` (all types), plus the
type-specific reference named in each section.

## Company profile / corporate

- Home: hero (editorial split: headline + short paragraph + CTA, image below) → services
  (3–6 cards, icon + title + 1 line) → why us (4-up row) → work/clients (logo strip or
  image cards) → CTA band → footer with address and map link.
- Use the split header formula for every section (`layout-system.md`).
- One strong photo style (real team/projects). Avoid stock handshake photos.
- Contact page: a short form (name, email/WhatsApp, message), plus WhatsApp and email
  buttons, address, and an embedded map below the form.
- Typical clutter to remove: vision/mission walls of text on the home page (move to
  Tentang), sliders/carousels with 5 slides, visitor counters.

## Landing page / SaaS / product

Follow `landing-page.md` fully. Keep it to 4–6 sections; pricing with 2–3 plans; FAQ
as an accordion (5–8 questions).

## E-commerce / online shop

- **Product card**: image (1:1 or 4:5, same ratio everywhere, rounded) · name (2 lines
  max, truncated) · price (bold, strike-through original + discount badge if on sale) ·
  rating ★ 4,8 (120) · optional "Terjual 1rb+". No description on the card.
- **Listing**: 2 columns on mobile, 4–5 on desktop; filter + sort bar sticky; filters in a
  bottom sheet on mobile; active filters as removable chips; infinite scroll or "Muat lagi".
- **Product page**: gallery (swipe on mobile, thumbnails on desktop) · name · price ·
  variant chips (size/color, disabled when out of stock) · quantity stepper · **sticky
  bottom bar on mobile** with price + "Tambah ke keranjang" + "Beli sekarang" · trust row
  (gratis ongkir, garansi, retur) as icons · description collapsed to 3 lines with
  "Selengkapnya" · reviews summary.
- **Cart**: item rows (image, name, variant, stepper, price, remove with undo toast) ·
  summary card sticky on desktop, bottom bar on mobile · voucher input collapsed.
- **Checkout**: single column, 3 steps max (Alamat → Pengiriman → Pembayaran), order
  summary visible, guest checkout if possible. Indonesian payment methods as selectable
  cards with logos: QRIS, e-wallet (GoPay, OVO, DANA, ShopeePay), virtual account, COD.
  Show the total in large numbers; one primary button "Bayar Rp…".
- **Order status**: vertical timeline (Dibayar → Dikemas → Dikirim → Selesai) with the current
  step highlighted, tracking number with a copy button.
- Format money as `Rp1.250.000` consistently (`Intl.NumberFormat('id-ID')`).

## Blog / news / documentation (long-form)

The exception to the low-text rule: reading content may be long, but it must be **easy
to read**. Wrap it in `<article>` (the text-budget checker skips it).

```css
.prose { max-width: 68ch; margin-inline: auto; font-size: 1.125rem; line-height: 1.75; color: var(--color-text); }
.prose h2 { font-size: 1.5rem; margin: 2.5em 0 .6em; } .prose h3 { font-size: 1.25rem; margin: 2em 0 .5em; }
.prose p, .prose ul, .prose ol { margin: 0 0 1.25em; } .prose img { border-radius: var(--radius-md); margin: 2em 0; }
.prose blockquote { border-left: 3px solid var(--color-primary); padding-left: 1em; color: var(--color-text-muted); }
.prose code { font-family: var(--font-mono); font-size: .9em; background: var(--color-surface-muted); padding: .1em .35em; border-radius: 4px; }
```
- Article page: category chip · title (≤ 12 words) · meta line (author · date · 5 menit
  baca) · cover image · body · tags · related articles (3 cards).
- Docs: left nav tree, content in the center (68ch), sticky "Di halaman ini" TOC on the
  right (desktop), copy buttons on code blocks, prev/next links at the bottom.
- Index pages: article cards follow the 1-1-1 rule (image, title, meta), no excerpts longer
  than 2 lines.
- Remove: ads between every paragraph, popups on scroll, share bars that cover text.

## Portfolio / personal / agency

- Work is the hero: large thumbnails (2-column grid or full-width stack), title + 1 tag
  line under each. Little copy elsewhere.
- Case study: hero image → 3 facts (role, timeline, result as numbers) → problem → process
  (images with short captions) → outcome → next project.
- One accent color, a distinctive display font, lots of whitespace.

## Booking / services / marketplace

- Flow: search (location/date/guests in one bar or chips) → results (cards with image,
  name, rating, distance, price "/ malam" or "/ jam") with a map toggle → detail (photos,
  3 key facts as tiles, amenities as icons, reviews) → choose date/time (week strip +
  time-slot chips; disabled slots greyed) → summary → pay.
- Sticky bottom bar on mobile with price + "Pesan".
- Availability and price are the most important information: make them big.

## Education / course platform

- Course card: thumbnail or color block · title · instructor · progress ring/bar · one
  action ("Lanjut").
- Lesson page: video/content area, lesson list on the side (desktop) or in a sheet
  (mobile), "Tandai selesai" + next lesson button.
- Quizzes: one question per screen, large answer tiles, timer pill, progress bar,
  immediate friendly feedback.
- Progress and streaks as visuals (rings, week strips), not paragraphs.
- Lesson content itself is long-form: use the `.prose` rules.

## Admin panel / dashboard / internal tool

Follow `admin-panel.md` fully, plus `native-ui.md` (admin panels are where `confirm()`
and `alert()` hide most).

## Government / public service / form-heavy

Clarity beats style: users must finish the task, often on old phones.
- Plain language (Bahasa Indonesia baku tapi sederhana), short sentences, no jargon or
  abbreviations without explanation.
- Long forms split into steps with a stepper ("Langkah 2 dari 4"), autosave or "Simpan
  draf", a review page before submit, and a clear confirmation with a reference number
  and download.
- Required documents listed **before** the form starts, with accepted formats and sizes.
- File upload: a dropzone with format/size hints, preview, and remove/replace.
- Status page: a timeline with dates and what happens next.
- Accessibility is mandatory: 16px+ body, high contrast, big touch targets, works
  without JavaScript where possible, keyboard-friendly.

## Auth pages (login, register, reset)

- Centered single column (max 400px) on a plain background, or split screen (form left,
  brand visual right) on desktop.
- Login: logo · "Masuk" (title only) · email/phone · password with a show/hide toggle ·
  "Lupa sandi?" link · primary button · social login buttons below a divider ·
  "Belum punya akun? Daftar".
- Register: the minimum fields only. Ask for the rest after signup.
- OTP: 4–6 separate boxes with auto-advance, paste support, `autocomplete="one-time-code"`,
  resend timer.
- Errors inline (ui-feedback.js), never `alert()`. Don't reveal whether an email exists.

## Utility tool (single task)

See "Single-task tool pages" in `landing-page.md`: the tool is the hero, narrow
container, round action buttons, a result card, and a copy toast.

## Mobile web app / PWA

Follow `mobile-app.md`: bottom nav, app bar with circular buttons, sheets, chips, safe
areas, thumb zone. Add a web app manifest with the brand color as `theme_color`.

## Pages every site needs

- **404**: short message ("Halaman tidak ditemukan"), a search box or 2–3 useful links,
  and a button home. Same header/footer as the site.
- **Error/500 & maintenance**: one sentence, a status or ETA if known, a retry button.
- **Empty states** for every list (see `components.md`).
- **Loading**: skeletons that match the layout.
- **Legal pages** (privacy, terms): `.prose` layout, a TOC for long documents, last-updated date.
- **Favicon, social preview image (og:image), page titles and meta descriptions** on every page.
