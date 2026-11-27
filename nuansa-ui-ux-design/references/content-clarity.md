# Content Clarity — less text, more structure

The single biggest difference between a dated UI and a clean one is **how much text it
shows**. Clean apps aren't emptier; they move information out of sentences and into
**structure**: numbers, icons, chips, color, progress and images. Users scan, not read.

This applies to every style. Glass, gradients and 3D are optional; a low text load is not.
Verify with `scripts/responsive_check.js`, which reports a text budget per page.

## Contents
- The rules
- Text budgets (measurable)
- Turn text into structure
- Card anatomy: the 1-1-1 rule
- One screen, one job
- Microcopy lengths
- Progressive disclosure
- Rewrite examples (Bahasa Indonesia)
- Color as information
- Imagery: one consistent style
- Checklist

---

## The rules

1. **Say it once.** No title + subtitle + description + helper text all repeating the same idea.
2. **Prefer a number to a sentence.** "24 slot kecil" beats "Tersedia 24 slot parkir kecil
   untuk motor dan sepeda."
3. **Prefer a control to an explanation.** Chips "Hari ini · Besok · Nanti" beat a
   paragraph explaining the time options.
4. **One focal point per card, one primary action per screen.**
5. **Labels are 1–2 words; buttons are 1–3 words; headings ≤ 6–8 words.**
6. **Hide the rest, don't delete it.** Details go behind "Lihat detail", an accordion, a
   bottom sheet or a detail page (progressive disclosure). Never remove information a task
   needs (see "What may be removed" in SKILL.md).
7. **Whitespace is part of the content.** If a card feels empty after cutting text, make
   the remaining element bigger, not the card busier.

## Text budgets (measurable)

| Unit | Budget | Typical dated UI |
|---|---|---|
| App screen, first viewport (375px) | aim ≤ 60 words (checker flags > 80) | 120–250 |
| Landing hero (headline + subtext + CTA) | ≤ 30 words | 60+ |
| Card | 1 title + ≤ 1 meta line + ≤ 1 short line of body | a paragraph |
| Paragraph in UI (not articles) | ≤ 25–30 words, ≤ 2 lines on mobile | 50–80 words |
| Heading | ≤ 8 words | full sentences |
| Button | ≤ 3 words / ≤ 20 characters | "Klik di sini untuk melanjutkan" |
| Form label | ≤ 3 words; hint ≤ 1 line | instructions above each field |
| Toast | ≤ 8 words | two sentences |
| Empty state | title ≤ 5 words + hint ≤ 12 words + 1 action | a paragraph |

Long-form content (articles, docs, terms, product descriptions on a detail page) is
exempt. Mark its container with `<article>` or `data-long-text` so the checker skips it.

## Turn text into structure

| Instead of writing… | Show… |
|---|---|
| "Anda telah menyelesaikan 2 dari 3 modul" | progress ring **2/3** |
| "Status pesanan Anda saat ini sedang dikirim" | badge **Dikirim** |
| "Harga Rp7.000 per jam" | **Rp7.000** big + "/ jam" small muted |
| "Diikuti oleh Budi, Sari, dan 4 lainnya" | avatar stack **+4** |
| "Kategori: Logika, Visual, Fokus" | chips with icons |
| "Kelas ini dimulai hari Rabu tanggal 25" | week strip with **Rab 25** selected |
| "Berat awal 53,3 kg, target 50 kg, kalori harian 740" | three colored stat tiles: value big, label small |
| "Tekan tombol di bawah untuk menambahkan" | a "+" button with a clear label |
| "Durasi sesi kurang lebih 15 menit" | pill **15 min** with a play button |
| explanation of the steps of a flow | segmented progress bar at the top (step 1 of 3) |
| rating text | ★ 4,5 (126) |
| "Tidak ada data yang dapat ditampilkan saat ini" | empty-state icon + "Belum ada pesanan" + [Buat pesanan] |

## Card anatomy: the 1-1-1 rule

Every card shows **one title, one supporting line, one action**, plus at most one
visual (icon, image, number, chart).

```
┌───────────────────────────────┐
│ [icon]                  2/3   │  ← visual + one status element
│                               │
│ UX Lab: Motion                │  ← title (1 line, 2 max)
│ Joseph Smith                  │  ← one meta line, muted
│ [ Gabung ]          (avatars) │  ← one action
└───────────────────────────────┘
```

List rows follow the same rule: icon · title + one muted meta line · chevron or value.
Settings lists: icon + label only (meta line optional), chevron right, hairline separators.

## One screen, one job

- Onboarding, quizzes, check-ins and setup: **one question per screen**, with large
  choices (chips or tiles), a segmented progress bar on top, and "Lewati" (text) +
  "Lanjut" (primary pill) at the bottom.
- Home screens: greeting (≤ 4 words) → one hero card (today's main thing) → a horizontal
  category chip row → a short list. Not five competing modules.
- Detail screens: image/visual on top → title + 1 meta line → 2–3 key numbers as tiles →
  one primary action pinned at the bottom.
- Admin pages: page title + primary action → filters → table. No intro paragraph.

## Microcopy lengths

- Buttons: a verb + object at most. "Simpan", "Gabung", "Pesan seat", "Lanjut".
- Section titles: noun phrases. "Rencana kamu", "Kursus saya", "Riwayat".
- Greetings: "Halo, Sandra". Skip "Selamat datang kembali di aplikasi kami!".
- Helper text: only when a field is genuinely ambiguous, one line.
- Confirmations: the specific consequence in ≤ 12 words. "Hapus 3 pesanan? Tidak bisa
  dibatalkan."
- Remove words that add nothing: "silakan", "untuk", "dapat", "Anda dapat…",
  "berikut adalah…", "di bawah ini", "klik di sini".

## Progressive disclosure

- Truncate long descriptions to 2 lines with "Selengkapnya".
- Put secondary details in an accordion, tab, bottom sheet, tooltip (supplementary only)
  or the detail page.
- Show advanced filters behind a "Filter" button with a count badge.
- In tables, show key columns; move the rest into the row's detail view or an
  expandable row.

## Rewrite examples (Bahasa Indonesia)

| Before (ramai) | After (bersih) |
|---|---|
| **Selamat Datang di Dashboard Admin!** Di halaman ini Anda dapat melihat ringkasan data toko Anda secara lengkap dan real-time. | **Dashboard** |
| DATA PRODUK — Halaman ini berisi data produk. Anda dapat menambah, mengubah, dan menghapus data produk. | **Produk** · [Tambah produk] |
| Klik tombol di bawah ini untuk menyimpan perubahan yang telah Anda buat | [Simpan] |
| Silakan masukkan alamat email Anda yang aktif di kolom berikut | Label: **Email** |
| Maaf, saat ini belum ada data transaksi yang dapat ditampilkan. Silakan coba lagi nanti. | **Belum ada transaksi** · [Buat transaksi] |
| Produk berhasil ditambahkan ke dalam database sistem kami. | Toast: **Produk ditambahkan** |
| Total pendapatan yang diperoleh pada bulan ini adalah sebesar Rp12.450.000 | **Rp12.450.000** · Pendapatan bulan ini |

## Color as information

Clean colorful apps use color to **replace labels**, not to decorate:
- One hue per category (Logika = purple, Fokus = orange, Visual = blue), the same everywhere
  (chip, card, icon tint). People learn it in seconds.
- Keep all category hues in **one family**: same lightness and saturation (all pastels, or
  all mid-tones). Mixing neon and pastel looks chaotic.
- Neutral UI (white / light gray / ink) around the colored blocks; the primary CTA stays
  ink or the brand accent.
- Never color alone for meaning: keep the short label or icon.

## Imagery: one consistent style

Illustrations, 3D objects, mascots or photos carry emotion so the copy doesn't have to,
but only if there's **one style** across the product (all line doodles, or all 3D
renders, or all photos with the same treatment). Mixed clip-art is a hallmark of dated
UI. Images get rounded corners matching the card radius, and text on images sits on a
dark gradient overlay.

## Checklist

- [ ] `responsive_check.js` text budget passes (flags > 80 words in the first phone screen; aim ≤ 60)
- [ ] No paragraph over ~30 words outside articles/detail descriptions
- [ ] Every button ≤ 3 words; every heading ≤ 8 words
- [ ] Every card passes the 1-1-1 rule
- [ ] Each screen/page has one primary action
- [ ] Repeated wording removed (breadcrumb vs title vs card title)
- [ ] Numbers, chips, badges, progress and avatars replace descriptive sentences where possible
- [ ] Details still reachable (detail page / accordion / "Selengkapnya")
