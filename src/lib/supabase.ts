import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY belum di-set di .env.local. " +
      "Buka https://supabase.com/dashboard -> Project Settings -> API untuk mengambilnya.",
  );
}

// Gunakan placeholder agar app tetap boot sebelum kredensial diisi
// (query apa pun akan gagal dengan pesan yang jelas, bukan crash di import).
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key",
);
