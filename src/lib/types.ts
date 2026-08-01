export type Kategori = "Makanan" | "Minuman";

export interface Produk {
  id: string;
  nama: string;
  kategori: Kategori;
  harga: number;
  stok: number;
  status: "Tampilkan" | "Sembunyikan";
  created_at: string;
}

export interface Transaksi {
  id: string;
  trx_id: string;
  detail: string;
  total_bayar: number;
  created_at: string;
}
