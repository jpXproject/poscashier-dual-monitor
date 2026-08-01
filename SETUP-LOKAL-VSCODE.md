# Panduan Setup Lokal — Two-Monitor POS (Kasir + Display)

Panduan berurutan untuk menjalankan project ini di **PC lokal** memakai **VS Code**, dirancang agar **zero error**. Ikuti langkahnya satu per satu, jangan dilewati.

> Project: **1 web app, 1 database Supabase (cloud), 2 monitor** (`/kasir` untuk admin, `/display` untuk pelanggan). **Tanpa login** — kasir langsung terbuka.

---

## Daftar Isi

1. [Persiapan (install software)](#1-persiapan-install-software)
2. [Clone project dari GitHub](#2-clone-project-dari-github)
3. [Install dependency (npm install)](#3-install-dependency-npm-install)
4. [Buka project di VS Code](#4-buka-project-di-vs-code)
5. [Buat project Supabase (paling penting)](#5-buat-project-supabase-paling-penting)
6. [Jalankan schema.sql di SQL Editor](#6-jalankan-schemasql-di-sql-editor)
7. [Buat file .env.local](#7-buat-file-envlocal)
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
| **Node.js v20+** (rekomendasi v22 LTS) | Menjalankan project | `node -v` |
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

> ✅ **Cek kelulusan langkah 1:** ketik `node -v` dan `npm -v` di terminal/CMD — keduanya menampilkan versi (mis. `v22.12.0` dan `10.9.0`).

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

## 5. Buat project Supabase (paling penting)

Project memakai **Supabase** sebagai database (cloud, gratis). Buat project dulu:

1. Buka https://supabase.com → klik **Start your project** → login (bisa pakai GitHub)
2. Klik **New Project**
3. Isi:
   - **Name**: mis. `pos-dual-monitor`
   - **Database Password**: buat password kuat, **simpan baik-baik** (dipakai kalau akses langsung ke DB)
   - **Region**: pilih yang terdekat (mis. `Singapore`)
4. Klik **Create new project** → tunggu ±1–2 menit sampai selesai
5. Buka **Project Settings → API** — catat 2 nilai ini (dipakai di langkah 7):
   - **Project URL** → contoh `https://xxxx.supabase.co`
   - **anon public** → string panjang `eyJhbGciOi...`

> ⚠️ **Jangan pernah menyebarkan `service_role` key** (kolom di bawah anon public). Itu kunci master yang hanya boleh dipakai server-side dan **tidak boleh** masuk ke `.env.local` atau ter-commit.

> ✅ **Cek kelulusan langkah 5:** kamu punya `Project URL` dan `anon public` key dari halaman Settings → API.

---

## 6. Jalankan schema.sql di SQL Editor

Buat tabel database lewat SQL Editor (sekali saja):

1. Di dashboard Supabase, klik **SQL Editor** (menu kiri)
2. Klik **New query**
3. Buka file `supabase/schema.sql` di project VS Code, **salin seluruh isinya**, tempel ke editor
4. Klik **Run** (atau `Ctrl+Enter`)

File ini membuat:
- Tabel **`produk`** (nama, kategori, harga, stok, status) — plus 15 menu contoh
- Tabel **`transaksi`** (trx_id, detail, total_bayar, created_at)
- Fungsi **RPC `checkout()`** — atomik: validasi stok → potong stok → catat transaksi
- RLS dimatikan (aplikasi tanpa login — baca/tulis via anon key)

> 💡 **Jalankan ulang fungsi `checkout` saja** cukup aman kapan saja (menggunakan `create or replace function`) — tidak merusak data.

> ✅ **Cek kelulusan langkah 6:** muncul pesan `Success. No rows returned` dan tabel `produk` berisi 15 baris menu contoh di **Table Editor**.

---

## 7. Buat file .env.local

Di VS Code, buat file baru di root project (sejajar dengan `package.json`) dengan nama:

```
.env.local
```

Isi dengan kredensial dari langkah 5:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

Ganti nilai dengan Project URL & anon public key milikmu. Contoh `.env.example` sudah disediakan sebagai template.

> ⚠️ **Jangan pernah commit file ini.** Sudah otomatis dikecualikan oleh `.gitignore` — aman.
> ⚠️ **Hanya `anon public` key** yang dipakai di sini — jangan masukkan `service_role`.

> ✅ **Cek kelulusan langkah 7:** file `.env.local` ada dengan 2 baris `VITE_SUPABASE_URL=...` dan `VITE_SUPABASE_ANON_KEY=...`.

---

## 8. Jalankan app (npm run dev)

Cukup **satu terminal** (backend Supabase sudah di cloud):

```bash
npm run dev
```

Setelah sukses, terminal menampilkan alamat, biasanya:

```
  ➜  Local:   http://localhost:5173/
```

> ✅ **Cek kelulusan langkah 8:** buka `http://localhost:5173/` di browser → landing page tampil tanpa error.

---

## 9. Tes 2 monitor

Buka **dua jendela/tab browser** sekaligus:

| Monitor | URL | Keterangan |
|---|---|---|
| Monitor 1 — **Kasir** | `http://localhost:5173/kasir` | Langsung terbuka, **tanpa login** |
| Monitor 2 — **Display** | `http://localhost:5173/display` | Publik, untuk pelanggan |

**Alur tes cepat:**
1. Tab 2 → buka `/display` → tampil menu pelanggan
2. Tab 1 → buka `/kasir` → langsung masuk, klik produk → masuk keranjang → **Bayar**
3. Tab 2 → menu/stok berubah otomatis ✅ (polling 4 detik)

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
| Cek tipe TypeScript | `npx tsc -b --noEmit` |
| Build produksi | `npm run build` |
| Cek lint | `npm run lint` |
| Format file | `npm run format` |
| Cek data di tabel | Supabase Dashboard → **Table Editor** (produk / transaksi) |
| Tes RPC checkout manual | Supabase Dashboard → **SQL Editor** → `select public.checkout('[{"id":"<uuid>","qty":1}]', 10000);` — ⚠️ ini membuat transaksi tes nyata (potong stok + catat di tabel `transaksi`), cek Table Editor setelahnya |

---

## 12. Mengatasi error umum (zero error checklist)

Jika ada error, cek satu per satu sesuai gejalanya:

| Gejala | Penyebab | Solusi |
|---|---|---|
| `'npm' is not recognized` | Node.js belum terinstall | Install Node.js LTS dari nodejs.org, buka ulang terminal |
| `Could not read from remote repository` (saat clone) | Git belum terinstall / repo tidak ada | Install Git; pastikan URL benar |
| `Module not found: 'react'` | `node_modules` belum lengkap | Hapus `node_modules` + `package-lock.json`, jalankan `npm install` ulang |
| App blank / console warning `[supabase] ... belum di-set` | `.env.local` belum dibuat / kosong | Buat `.env.local` sesuai [langkah 7](#7-buat-file-envlocal) |
| `Failed to fetch` / "Gagal memuat menu" di Kasir/Display | Project URL atau anon key salah | Cek kembali kedua nilai di [langkah 5](#5-buat-project-supabase-paling-penting) & 7 |
| `relation "public.produk" does not exist` | schema.sql belum dijalankan | Jalankan `supabase/schema.sql` di SQL Editor ([langkah 6](#6-jalankan-schemasql-di-sql-editor)) |
| `function public.checkout(...) does not exist` | Fungsi RPC belum dibuat | Jalankan ulang bagian `create or replace function` dari schema.sql |
| `Stok ... tidak mencukupi` saat Bayar | Stok habis di database | Tambah stok di tab "Atur Menu" atau lewat Table Editor |
| Port 5173 sudah dipakai | Ada proses lain | Pakai port lain: `npm run dev -- --port 5174` |
| `Type error` di VS Code | File belum tersimpan / salah ketik | Save (`Ctrl+S`), lalu `npx tsc -b --noEmit` untuk cek |

**Trik zero-error paling ampuh:** jalankan `npx tsc -b --noEmit && npm run lint` setelah mengubah kode — error apa pun akan muncul lebih dulu di terminal, sebelum tampil di browser.

---

## 13. Push perubahan ke GitHub

Setelah mengubah kode dan ingin menyimpannya ke repo:

```bash
git add -A
git commit -m "deskripsi perubahan"
git push
```

> ⚠️ **Pastikan `.env.local` tidak pernah ter-commit** — sudah dikecualikan `.gitignore`. Kalau suatu saat terlanjur ke-push, segera revoke/regenerate anon key di dashboard Supabase & hapus dari riwayat git.

---

## Ringkasan alur pertama kali

```
1. node -v / npm -v / git --version        (cek persiapan)
2. git clone https://github.com/jpXproject/poscashier-dual-monitor.git
3. npm install
4. code .
5. buat project Supabase                  (Project URL + anon key)
6. jalankan supabase/schema.sql di SQL Editor
7. buat .env.local                        (VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY)
8. npm run dev
9. buka /kasir dan /display               (2 monitor, tanpa login)
10. Muat Menu Contoh → selesai! 🎉
```

Selamat berkoding! 🚀
