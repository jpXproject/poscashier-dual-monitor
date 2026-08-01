import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Produk } from "@/lib/types";

function normalizeProduk(data: unknown): Produk[] {
  return ((data ?? []) as Array<Record<string, unknown>>).map((r) => ({
    id: String(r.id),
    nama: String(r.nama),
    kategori: r.kategori as Produk["kategori"],
    harga: Number(r.harga),
    stok: Number(r.stok),
    status: r.status as Produk["status"],
    created_at: String(r.created_at),
  }));
}

/** Single fetch used by both reload() and the polling effect. */
async function fetchProduk(
  tampilOnly: boolean,
): Promise<{ data: Produk[] | null; error: string | null }> {
  let query = supabase.from("produk").select("*");
  if (tampilOnly) {
    query = query.eq("status", "Tampilkan");
  }
  const { data, error } = await query.order("nama");
  if (error) {
    // data tetap null agar state produk tidak berubah ke [] (loading/error
    // branch di UI tetap tercapai, dan data lama tidak terhapus saat polling).
    return { data: null, error: error.message };
  }
  // PostgREST mengirim kolom bigint (harga) sebagai string JSON —
  // normalisasi ke number agar perhitungan dan formatRupiah benar.
  return { data: normalizeProduk(data), error: null };
}

/**
 * Load the product menu from Supabase.
 *
 * @param tampilOnly - only fetch products with status "Tampilkan" (menu display).
 * @param refreshKey - bump this value to force a silent refetch (used by the
 *                     display monitor's polling timer).
 */
export function useProduk(tampilOnly = false, refreshKey = 0) {
  const [produk, setProduk] = useState<Produk[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const result = await fetchProduk(tampilOnly);
    setProduk(result.data);
    setError(result.error);
  }, [tampilOnly]);

  useEffect(() => {
    let active = true;
    (async () => {
      const result = await fetchProduk(tampilOnly);
      if (!active) return;
      setProduk(result.data);
      setError(result.error);
    })();
    return () => {
      active = false;
    };
  }, [tampilOnly, refreshKey]);

  return { produk, error, reload };
}
