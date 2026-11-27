# No Native UI — replace every browser/OS-styled popup and control

Native popups and OS-styled controls instantly make a polished site look unfinished:
grey Windows dialogs, "Please fill out this field" bubbles, yellow tooltips, "Choose File /
No file chosen". This file maps each one to its replacement in the bundled assets.

## Contents
- The map
- Setup (3 files)
- Popups: alert / confirm / prompt
- Validation bubbles
- "Leave site?" dialog
- Tooltips
- Native controls
- What must stay native (and why)
- Verify

---

## The map

| Native thing | Looks like | Replace with | Provided by |
|---|---|---|---|
| `alert()` | grey OS dialog, "OK" | `UI.toast()` / `await UI.alert()` | ui-feedback.js |
| `confirm()` | grey OS dialog, OK/Cancel | `await UI.confirm()` or `data-confirm="…"` | ui-feedback.js |
| `prompt()` | grey OS dialog with input | `await UI.prompt()` | ui-feedback.js |
| validation bubble | "Please fill out this field." tooltip | inline field error + summary toast, **automatic** | ui-feedback.js |
| `beforeunload` for links | "Leave site? Changes may not be saved" | `<form data-unsaved-guard>` → styled modal | ui-feedback.js |
| `title=""` tooltip | small yellow/grey OS tooltip | `data-tooltip="…"` / `UI.upgradeTooltips()` | ui-feedback.js + .css |
| checkbox / radio | OS-styled squares/circles | restyled native input (`appearance: none`) | ui-controls.css |
| `<select>` | OS arrow, inconsistent height | same box as inputs + custom chevron | ui-controls.css |
| `<input type=file>` | "Choose File / No file chosen" | styled `::file-selector-button` (or a dropzone) | ui-controls.css |
| scrollbars in cards/tables | thick grey OS bars | thin neutral scrollbars | ui-controls.css |
| autofill | yellow/blue background | surface color kept | ui-controls.css |
| focus outline | browser default outline | consistent focus ring | ui-controls.css |
| `window.open()` popup | separate browser window | in-page modal/drawer or a normal link | (refactor) |

## Setup (3 files)

```html
<link rel="stylesheet" href="/css/ui-feedback.css">
<link rel="stylesheet" href="/css/ui-controls.css">
<script src="/js/ui-feedback.js" defer></script>
```
Load after the token stylesheet. In React/Vue apps, either include these globally or
implement the same behaviors in the app's component library with the same API.

## Popups: alert / confirm / prompt

See "Replacing native dialogs safely" in SKILL.md for the sync→async refactor rules.
Quick reference:

```js
UI.toast('Produk tersimpan', { type: 'success' });
if (await UI.confirm({ title: 'Hapus produk?', message: 'Tidak bisa dibatalkan.', variant: 'danger', confirmText: 'Hapus' })) { … }
const nama = await UI.prompt({ title: 'Ganti nama', label: 'Nama', defaultValue: 'Kaos', required: true }); // null on cancel
```

Server-rendered delete links and forms need no JS changes:
`<a href="/produk/5/hapus" data-confirm="Hapus Kaos Polos?">Hapus</a>`.
Submit buttons with `data-confirm` show validation errors **first** and ask for
confirmation only once the form is valid.

## Validation bubbles

Automatic for every form once `ui-feedback.js` is loaded. The browser still validates
(`required`, `type=email|url|number`, `minlength`, `maxlength`, `min`, `max`, `step`,
`pattern`) and still blocks submission, but:
- the bubble is suppressed (`invalid` event → `preventDefault`),
- each invalid field gets an inline message under it (`.uif-field-error`), plus
  `aria-invalid="true"` and `aria-describedby` linking to the message,
- focus and scroll go to the first invalid field, and a summary toast appears when
  more than one field is wrong,
- messages update live while typing and clear when the field becomes valid,
- messages are in Indonesian when `<html lang="id">` (English otherwise).

Customize per field:
```html
<input name="hp" required pattern="08[0-9]{8,11}"
       data-error-required="Nomor HP wajib diisi."
       data-error-pattern="Nomor HP diawali 08, 10–13 digit.">
<input type="checkbox" name="setuju" required data-error-message="Setujui syarat dulu ya.">
```
Keys: `data-error-message` (any), `data-error-required`, `-type`, `-length`, `-range`, `-pattern`.
Opt out (when the app already renders its own errors): `data-native-validation` on the
form or field. If the form is submitted via fetch, call `form.checkValidity()` (or
`UI.validate(form)`) first; it triggers the same inline messages.

Server-side errors (e.g. Laravel `$errors`) should render into the same `.field__error`
element under the field, so client and server errors look identical.

## "Leave site?" dialog

Add `data-unsaved-guard` to forms where losing edits would hurt (long create/edit forms):
- after the first edit, clicking any link that leaves the page shows a styled modal:
  "Tinggalkan halaman? Perubahan yang belum disimpan akan hilang." (Tinggalkan / Tetap di sini),
- submitting the form clears the guard; after an AJAX save call `UI.markSaved(form)`.

Honest limitation: **closing the tab, reloading, or typing a new URL** can only be
intercepted by the browser's own `beforeunload` dialog. Browsers forbid custom UI and
custom text there, for security. The guard therefore keeps that native prompt as a last
resort, and only while unsaved changes exist. Remove any unconditional
`onbeforeunload` handlers you find. They nag users on every exit.

## Tooltips

- Use `data-tooltip="Hapus item"` (shows on hover and keyboard focus after 300ms, hidden on
  touch devices). Use `data-tooltip-pos="bottom"` near the top edge.
- Existing `title=""` on links and buttons: call `UI.upgradeTooltips()` once. It moves the text
  to `data-tooltip` and adds `aria-label` to icon-only buttons so screen readers still get
  a name.
- Tooltips are for supplementary hints only. Primary actions need visible labels.

## Native controls

`ui-controls.css` restyles native elements without replacing them, so keyboard
behavior, form submission, mobile pickers and accessibility keep working:
- checkbox/radio (and `role="switch"` checkboxes become toggles), select chevron, file
  button, range accent, date icon tint (inverted in dark mode), number spinners hidden,
  search clear "x" removed, `<details>` triangle removed, thin scrollbars, autofill
  colors, focus ring, `::selection`, and `accent-color` from the primary token.
- Add `.native` to any element that should keep the browser look.
- Build a fully custom dropdown, date picker or combobox **only** when the product needs
  features native controls lack (search inside options, multi-select chips, ranges). Use
  an accessible library or the framework's design system, not a hand-rolled div soup.

## What must stay native (and why)

- `beforeunload` on tab close/reload (browser-enforced, see above).
- Permission prompts (camera, location, notifications) and payment sheets. Explain
  *before* triggering them with an in-page message so the native prompt isn't a surprise.
- File picker window and mobile date/time wheels: the OS picker is the best UX there.
  Style the trigger, not the picker.
- Print dialog (`window.print()`): style the page with `@media print` instead.

## Verify

```bash
python scripts/find_native_dialogs.py <project> --all
```
- Native `alert/confirm/prompt` calls: should be **0** in app code.
- "Other native UI": each item listed with its fix (beforeunload, window.open, title
  tooltips, unstyled controls). Fix or consciously accept each.
- `responsive_check.js` also records any native dialog that fires while pages load.
- Manually: submit each form empty (inline errors, no bubble), edit a guarded form and
  click a nav link (styled modal), tab through checkboxes and selects (focus ring visible).
