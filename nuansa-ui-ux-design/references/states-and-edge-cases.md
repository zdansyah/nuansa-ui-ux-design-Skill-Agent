# States & Edge Cases — design for real data, not the perfect mockup

Mockups show the happy path with ideal data: names fit, lists have 4 items, the network
is fast. Real products show 80-character product names, 0 results, 10,000 rows, slow
connections and errors. A senior designer specifies every state; a clean UI stays clean
in all of them.

## Contents
- The state matrix (per component)
- Page/data states
- Content edge cases
- How each component should cope
- Optimistic UI, undo and feedback timing
- Offline & slow network
- Verify with the stress test

---

## The state matrix (per component)

Every interactive component must define these. Missing states are bugs.

| State | Button | Input | Card / row | Toggle / chip | Link / nav item |
|---|---|---|---|---|---|
| Default | ✔ | ✔ | ✔ | ✔ | ✔ |
| Hover (pointer) | bg shift | border darker | subtle bg | bg shift | color/underline |
| Focus-visible | ring | ring + border | ring if clickable | ring | ring |
| Active / pressed | darker / scale .98 | — | — | — | — |
| Selected / current | — | — | highlighted bg | filled | `aria-current`, bold/accent |
| Disabled | 50% + no pointer | muted bg, no edit | dimmed | dimmed | not a link |
| Loading | spinner in place, width kept | — | skeleton | pending dot | — |
| Error | — | red border + message | inline error strip | revert + toast | — |
| Success | brief check / toast | ✓ optional | flash highlight | — | — |
| Read-only | — | plain text look | — | static label | — |

Rules:
- Loading buttons keep their width (no layout jump) and block double submit.
- Disabled buttons should explain why when it isn't obvious (helper text or tooltip:
  "Lengkapi alamat dulu").
- Hover never carries essential information (touch has no hover).

## Page/data states

Every list, table, chart, search and detail view needs:

| State | What to show |
|---|---|
| **First load** | skeleton matching the final layout (not a full-page spinner) |
| **Empty – first use** | icon + "Belum ada produk" + [Tambah produk] (the action that fills it) |
| **Empty – no results** | "Tidak ada hasil untuk 'kaos merah'" + [Reset filter], keep the filters visible |
| **Partial** | e.g. 1 item: layout still balanced (cards don't stretch to full width awkwardly) |
| **Many** | pagination / infinite scroll / virtualized table; counts ("312 produk") |
| **Error** | short message + [Coba lagi]; keep what was already loaded |
| **No permission** | explain + who to ask; hide actions the user can't do (keep existing permission logic) |
| **Offline** | banner "Kamu sedang offline" + queued actions, or a clear retry |
| **Stale / updating** | subtle refresh indicator; don't blank the content |

## Content edge cases

Design and test with:
- **Long text**: product names of 80+ chars, Indonesian compound words, long emails and
  URLs (`nama.sangat.panjang@perusahaan-contoh.co.id`), long person names
  ("Raden Mas Muhammad Yusuf Wicaksono Adiningrat").
- **Short text**: 1-character names, empty optional fields (don't render empty labels or
  "null").
- **Numbers**: `Rp9.999.999.999`, negative values (refunds), 0, decimals, percentages > 100%.
- **Counts**: 0, 1 (singular wording), 99+, 10.000+.
- **Dates/times**: today/yesterday/relative vs absolute, time zones (WIB/WITA/WIT), long
  month names.
- **Media**: missing image (fallback placeholder with the same aspect ratio), portrait vs
  landscape uploads, huge images.
- **User input**: emoji, HTML-like strings (must render as text), pasted line breaks.
- **Translations**: English strings are often 20–30% shorter than Indonesian; leave room.

## How each component should cope

| Component | Rule for long/extreme content |
|---|---|
| Card title | max 2 lines → `-webkit-line-clamp: 2`; full text in `title`/detail |
| Table cell | wrap text columns; truncate IDs/emails with ellipsis + tooltip; numbers never wrap (`white-space: nowrap`) |
| Button | never truncate. Keep labels short; allow wrapping only on mobile full-width buttons |
| Badge / chip | `white-space: nowrap`, max-width + ellipsis for user-generated values |
| Nav item | short labels by design; overflow into "Lainnya" menu, never overlap |
| Unbroken strings | `overflow-wrap: anywhere` on user content containers (emails, URLs, tokens) |
| Flex rows | `min-width: 0` on the flexible child so ellipsis works; `flex-wrap: wrap` for button groups |
| Grid cards | `minmax(min(100%, 220px), 1fr)` so one long card doesn't break the grid |
| Big numbers | `font-variant-numeric: tabular-nums`; shrink with `clamp()` in tight tiles; abbreviate (12,4 jt) where precision isn't needed, full value in tooltip |
| Images | fixed `aspect-ratio` + `object-fit: cover`; fallback background |

```css
.clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
.user-content { overflow-wrap: anywhere; }
```

## Optimistic UI, undo and feedback timing

- < 100ms: feels instant, no indicator needed.
- 100ms–1s: subtle indicator (button spinner, row pending state).
- > 1s: skeleton/progress; > 10s: progress with explanation and the option to continue
  working.
- For safe, reversible actions (archive, mark as read, toggle), update the UI
  immediately, then sync; on failure revert and show an error toast.
- Prefer **Undo** in a toast over a confirmation dialog for reversible deletes
  ("Produk dihapus · Batalkan", 5–8s).
- Never leave the user wondering: every action gets visible feedback.

## Offline & slow network

- Show cached content with a "terakhir diperbarui" note rather than an empty page.
- Disable submit while offline, or queue and say so.
- Images: lazy-load with aspect-ratio placeholders; low-quality previews for big heroes.
- Test with `responsive_check.js --slow`.

## Verify with the stress test

```bash
node <skill>/scripts/responsive_check.js --url http://localhost:8000 --paths / /produk /admin/pesanan --stress
```
The stress pass doubles every text, injects long unbroken words and `9.999.999.999`
numbers, fills inputs with long values, then reports overflow, overlaps and clipped text
and saves `*-stress.png` screenshots. Fix with the rules above until the layout holds.
Also manually open each list with 0 items and with an error (stop the API, or use a
query that returns nothing).
