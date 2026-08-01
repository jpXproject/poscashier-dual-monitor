# POS Cashier — Dual Monitor

Point of Sale dua monitor untuk warung dan kafe. Kasir mengelola pesanan di
Monitor 1 (`/kasir`), sementara Monitor 2 (`/display`) menampilkan menu digital
yang otomatis menyensor harga saat stok habis.

## Tech Stack

- Vite
- TypeScript
- React 19
- React Router v7 (import dari `react-router`)
- Tailwind CSS v4
- Shadcn UI
- Lucide Icons
- Framer Motion
- **Supabase** (Postgres + REST API — pengganti Convex)

## Fitur

- **Monitor 1 – Kasir**: grid produk, keranjang lengket, validasi stok,
  checkout atomik (RPC), atur menu (CRUD + seed), riwayat transaksi.
- **Monitor 2 – Display**: menu board polling 4 detik, harga tersensor otomatis
  saat stok habis, badge "Habis" / "Out of Stock".
- **Tanpa login**: `/kasir` langsung terbuka — tidak ada email OTP, tidak ada
  session, tidak ada halaman auth.

## Setup

Prasyarat: Node.js (v22+) dan npm.

```bash
npm install
npm run dev
```

### Setup Supabase

1. Buat project di <https://supabase.com/dashboard>.
2. Buka **SQL Editor**, lalu jalankan isi `supabase/schema.sql` — ini membuat
   tabel `produk` & `transaksi`, fungsi RPC `checkout()`, dan menu contoh.
3. Salin `.env.example` menjadi `.env.local`, lalu isi kredensial dari
   **Project Settings → API**.

## Environment Variables

| Variable | Deskripsi |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon public key |

> ⚠️ **JANGAN** pernah memasukkan `service_role` key ke `.env.local` — itu
> kunci master yang hanya boleh dipakai server-side dan tidak boleh bocor ke
> bundle browser.

## Data Layer (Supabase)

- `src/lib/supabase.ts` — Supabase client (guard placeholder agar app tetap boot)
- `src/lib/types.ts` — tipe `Produk` & `Transaksi`
- `src/hooks/use-produk.ts` — hook produk dengan polling (`refreshKey`) untuk display
- `supabase/schema.sql` — schema tabel + RPC `checkout()` atomik
  (validasi stok → potong stok → catat transaksi dalam satu transaksi DB).
  Client memanggilnya via `supabase.rpc("checkout", ...)`.

## Routes

| Route | Keterangan |
| --- | --- |
| `/` | Landing page |
| `/kasir` | Monitor 1 — kasir (tanpa login) |
| `/display` | Monitor 2 — menu display untuk pelanggan |
| `/dashboard` | Redirect ke `/kasir` |
| `*` | 404 — halaman tidak ditemukan |

## Frontend Conventions

- Pages di `src/pages`, komponen di `src/components`, primitives Shadcn di `src/components/ui`.
- Konfigurasi routing di `src/main.tsx`.
- Gunakan `cursor-pointer` pada elemen yang bisa diklik.
- Selalu buat aplikasi **mobile responsive**.
- Gunakan Sonner (`toast`) untuk feedback pengguna.
- Gunakan Dialog (bukan halaman baru) untuk konten besar, dengan scroll.
- Sesuaikan tema/desain (warna di `src/index.css`, komponen ui di `src/components/ui`).
