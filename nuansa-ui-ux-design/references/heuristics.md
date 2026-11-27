# Heuristic Evaluation — Nielsen's 10, applied and scored

A structured usability review that goes beyond looks. Use it in Phase 2 (audit) for
each key page/flow, and again in Phase 5 to show improvement. Score severity, not
opinions, so priorities are clear.

## Contents
- How to run it
- Severity scale
- The 10 heuristics (what to look for, typical fixes)
- Report template
- Example findings

---

## How to run it

1. Pick the top 3–5 flows from the UX brief (`ux-flows.md`) and their key screens.
2. Walk each flow as a first-time user, on mobile and desktop.
3. For each problem: which heuristic, where, severity (0–4), and a concrete fix.
4. Summarize per heuristic (worst severity + count) and list fixes by severity.
5. After the redesign, re-score the same screens; include before/after in the report
   (`scripts/before_after.js --notes`).

## Severity scale

| Score | Meaning | Action |
|---|---|---|
| 0 | not a problem | — |
| 1 | cosmetic | fix if time allows |
| 2 | minor usability problem | fix, low priority |
| 3 | major: users struggle or make errors | fix before release |
| 4 | catastrophe: users can't complete the task or lose data | fix immediately |

## The 10 heuristics

### H1. Visibility of system status
Users always know what's happening.
- Look for: no feedback after save/delete, no loading indicators, no current-page
  indicator, unclear order/payment status.
- Fix: toasts, button loading states, skeletons, `aria-current` nav, progress steppers,
  status badges and timelines.

### H2. Match between system and the real world
Speak the users' language, follow real-world conventions.
- Look for: technical jargon ("Submit", "Record", "Null", error codes), English mixed
  randomly into Indonesian UI, unfamiliar date/money formats.
- Fix: plain Indonesian labels, `Rp1.250.000`, "25 Nov 2026", relative time, icons people know.

### H3. User control and freedom
Easy exits and undo.
- Look for: no cancel/back in flows, irreversible actions without undo, modals that
  can't be closed with Esc/outside click, forced multi-step wizards with no back.
- Fix: Undo toasts, Cancel buttons, closeable modals, back navigation that keeps state.

### H4. Consistency and standards
Same thing, same look, same place, same word.
- Look for: several button styles for the same action, different terms for one
  concept, primary action on the left on some pages and right on others, non-standard
  icons.
- Fix: tokens + shared components, one term per concept, consistent page header pattern.

### H5. Error prevention
Prevent problems before they happen.
- Look for: free-text where a choice would do, no constraints on inputs, destructive
  actions next to common ones, no confirmation on irreversible actions.
- Fix: selects/chips, input types + masks, sensible defaults, separated danger zones,
  confirmations only for destructive actions, disabled submit until valid (with reason).

### H6. Recognition rather than recall
Don't make users remember.
- Look for: needing info from a previous screen, hidden options, icon-only navigation
  without labels, filters that reset.
- Fix: visible labels, show selections and summaries, keep filters in the URL, recent items,
  autocomplete.

### H7. Flexibility and efficiency of use
Shortcuts for frequent users without confusing new ones.
- Look for: no bulk actions, no search, frequent tasks buried, no keyboard support in admin.
- Fix: bulk actions, global search, saved filters, quick actions on dashboard, keyboard
  shortcuts (documented), inline edit.

### H8. Aesthetic and minimalist design
Every extra element competes with the relevant ones.
- Look for: walls of text, redundant headings, decoration, too many colors, many
  competing CTAs. (`content-clarity.md`, `layout-system.md`)
- Fix: text budget, 1-1-1 cards, one primary action, tokens, whitespace.

### H9. Help users recognize, diagnose and recover from errors
Errors in plain language with a way out.
- Look for: "Error 500", "Invalid input", errors only at the top of a long form, native
  validation bubbles, lost input after an error.
- Fix: inline messages saying what's wrong + how to fix ("Nomor HP diawali 08"), keep the
  input, retry buttons, contact link for blocking errors.

### H10. Help and documentation
Help where it's needed, when it's needed.
- Look for: complex features with no explanation, help only in a separate FAQ page.
- Fix: contextual hints (one line), empty states that teach, tooltips for advanced
  options, a short FAQ/accordion near the relevant flow, WhatsApp/support link.

## Report template

```markdown
# Heuristic evaluation — <project> (<date>)
Flows reviewed: …   Devices: 375px, 1440px

| # | Heuristic | Worst | Count |
|---|---|---|---|
| H1 | Visibility of system status | 3 | 2 |
| … |

## Findings (highest severity first)
| Sev | Heuristic | Where | Problem | Fix |
|---|---|---|---|---|
| 4 | H9 | Checkout › Pembayaran | Payment failure shows "Error 500", cart is emptied | Plain message + retry, keep cart |
| 3 | H1 | Admin › Produk | Save gives no feedback | Toast "Produk disimpan" + button loading state |

## After redesign (re-score)
| Heuristic | Before | After |
```

## Example findings

| Sev | H | Where | Problem | Fix |
|---|---|---|---|---|
| 3 | H5 | Admin › Produk | "Hapus" sits next to "Edit" with the same style, no confirm | Danger style, move to row menu, confirm with item name |
| 3 | H2 | Form daftar | Labels "Submit", "Field required" in English | "Daftar", "Wajib diisi." |
| 2 | H6 | Laporan | Date filter resets after opening a detail | Keep filters in query params |
| 2 | H8 | Dashboard | Welcome banner + 3 paragraphs above the KPIs | Remove banner, KPIs first |
| 1 | H4 | Global | Two greens for success | One `--color-success` token |
