-- ============================================================
-- Two-Monitor POS - Supabase schema
-- Jalankan file ini di: Supabase Dashboard -> SQL Editor -> New query
-- (Table: produk + transaksi, RPC checkout, RLS dimatikan karena
--  aplikasi ini TANPA LOGIN - anon key membaca/menulis data POS)
-- ============================================================

-- ---------- Produk (menu) ----------
create table if not exists public.produk (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  kategori text not null check (kategori in ('Makanan', 'Minuman')),
  harga bigint not null default 0,
  stok integer not null default 0,
  status text not null default 'Tampilkan'
    check (status in ('Tampilkan', 'Sembunyikan')),
  created_at timestamptz not null default now()
);

create index if not exists produk_status_idx on public.produk (status);
create index if not exists produk_nama_idx on public.produk (nama);

-- ---------- Transaksi (penjualan) ----------
create table if not exists public.transaksi (
  id uuid primary key default gen_random_uuid(),
  trx_id text not null unique,
  detail text not null,
  total_bayar bigint not null,
  created_at timestamptz not null default now()
);

create index if not exists transaksi_created_at_idx on public.transaksi (created_at desc);

-- ---------- RLS: aplikasi tanpa login, matikan RLS ----------
alter table public.produk disable row level security;
alter table public.transaksi disable row level security;

-- ---------- RPC checkout (atomik: validasi stok -> potong stok -> catat transaksi) ----------
create or replace function public.checkout(p_keranjang jsonb, p_total bigint)
returns jsonb
language plpgsql
as $$
declare
  v_item jsonb;
  v_produk record;
  v_lines text := '';
  v_trx_id text;
begin
  if p_keranjang is null or jsonb_array_length(p_keranjang) = 0 then
    raise exception 'Keranjang masih kosong.';
  end if;

  for v_item in select jsonb_array_elements(p_keranjang)
  loop
    select * into v_produk from public.produk where id = (v_item->>'id')::uuid;
    if not found then
      raise exception 'Produk tidak ditemukan. Muat ulang menu.';
    end if;
    if (v_item->>'qty')::int <= 0 then
      raise exception 'Jumlah tidak valid untuk %.', v_produk.nama;
    end if;
    if v_produk.stok < (v_item->>'qty')::int then
      raise exception 'Stok % tidak mencukupi (tersisa %).', v_produk.nama, v_produk.stok;
    end if;

    update public.produk
       set stok = stok - (v_item->>'qty')::int
     where id = v_produk.id;

    v_lines := v_lines || v_produk.nama || ' x' || (v_item->>'qty')::text || ' | ';
  end loop;

  -- suffix acak 4 karakter mencegah tabrakan trx_id saat checkout bersamaan
  v_trx_id := 'TRX-' || floor(extract(epoch from now()) * 1000)::bigint::text
              || '-' || substr(md5(random()::text), 1, 4);
  insert into public.transaksi (trx_id, detail, total_bayar)
  values (v_trx_id, trim(trailing ' | ' from v_lines), p_total);

  return jsonb_build_object('success', true, 'trxId', v_trx_id);
end;
$$;

-- ---------- Menu contoh (opsional, isi data awal) ----------
insert into public.produk (nama, kategori, harga, stok, status)
select v.nama, v.kategori, v.harga, v.stok, v.status
from (values
  ('Kopi Hitam', 'Minuman', 18000, 40, 'Tampilkan'),
  ('Kopi Susu Gula Aren', 'Minuman', 24000, 35, 'Tampilkan'),
  ('Es Teh Manis', 'Minuman', 8000, 60, 'Tampilkan'),
  ('Teh Tarik', 'Minuman', 15000, 25, 'Tampilkan'),
  ('Nasi Goreng Spesial', 'Makanan', 28000, 20, 'Tampilkan'),
  ('Mie Goreng Jawa', 'Makanan', 24000, 0, 'Tampilkan'),
  ('Kentang Goreng', 'Makanan', 18000, 30, 'Tampilkan'),
  ('Roti Bakar Coklat', 'Makanan', 16000, 18, 'Tampilkan'),
  ('Pisang Goreng', 'Makanan', 12000, 22, 'Tampilkan'),
  ('Es Jeruk', 'Minuman', 12000, 45, 'Tampilkan'),
  ('Coklat Panas', 'Minuman', 17000, 15, 'Tampilkan'),
  ('Brownies Lumer', 'Makanan', 22000, 12, 'Tampilkan'),
  ('Air Mineral', 'Minuman', 5000, 100, 'Tampilkan'),
  ('Jus Alpukat', 'Minuman', 20000, 0, 'Tampilkan'),
  ('Donat Gula', 'Makanan', 10000, 28, 'Sembunyikan')
) as v(nama, kategori, harga, stok, status)
where not exists (select 1 from public.produk);
