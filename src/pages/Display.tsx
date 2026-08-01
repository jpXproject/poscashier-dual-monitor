import { api } from "@/convex/_generated/api";
import { formatRupiah } from "@/lib/utils";
import { useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { Link } from "react-router";

const POLL_MS = 4000;

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

/** Pad a number to two digits. */
function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export default function Display() {
  // Real-time polling: silently refetch the menu every 4 seconds (no reload).
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), POLL_MS);
    return () => clearInterval(id);
  }, []);

  const produk = useQuery(api.produk.list, { tampilOnly: true, tick });
  const now = useClock();

  const inStock = (produk ?? []).filter((p) => p.stok > 0);
  const soldOut = (produk ?? []).filter((p) => p.stok <= 0);

  return (
    <div className="min-h-screen bg-neo-ink text-neo-cream flex flex-col">
      {/* Header */}
      <header className="border-b-[3px] border-neo-cream px-6 py-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-neo-yellow">
            Menu Digital · Two Monitor POS
          </p>
          <h1 className="mt-1 text-5xl font-black uppercase tracking-tight sm:text-6xl">
            Warung Kita
          </h1>
        </div>
        <div className="text-right font-mono font-bold">
          <p className="text-5xl sm:text-6xl">
            {pad(now.getHours())}
            <span className="text-neo-yellow">:</span>
            {pad(now.getMinutes())}
            <span className="text-neo-yellow">:</span>
            {pad(now.getSeconds())}
          </p>
          <p className="mt-1 text-sm uppercase tracking-[0.25em] opacity-70">
            {now.toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
      </header>

      {/* Product grid */}
      <main className="flex-1 px-6 py-8">
        {produk === undefined ? (
          <p className="text-2xl font-bold uppercase animate-pulse">
            Memuat menu…
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">
            {inStock.map((p) => (
              <article
                key={p._id}
                className="bg-neo-paper text-neo-ink border-[3px] border-neo-cream neo-shadow p-5 flex flex-col justify-between gap-4 min-h-44"
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-2xl font-black uppercase leading-tight">
                    {p.nama}
                  </h2>
                  <span className="shrink-0 border-2 border-neo-ink bg-neo-yellow px-2 py-0.5 text-sm font-black">
                    SISA {p.stok}
                  </span>
                </div>
                <div className="flex items-end justify-between gap-2">
                  <p className="text-3xl font-black">{formatRupiah(p.harga)}</p>
                  <span className="text-sm font-bold uppercase tracking-widest opacity-60">
                    Tersedia
                  </span>
                </div>
              </article>
            ))}

            {soldOut.map((p) => (
              <article
                key={p._id}
                className="bg-neo-paper text-neo-ink border-[3px] border-neo-cream neo-shadow p-5 flex flex-col justify-between gap-4 min-h-44 opacity-35 saturate-0 transition-opacity duration-500"
                aria-label={`${p.nama} — habis`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-2xl font-black uppercase leading-tight">
                    {p.nama}
                  </h2>
                  <span className="shrink-0 border-2 border-neo-ink bg-neo-red px-2 py-1 text-sm font-black uppercase text-white -rotate-2">
                    Habis
                  </span>
                </div>
                <div className="flex items-end justify-between gap-2">
                  {/* Price masked when stock reaches 0 */}
                  <p className="text-3xl font-black line-through decoration-4">
                    ••••••
                  </p>
                  <span className="border-2 border-neo-ink bg-neo-ink px-2 py-1 text-base font-black uppercase text-neo-cream">
                    Out of Stock
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Ticker + footer */}
      <footer className="border-t-[3px] border-neo-cream">
        <div className="overflow-hidden border-b-[3px] border-neo-cream bg-neo-yellow text-neo-ink py-2">
          <div className="neo-marquee flex w-max whitespace-nowrap text-lg font-black uppercase tracking-wide">
            <span className="px-8">
              Terima kasih sudah berkunjung · Silakan pesan di kasir · Harga
              sudah termasuk pajak · Enjoy your meal!&nbsp;
            </span>
            <span className="px-8">
              Terima kasih sudah berkunjung · Silakan pesan di kasir · Harga
              sudah termasuk pajak · Enjoy your meal!&nbsp;
            </span>
          </div>
        </div>
        <div className="px-6 py-3 flex items-center justify-between gap-4">
          <p className="text-sm font-bold uppercase tracking-[0.25em]">
            Kasir Anda · Tekan{" "}
            <kbd className="border border-neo-cream px-1.5 py-0.5 font-mono">
              F11
            </kbd>{" "}
            untuk layar penuh
          </p>
          <Link
            to="/"
            className="border-2 border-neo-cream px-3 py-1 text-sm font-bold uppercase tracking-widest neo-press-sm hover:bg-neo-cream hover:text-neo-ink"
          >
            ← Beranda
          </Link>
        </div>
      </footer>
    </div>
  );
}
