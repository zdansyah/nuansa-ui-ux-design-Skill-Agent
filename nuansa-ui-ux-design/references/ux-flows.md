# UX Flows & Information Architecture — design the path before the pixels

A beautiful page on a confusing path still fails. Before choosing colors or components,
know **who** comes, **what they must get done**, and **how many steps it takes**. This is
the step senior designers never skip, and it's quick when done at the right size.

## Contents
- Step 1 — Top tasks
- Step 2 — Map each flow and count the steps
- Step 3 — Cut steps (the flow fixes)
- Step 4 — Information architecture (sitemap & navigation)
- Step 5 — Naming (labels people understand)
- Step 6 — Hierarchy per screen
- Deliverable: the UX brief
- Common flow problems by site type

---

## Step 1 — Top tasks

List the 3–5 things users come to do, ranked by frequency × importance. Use what you
have: the user's description, existing routes/menu, analytics or support questions if
mentioned, or the site type in `site-types.md`.

```
Top tasks — Toko Maju (admin)
1. Proses pesanan baru            (harian, kritis)
2. Tambah / ubah produk & stok    (harian)
3. Cek penjualan hari ini         (harian)
4. Kelola pengguna & peran        (bulanan)
```
Everything in the UI should serve these. Things that serve none of them are candidates
to move deeper or remove (with the user's OK).

## Step 2 — Map each flow and count the steps

Write each top task as a sequence of screens and actions, and count the steps:

```
Proses pesanan baru (now): Dashboard → Menu Pesanan → filter "Baru" → buka pesanan → ubah status (dropdown) → Simpan → confirm() → kembali   = 7 steps, 1 native dialog
Proses pesanan baru (better): Dashboard card "5 pesanan baru" → daftar terfilter → [Proses] per baris → toast + undo   = 3 steps
```
- A step = a page load, a modal, or a required decision/click.
- Note dead ends (no next action after success), loops, and places users must remember
  information from a previous screen.

## Step 3 — Cut steps (the flow fixes)

| Pattern | Fix |
|---|---|
| Frequent action hidden in a menu | Surface it on the dashboard or the list row |
| Navigate → filter → act | Deep-link pre-filtered views ("5 pesanan baru" opens the filtered list) |
| Separate edit page for one field | Inline edit or a small modal/drawer |
| Confirm every action | Confirm only destructive/irreversible ones; otherwise act + toast with **Undo** |
| Long single form | Steps with progress, or smart defaults + "optional" section collapsed |
| Success page with no next step | Toast + stay in context, or a success screen with the logical next action |
| Asking for data you have | Prefill (user profile, last used address, today's date) |
| Signup before value | Let users browse/try first; ask for an account at the moment it's needed |
| Same info typed twice | "Sama dengan alamat pengiriman" checkbox, copy from previous |

Target: the top task completes in **≤ 3 steps** where possible, and nothing important is
more than 2 clicks from the main navigation.

## Step 4 — Information architecture (sitemap & navigation)

Write the sitemap as an indented list before building navigation:

```
Dashboard
Penjualan
  Pesanan        (badge: baru)
  Pembayaran
Katalog
  Produk
  Kategori
Pelanggan
Laporan
Pengaturan
  Toko · Tampilan · Pengguna & Peran · Integrasi
```
Rules:
- Group by **user task/mental model**, not by database table or org chart.
- Top level ≤ 7 items. Depth ≤ 2 levels in navigation; deeper content uses tabs or
  in-page sections.
- Each page lives in exactly one place. Shortcuts are fine, but don't duplicate menus.
- Rarely used admin/system items go to the bottom or into Settings.
- Public sites: primary nav ≤ 5 links + one CTA. Secondary items go in the footer.
- Keep URLs readable and stable (`/produk/kaos-polos`, `/admin/pesanan?status=baru`).
- In a redesign, keep existing routes working (redirect if renamed).

## Step 5 — Naming (labels people understand)

- Use the users' words, not internal jargon: "Pesanan" not "Order Management Module";
  "Bantuan" not "Knowledge Base".
- Nouns for sections (Produk, Laporan), verbs for actions (Tambah produk, Ekspor).
- Be consistent: one term per concept everywhere (don't mix "Pelanggan", "Customer"
  and "Member").
- Labels must be distinguishable: avoid "Data", "Lainnya", "Manajemen" as top-level items.
- Test: could a new user guess what's behind each menu item without clicking?

## Step 6 — Hierarchy per screen

For every key screen write one line: **"The user comes here to ___; the main thing is ___;
the main action is ___."** Then make that thing the largest/most prominent element and that
action the only primary button. Everything else is secondary or hidden behind progressive
disclosure (`content-clarity.md`).

## Deliverable: the UX brief

Before the visual work, produce a short brief (in chat, or `UX-BRIEF.md` for larger work):

```markdown
# UX brief — <project>
## Users & top tasks
1. … (frequency, importance)
## Flows (now → proposed, step counts)
- Task 1: 7 → 3 steps — what changes
## Sitemap
(indented list)
## Naming changes
- "Manajemen Data Order" → "Pesanan"
## Key screens: purpose · main element · main action
- Dashboard: see today's work · "pesanan baru" card · [Proses pesanan]
## Open questions for the user
```
In a redesign, flow changes that alter behavior (removing a step, moving a feature)
need the user's OK. Visual-only changes don't.

## Common flow problems by site type

- **E-commerce**: forced signup before checkout; shipping cost revealed only at the last
  step; cart not visible from product page; no guest checkout.
- **Company profile**: contact buried; services described but no clear next step
  (WhatsApp/contact CTA on every service).
- **Admin**: frequent actions behind 3 menus; no bulk actions; filters reset after editing
  a record (keep query params).
- **Booking**: availability shown only after filling a long form; price changes at the end.
- **Forms/government**: required documents revealed mid-form; no draft saving; no status
  tracking after submit.
- **SaaS**: pricing hidden; onboarding asks 10 questions before showing the product.
