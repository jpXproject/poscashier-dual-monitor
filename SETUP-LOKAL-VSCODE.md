# Panduan Setup Lokal — Two-Monitor POS (Kasir + Display)

Panduan berurutan untuk menjalankan project ini di **PC lokal** memakai **VS Code**, dirancang agar **zero error**. Ikuti langkahnya satu per satu, jangan dilewati.

> Project: **1 web app, 1 database Convex, 2 monitor** (`/kasir` untuk admin, `/display` untuk pelanggan).

---

## Daftar Isi

1. [Persiapan (install software)](#1-persiapan-install-software)
2. [Clone project dari GitHub](#2-clone-project-dari-github)
3. [Install dependency (npm install)](#3-install-dependency-npm-install)
4. [Buka project di VS Code](#4-buka-project-di-vs-code)
5. [Hubungkan ke Convex (paling penting)](#5-hubungkan-ke-convex-paling-penting)
6. [Buat file .env.local](#6-buat-file-envlocal)
7. [Set env auth di deployment Convex](#7-set-env-auth-di-deployment-convex)
8. [Jalankan app (npm run dev)](#8-jalankan-app-npm-run-dev)
9. [Tes 2 monitor](#9-tes-2-monitor)
10. [Isi menu contoh](#10-isi-menu-contoh)
11. [Perintah harian yang sering dipakai](#11-perintah-harian-yang-sering-dipakai)
12. [Mengatasi error umum (zero error checklist)](#12-mengatasi-error-umum-zero-error-checklist)
13. [Push perubahan ke GitHub](#13-push-perubahan-ke-github)

---

## 1. Persiapan (install software)

Install sekali saja di PC kamu. Cek dulu yang sudah ada:

| Software | Fungsi | Cek dengan perintah |
|---|---|---|
| **Node.js v18+** (rekomendasi v20 LTS) | Menjalankan project | `node -v` |
| **npm** (ikut otomatis dengan Node) | Install package | `npm -v` |
| **Git** | Clone & push ke GitHub | `git --version` |
| **VS Code** | Editor kode | buka VS Code |

**Jika belum ada:**

- **Node.js** → download dari https://nodejs.org (pilih LTS) → install seperti biasa
- **Git** → download dari https://git-scm.com → install default
- **VS Code** → download dari https://code.visualstudio.com → install default

**Ekstensi VS Code yang disarankan** (buka menu Extensions `Ctrl+Shift+X`, cari & install):
- `esbenp.prettier-vscode` (Prettier — format otomatis)
- `dbaeumer.vscode-eslint` (ESLint — cek kode)
- `bradlc.vscode-tailwindcss` (Tailwind IntelliSense)
- `convexdev.convex` (Convex — lihat fungsi backend & database dari VS Code)

> ✅ **Cek kelulusan langkah 1:** ketik `node -v` dan `npm -v` di terminal/CMD — keduanya menampilkan versi (mis. `v20.11.0` dan `10.2.4`).

---

## 2. Clone project dari GitHub

Buka terminal (CMD / PowerShell / Git Bash), lalu:

```bash
# pindah ke folder tempat kamu menyimpan project
cd C:\Users\<NamaKamu>\Documents   # contoh untuk Windows (sesuaikan sendiri)

# clone repo
git clone https://github.com/jpXproject/poscashier-dual-monitor.git

# masuk ke folder project
cd poscashier-dual-monitor
```

> ✅ **Cek kelulusan langkah 2:** folder `poscashier-dual-monitor` muncul di lokasi kamu, berisi file seperti `package.json`, `src`, `README.md`.

---

## 3. Install dependency (npm install)

Di dalam folder project, jalankan:

```bash
npm install
```

Ini mengunduh semua library (bisa 1–3 menit tergantung internet). Tunggu sampai selesai tanpa ditutup.

> ⚠️ **Pakai npm, bukan bun** (project ini distandarkan dengan npm — menghindari konflik lock file).

> ✅ **Cek kelulusan langkah 3:** muncul folder `node_modules` dan pesan seperti `added XXX packages`.

---

## 4. Buka project di VS Code

```bash
# dari folder project, ketik:
code .
```

VS Code terbuka dengan project-nya. Klik **Terminal → New Terminal** di VS Code (`Ctrl+~`) — semua perintah berikutnya jalankan di terminal VS Code ini.

> 💡 Saran: buka **File → Auto Save** (atau `Ctrl+Shift+P` → ketik "auto save" → pilih `afterDelay`) supaya tidak lupa menyimpan file.

---

## 5. Hubungkan ke Convex (paling penting)

Project memakai **Convex** sebagai backend + database (di cloud). Ada 2 skenario:

### Opsi A — Pakai akun Convex yang sudah ada (disarankan)

```bash
npx convex dev
```

Lalu ikuti instruksi di terminal:

1. Muncul prompt login → pilih **"Sign in with GitHub"** atau email
2. Login dengan akun yang terhubung ke deployment kamu (`jepanx76@gmail.com` dll.)
3. Pilih **project** yang mau dipakai (mis. `jpxcode`) dan **deployment** (dev/prod)
4. CLI otomatis membuat file `convex.json` dan `src/convex/_generated/`

### Opsi B — Buat project Convex baru

```bash
npx convex dev
```

1. Pilih **"Create a new project"**
2. Beri nama (mis. `pos-demo`)
3. Pilih deployment **dev**
4. Selesai — data baru mulai dari kosong

> ⚠️ **Perintah ini TIDAK berhenti sendiri** — `npx convex dev` berjalan terus (watch mode). Setelah sukses, biarkan terminal ini jalan, atau tekan `Ctrl+C` setelah berhasil lalu gunakan `npx convex dev --once` untuk push manual.

> ✅ **Cek kelulusan langkah 5:** muncul folder `src/convex/_generated/` (berisi `api.d.ts`, `server.d.ts`, dll.) dan file `convex.json` di root.

---

## 6. Buat file .env.local

Di VS Code, buat file baru di root project (sejajar dengan `package.json`) dengan nama:

```
.env.local
```

Isi dengan URL deployment kamu:

```
VITE_CONVEX_URL=https://<nama-deployment>.convex.cloud
```

Ganti `<nama-deployment>` dengan nama deployment kamu. Cara cek:

- Jalankan `npx convex dev` → URL-nya tampil di terminal, atau
- Buka **dashboard.convex.cloud** → deployment kamu → salin URL-nya (format `https://xxx.convex.cloud`, **bukan** `.convex.site`)

> ⚠️ **Jangan pernah commit file ini.** Sudah otomatis dikecualikan oleh `.gitignore` — aman.

> ✅ **Cek kelulusan langkah 6:** file `.env.local` ada dengan baris `VITE_CONVEX_URL=...`.

---

## 7. Set env auth di deployment Convex

Login email OTP butuh 3 variabel **di deployment Convex** (bukan di `.env.local`). Jalankan di terminal VS Code:

```bash
# 1) URL app kamu (saat lokal pakai localhost)
npx convex env set SITE_URL http://localhost:5173

# 2) Kunci JWT — generate dulu, lalu set
npx convex auth generate
```

Perintah `npx convex auth generate` akan menampilkan `JWT_PRIVATE_KEY` dan `JWKS` — salin keduanya, lalu:

```bash
npx convex env set JWT_PRIVATE_KEY <tempel-kunci-nya>
npx convex env set JWKS <tempel-jwks-nya>
```

> 💡 **Setelah di-hosting / production:** ulangi `npx convex env set SITE_URL https://url-asli-app-kamu` dengan URL asli, supaya link di email OTP mengarah ke alamat yang benar.

> ✅ **Cek kelulusan langkah 7:** `npx convex env list` menampilkan `SITE_URL`, `JWT_PRIVATE_KEY`, `JWKS`.

---

## 8. Jalankan app (npm run dev)

Buka **dua terminal** di VS Code:

**Terminal 1 — Convex (biarkan jalan):**
```bash
npx convex dev
```

**Terminal 2 — Frontend:**
```bash
npm run dev
```

Setelah sukses, terminal 2 menampilkan alamat, biasanya:

```
  ➜  Local:   http://localhost:5173/
```

> ✅ **Cek kelulusan langkah 8:** buka `http://localhost:5173/` di browser → landing page tampil tanpa error.

---

## 9. Tes 2 monitor

Buka **dua jendela/tab browser** sekaligus:

| Monitor | URL | Keterangan |
|---|---|---|
| Monitor 1 — **Kasir** | `http://localhost:5173/kasir` | Butuh login (email OTP) |
| Monitor 2 — **Display** | `http://localhost:5173/display` | Publik, tanpa login |

**Alur tes cepat:**
1. Tab 2 → buka `/display` → tampil menu pelanggan
2. Tab 1 → buka `/kasir` → login email OTP (cek inbox email kamu untuk kode)
3. Tab 1 → klik produk → masuk keranjang → **Bayar**
4. Tab 2 → menu/stok berubah otomatis ✅ (realtime Convex + polling 4 detik)

---

## 10. Isi menu contoh

Menu masih kosong? Isi sekali dengan tombol bawaan:

1. Di `/kasir` → tab **"Atur Menu"**
2. Klik **"Muat Menu Contoh"** → otomatis 15 produk dengan kategori (Makanan/Minuman), harga, stok

Atau tambah manual lewat form di tab yang sama.

---

## 11. Perintah harian yang sering dipakai

| Kebutuhan | Perintah |
|---|---|
| Jalankan frontend | `npm run dev` |
| Push backend ke Convex (sekali jalan, lalu selesai) | `npx convex dev --once` |
| Cek tipe TypeScript | `npx tsc -b --noEmit` |
| Build produksi | `npm run build` |
| Cek lint | `npm run lint` |
| Format file | `npm run format` |
| Set env backend | `npx convex env set <NAMA> <nilai>` |
| Lihat env backend | `npx convex env list` |

---

## 12. Mengatasi error umum (zero error checklist)

Jika ada error, cek satu per satu sesuai gejalanya:

| Gejala | Penyebab | Solusi |
|---|---|---|
| `'npm' is not recognized` | Node.js belum terinstall | Install Node.js LTS dari nodejs.org, buka ulang terminal |
| `Could not read from remote repository` (saat clone) | Git belum terinstall / repo tidak ada | Install Git; pastikan URL benar |
| `Module not found: 'react'` | `node_modules` belum lengkap | Hapus `node_modules` + `package-lock.json`, jalankan `npm install` ulang |
| `VITE_CONVEX_URL is missing` / app blank | `.env.local` belum dibuat | Buat `.env.local` sesuai [langkah 6](#6-buat-file-envlocal) |
| `Did you forget to run convex dev?` | Backend belum terhubung | Jalankan `npx convex dev --once`, pastikan `convex.json` ada |
| `401 / auth failed` saat `npx convex dev` | Belum login CLI | Jalankan ulang `npx convex dev` dan login |
| Login email OTP tidak jalan / kode tidak terkirim | Env auth belum di-set | Set `SITE_URL`, `JWT_PRIVATE_KEY`, `JWKS` ([langkah 7](#7-set-env-auth-di-deployment-convex)) |
| Port 5173 sudah dipakai | Ada proses lain | Pakai port lain: `npm run dev -- --port 5174` |
| `Type error` di VS Code | File belum tersimpan / salah ketik | Save (`Ctrl+S`), lalu `npx tsc -b --noEmit` untuk cek |

**Trik zero-error paling ampuh:** jalankan `npx convex dev --once && npx tsc -b --noEmit` setelah mengubah kode backend, dan `npx tsc -b --noEmit` setelah mengubah kode frontend — error apa pun akan muncul lebih dulu di terminal, sebelum tampil di browser.

---

## 13. Push perubahan ke GitHub

Setelah mengubah kode dan ingin menyimpannya ke repo:

```bash
git add -A
git commit -m "deskripsi perubahan"
git push
```

> ⚠️ **Pastikan `.env.local` tidak pernah ter-commit** — sudah dikecualikan `.gitignore`. Kalau suatu saat terlanjur ke-push, segera revoke/regenerate key-nya di dashboard Convex & GitHub.

---

## Ringkasan alur pertama kali

```
1. node -v / npm -v / git --version        (cek persiapan)
2. git clone https://github.com/jpXproject/poscashier-dual-monitor.git
3. npm install
4. code .
5. npx convex dev                           (login + hubungkan)
6. buat .env.local                          (VITE_CONVEX_URL)
7. npx convex auth generate + env set ×3    (auth OTP)
8. npm run dev
9. buka /kasir dan /display                 (2 monitor)
10. Muat Menu Contoh → selesai! 🎉
```

Selamat berkoding! 🚀
