# Nuansa UI/UX Design — Claude Skill

Skill untuk Claude (Claude Code / Claude.ai) yang mengaudit, me-redesign, dan merapikan
UI/UX website atau web app (halaman utama, dashboard, admin panel, mobile web) menjadi
**modern, minimalis, clean, profesional, responsive**, dan **mudah diganti temanya**,
tanpa merusak fitur yang sudah berjalan.

## Isi

```
nuansa-ui-ux-design/
├── SKILL.md                     # Alur kerja utama (5 fase) + prinsip desain
├── references/
│   ├── audit-checklist.md       # Checklist audit per halaman + QA akhir
│   ├── design-tokens.md         # Template token (CSS vars / Tailwind / Bootstrap) + dark mode
│   ├── components.md            # Button, form, card, table responsif, modal, toast, chip pill, stat, dll.
│   ├── admin-panel.md           # Layout sidebar/topbar, grup menu, dashboard bento, tabel, filter
│   ├── style-presets.md         # 4 gaya: Clean Pro, Soft Bento, Mono + Accent (lime), Status Pastel
│   ├── mobile-app.md            # Bottom nav, app bar, bottom sheet, onboarding, safe area
│   └── theming.md               # Ganti warna seluruh web dari satu tempat + mode gelap
├── assets/
│   ├── ui-feedback.js / .css    # Pengganti alert/confirm/prompt: UI.toast, UI.confirm, UI.prompt, data-confirm
│   └── theme.js / .css          # Engine tema runtime + panel pemilih warna (Theme.apply, Theme.mountPicker)
├── scripts/
│   ├── find_native_dialogs.py   # Cari semua alert/confirm/prompt di project
│   ├── style_audit.py           # Ukur kekacauan styling (warna, font-size, inline style, !important)
│   └── responsive_check.js      # Screenshot 4 ukuran layar + deteksi overflow/tabrakan/teks terpotong
└── evals/                       # Test case (format `claude plugin eval`)
```

## Cara pakai

**Claude Code:** salin folder `nuansa-ui-ux-design/` ke `~/.claude/skills/` (untuk semua
project) atau `.claude/skills/` di project Anda. Lalu cukup minta, misalnya:

> Rapikan tampilan admin panel ini biar modern dan minimalis, responsive, dan ganti semua alert() jadi modal.

**Claude.ai:** upload file `.skill` hasil packaging di Settings → Capabilities → Skills.

Skill otomatis aktif untuk permintaan seperti "redesign", "rapikan tampilan", "biar tidak
jadul", "responsive", "ganti alert jadi modal", "bikin mirip referensi ini", atau "warna
web bisa diganti".

## Fitur utama

- **Audit dulu, baru ubah**: inventaris fitur dibuat sebelum redesign agar tidak ada yang hilang.
- **Design tokens**: satu sumber untuk warna, spacing, radius, dan tipografi.
- **Gaya dari gambar referensi**: ekstrak spec gaya (warna, radius, tipografi, komponen khas) lalu dipetakan ke token.
- **Tema bisa diatur**: `Theme.apply({ primary: '#d4ff3a', mode: 'dark', radius: 'round' })`, dengan
  warna hover/soft/teks yang aman kontras dihitung otomatis.
- **Tanpa dialog bawaan browser**: `UI.confirm()` berbasis Promise + atribut `data-confirm` untuk link/form server-side.
- **Verifikasi otomatis**: cek overflow, elemen bertabrakan, teks terpotong, touch target kecil di 375/768/1280/1440px.

## Uji cepat script

```bash
python nuansa-ui-ux-design/scripts/find_native_dialogs.py path/ke/project
python nuansa-ui-ux-design/scripts/style_audit.py path/ke/project
node   nuansa-ui-ux-design/scripts/responsive_check.js --url http://localhost:8000 --paths / /admin
```
