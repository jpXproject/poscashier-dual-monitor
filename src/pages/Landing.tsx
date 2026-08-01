import { motion } from "framer-motion";
import {
  ArrowRight,
  MonitorPlay,
  MonitorSmartphone,
  ShoppingCart,
  Zap,
} from "lucide-react";
import { Link } from "react-router";

const MARQUEE_ITEMS = [
  "Kasir Monitor 1",
  "Menu Display Monitor 2",
  "Stok Real-Time",
  "Transaksi Otomatis",
  "ID TRX Unik",
  "Habis Otomatis Disensor",
];

function Marquee() {
  const row = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="overflow-hidden border-y-[3px] border-neo-ink bg-neo-yellow py-3">
      <div className="neo-marquee flex w-max">
        {row.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-6 pr-6 text-lg font-black uppercase tracking-wide"
          >
            {item}
            <span className="inline-block size-3 bg-neo-ink" />
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-neo-cream text-neo-ink"
    >
      {/* NAV */}
      <nav className="sticky top-0 z-20 border-b-[3px] border-neo-ink bg-neo-paper">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="border-[3px] border-neo-ink bg-neo-pink px-2 py-1 text-sm font-black uppercase neo-shadow-sm">
              POS
            </span>
            <span className="text-lg font-black uppercase leading-none">
              Warung Kita
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/display"
              className="border-2 border-neo-ink bg-neo-paper px-3 py-1.5 text-sm font-black uppercase neo-shadow-sm neo-press-sm"
            >
              Menu Display
            </Link>
            <Link
              to="/kasir"
              className="border-2 border-neo-ink bg-neo-ink px-3 py-1.5 text-sm font-black uppercase text-neo-cream neo-shadow-sm neo-press-sm"
            >
              Buka Kasir
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 lg:grid-cols-2 lg:py-20">
        <div>
          <p className="mb-4 inline-block border-2 border-neo-ink bg-neo-turquoise px-2 py-1 text-xs font-black uppercase tracking-widest neo-shadow-sm">
            Dua Monitor - Satu Sistem
          </p>
          <h1 className="text-5xl font-black uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
            Kasir di{" "}
            <span className="inline-block bg-neo-yellow px-2">satu</span>{" "}
            layar, menu di{" "}
            <span className="inline-block bg-neo-blue px-2 text-white">
              layar
            </span>{" "}
            lain.
          </h1>
          <p className="mt-5 max-w-md text-lg font-semibold leading-relaxed opacity-75">
            Point of Sale dua monitor untuk warung dan kafe Anda. Kasir
            mengelola pesanan di Monitor 1, sementara Monitor 2 menampilkan
            menu interaktif yang otomatis menyensor harga saat stok habis.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/kasir"
              className="group flex items-center gap-2 border-[3px] border-neo-ink bg-neo-ink px-6 py-3 text-base font-black uppercase text-neo-cream neo-shadow-lg neo-press"
            >
              Buka Kasir
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/display"
              className="flex items-center gap-2 border-[3px] border-neo-ink bg-neo-paper px-6 py-3 text-base font-black uppercase neo-shadow-lg neo-press"
            >
              <MonitorPlay className="size-5" />
              Lihat Display
            </Link>
          </div>
          <p className="mt-4 text-xs font-bold uppercase tracking-widest opacity-50">
            Tanpa login - langsung buka kasir, display bebas diakses pelanggan
          </p>
        </div>

        {/* Monitor mockups */}
        <div className="relative">
          <div className="absolute -inset-4 neo-stripes opacity-10" />
          <div className="relative grid grid-cols-2 gap-4">
            <div className="border-[3px] border-neo-ink bg-neo-paper neo-shadow-xl">
              <div className="flex items-center justify-between border-b-[3px] border-neo-ink bg-neo-ink px-3 py-2 text-neo-cream">
                <span className="text-xs font-black uppercase">Monitor 1</span>
                <ShoppingCart className="size-4" />
              </div>
              <div className="space-y-2 p-3">
                <div className="flex items-center justify-between border-2 border-neo-ink bg-neo-cream p-2">
                  <span className="text-xs font-black uppercase">Kopi Susu</span>
                  <span className="text-xs font-black">Rp24.000</span>
                </div>
                <div className="flex items-center justify-between border-2 border-neo-ink bg-neo-cream p-2">
                  <span className="text-xs font-black uppercase">Nasi Goreng</span>
                  <span className="text-xs font-black">Rp28.000</span>
                </div>
                <div className="border-2 border-neo-ink bg-neo-green p-2 text-center text-xs font-black uppercase">
                  Total - Rp52.000
                </div>
              </div>
            </div>
            <div className="border-[3px] border-neo-ink bg-neo-ink text-neo-cream neo-shadow-xl">
              <div className="flex items-center justify-between border-b-[3px] border-neo-cream px-3 py-2">
                <span className="text-xs font-black uppercase">
                  Monitor 2
                </span>
                <MonitorSmartphone className="size-4" />
              </div>
              <div className="space-y-2 p-3">
                <div className="border-2 border-neo-cream bg-neo-paper p-2 text-neo-ink">
                  <p className="text-xs font-black uppercase">Es Teh Manis</p>
                  <p className="text-sm font-black">Rp8.000</p>
                </div>
                <div className="border-2 border-neo-cream bg-neo-paper p-2 text-neo-ink opacity-40">
                  <p className="text-xs font-black uppercase">Jus Alpukat</p>
                  <span className="inline-block bg-neo-red px-1 text-[10px] font-black uppercase text-white">
                    Habis
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <Marquee />

      {/* FEATURES */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="mb-8 text-center text-3xl font-black uppercase tracking-tight sm:text-4xl">
          Kenapa dua monitor?
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: ShoppingCart,
              bg: "bg-neo-yellow",
              title: "Monitor 1 - Kasir",
              desc: "Grid produk + keranjang lengket. Validasi stok sebelum checkout, total otomatis, dan transaksi ber-ID unik (TRX-...).",
            },
            {
              icon: MonitorPlay,
              bg: "bg-neo-blue",
              title: "Monitor 2 - Display",
              desc: "Menu board kontras tinggi untuk dibaca dari jarak jauh. Harga besar dan jelas - sampai stoknya habis.",
            },
            {
              icon: Zap,
              bg: "bg-neo-pink",
              title: "Stok Real-Time",
              desc: "Saat kasir checkout, stok terpotong seketika. Display menyensor harga dan menampilkan badge HABIS tanpa refresh.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="border-[3px] border-neo-ink bg-neo-paper p-5 neo-shadow"
            >
              <span
                className={`mb-4 inline-flex size-11 items-center justify-center border-2 border-neo-ink ${f.bg} neo-shadow-sm`}
              >
                <f.icon className="size-6" />
              </span>
              <h3 className="text-lg font-black uppercase">{f.title}</h3>
              <p className="mt-2 text-sm font-semibold leading-relaxed opacity-70">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="border-[3px] border-neo-ink bg-neo-ink p-8 text-center text-neo-cream neo-shadow-xl sm:p-12">
          <h2 className="text-3xl font-black uppercase tracking-tight sm:text-4xl">
            Siap mulai melayani?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm font-semibold uppercase tracking-widest opacity-70">
            Buka Monitor 1 untuk kasir, dan /display pada layar pelanggan.
            Tanpa login, langsung melayani.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              to="/kasir"
              className="flex items-center gap-2 border-[3px] border-neo-cream bg-neo-yellow px-6 py-3 text-base font-black uppercase text-neo-ink neo-shadow neo-press"
            >
              Buka Kasir
              <ArrowRight className="size-5" />
            </Link>
            <Link
              to="/display"
              className="flex items-center gap-2 border-[3px] border-neo-cream bg-neo-paper px-6 py-3 text-base font-black uppercase text-neo-ink neo-shadow neo-press"
            >
              <MonitorPlay className="size-5" />
              Buka Display
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t-[3px] border-neo-ink bg-neo-paper">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 text-xs font-black uppercase tracking-widest opacity-60">
          <span>Warung Kita - Two-Monitor POS</span>
          <span>Monitor 1: /kasir - Monitor 2: /display</span>
        </div>
      </footer>
    </motion.div>
  );
}
