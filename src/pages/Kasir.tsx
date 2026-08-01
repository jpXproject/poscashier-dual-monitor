import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/hooks/use-auth";
import { formatRupiah } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowRight,
  History,
  Loader2,
  LogOut,
  MonitorPlay,
  Plus,
  RefreshCw,
  ShoppingCart,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

type CartItem = { qty: number };

const TABS = [
  { id: "kasir", label: "Kasir", icon: ShoppingCart },
  { id: "menu", label: "Atur Menu", icon: UtensilsCrossed },
  { id: "riwayat", label: "Riwayat", icon: History },
] as const;

type TabId = (typeof TABS)[number]["id"];

const KATEGORI_FILTERS = ["Semua", "Makanan", "Minuman"] as const;
type KategoriFilter = (typeof KATEGORI_FILTERS)[number];
type Kategori = "Makanan" | "Minuman";

function KategoriChip({ kategori }: { kategori: Kategori }) {
  return (
    <span
      className={`mt-1 inline-block border-2 border-neo-ink px-1.5 py-0.5 text-[10px] font-black uppercase leading-none ${
        kategori === "Makanan" ? "bg-neo-orange" : "bg-neo-turquoise"
      }`}
    >
      {kategori}
    </span>
  );
}

function StockBadge({ stok }: { stok: number }) {
  if (stok <= 0) {
    return (
      <Badge className="rounded-none border-2 border-neo-ink bg-neo-red px-2 text-white uppercase">
        Habis
      </Badge>
    );
  }
  if (stok <= 5) {
    return (
      <Badge className="rounded-none border-2 border-neo-ink bg-neo-orange px-2 uppercase text-neo-ink">
        Sisa {stok}
      </Badge>
    );
  }
  return (
    <Badge className="rounded-none border-2 border-neo-ink bg-neo-green px-2 uppercase text-neo-ink">
      Stok {stok}
    </Badge>
  );
}

export default function Kasir() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const produk = useQuery(api.produk.list, {});
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [tab, setTab] = useState<TabId>("kasir");

  // ---- checkout ----
  const simpanTransaksi = useMutation(api.transaksi.simpanTransaksi);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const cartIds = Object.keys(cart);
  const cartRows = useMemo(
    () =>
      cartIds
        .map((id) => {
          const p = (produk ?? []).find((x) => x._id === id);
          return p ? { produk: p, qty: cart[id].qty } : null;
        })
        .filter(
          (x): x is { produk: NonNullable<typeof produk>[number]; qty: number } =>
            x !== null,
        ),
    [cart, cartIds, produk],
  );

  const totalBayar = useMemo(
    () => cartRows.reduce((sum, r) => sum + r.produk.harga * r.qty, 0),
    [cartRows],
  );
  const totalItems = useMemo(
    () => cartRows.reduce((sum, r) => sum + r.qty, 0),
    [cartRows],
  );

  const addToCart = (id: Id<"produk">) => {
    const p = (produk ?? []).find((x) => x._id === id);
    if (!p) return;
    if (p.stok <= 0) {
      toast.error(`Stok ${p.nama} habis - tidak dapat ditambahkan.`);
      return;
    }
    const current = cart[id]?.qty ?? 0;
    if (current + 1 > p.stok) {
      toast.error(`Stok ${p.nama} tidak mencukupi (tersisa ${p.stok}).`);
      return;
    }
    setCart((c) => ({ ...c, [id]: { qty: current + 1 } }));
  };

  const changeQty = (id: Id<"produk">, delta: number) => {
    const p = (produk ?? []).find((x) => x._id === id);
    const current = cart[id]?.qty ?? 0;
    const next = current + delta;
    if (next <= 0) {
      setCart((c) => {
        const { [id]: _removed, ...rest } = c;
        return rest;
      });
      return;
    }
    if (p && next > p.stok) {
      toast.error(`Stok ${p.nama} tidak mencukupi (tersisa ${p.stok}).`);
      return;
    }
    setCart((c) => ({ ...c, [id]: { qty: next } }));
  };

  const clearCart = () => setCart({});

  const handleCheckout = async () => {
    if (cartRows.length === 0) {
      toast.error("Keranjang masih kosong.");
      return;
    }
    setCheckoutLoading(true);
    try {
      const result = await simpanTransaksi({
        keranjang: cartRows.map((r) => ({ id: r.produk._id, qty: r.qty })),
        totalBayar,
      });
      if (result.success) {
        toast.success(
          `Transaksi ${result.trxId} berhasil. Stok otomatis diperbarui.`,
        );
        clearCart();
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Transaksi gagal, coba lagi.";
      toast.error(message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-neo-cream text-neo-ink">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b-[3px] border-neo-ink bg-neo-paper">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="border-[3px] border-neo-ink bg-neo-yellow px-2 py-1 text-sm font-black uppercase neo-shadow-sm">
              Kasir
            </span>
            <div className="hidden sm:block">
              <p className="text-lg font-black uppercase leading-none">
                Warung Kita
              </p>
              <p className="text-xs font-semibold uppercase tracking-widest opacity-60">
                {user?.name ?? "Monitor 1"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="outline"
              className="rounded-none border-2 border-neo-ink bg-neo-paper neo-shadow-sm neo-press-sm uppercase font-bold"
            >
              <Link to="/display" target="_blank">
                <MonitorPlay className="size-4" />
                Buka Display
              </Link>
            </Button>
            <Button
              variant="outline"
              className="rounded-none border-2 border-neo-ink bg-neo-paper neo-shadow-sm neo-press-sm uppercase font-bold"
              onClick={handleSignOut}
            >
              <LogOut className="size-4" />
              Keluar
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 pb-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`border-2 border-neo-ink px-3 py-1.5 text-sm font-black uppercase tracking-wide transition-colors ${
                tab === t.id
                  ? "bg-neo-ink text-neo-cream"
                  : "bg-neo-paper hover:bg-neo-yellow"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <t.icon className="size-4" />
                {t.label}
              </span>
            </button>
          ))}
        </div>
      </header>

      {tab === "kasir" && (
        <KasirView
          produk={produk}
          cart={cart}
          cartRows={cartRows}
          totalBayar={totalBayar}
          totalItems={totalItems}
          addToCart={addToCart}
          changeQty={changeQty}
          clearCart={clearCart}
          handleCheckout={handleCheckout}
          checkoutLoading={checkoutLoading}
        />
      )}
      {tab === "menu" && <MenuManager />}
      {tab === "riwayat" && <RiwayatView />}
    </div>
  );
}

/* ============================ KASIR VIEW ============================ */

type KasirViewProps = {
  produk: ReturnType<typeof useQuery<typeof api.produk.list>>;
  cart: Record<string, CartItem>;
  cartRows: {
    produk: NonNullable<ReturnType<typeof useQuery<typeof api.produk.list>>>[number];
    qty: number;
  }[];
  totalBayar: number;
  totalItems: number;
  addToCart: (id: Id<"produk">) => void;
  changeQty: (id: Id<"produk">, delta: number) => void;
  clearCart: () => void;
  handleCheckout: () => void;
  checkoutLoading: boolean;
};

function KasirView({
  produk,
  cart,
  cartRows,
  totalBayar,
  totalItems,
  addToCart,
  changeQty,
  clearCart,
  handleCheckout,
  checkoutLoading,
}: KasirViewProps) {
  const [filter, setFilter] = useState<KategoriFilter>("Semua");
  const filtered = (
    filter === "Semua"
      ? produk
      : (produk ?? []).filter((p) => p.kategori === filter)
  ) ?? [];

  const countFor = (k: KategoriFilter) =>
    k === "Semua"
      ? produk?.length ?? 0
      : (produk ?? []).filter((p) => p.kategori === k).length;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row">
      {/* LEFT: product grid */}
      <section className="min-w-0 flex-1">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-2xl font-black uppercase">
            Menu{" "}
            <span className="text-sm font-bold opacity-50">
              - tap produk untuk menambah
            </span>
          </h2>
          {produk === undefined && <Loader2 className="size-5 animate-spin" />}
        </div>

        {/* Category filter buttons */}
        {produk !== undefined && (
          <div className="mb-4 flex flex-wrap gap-2">
            {KATEGORI_FILTERS.map((k) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={`border-2 border-neo-ink px-3 py-1.5 text-sm font-black uppercase tracking-wide transition-colors ${
                  filter === k
                    ? "bg-neo-ink text-neo-cream"
                    : "bg-neo-paper hover:bg-neo-yellow"
                }`}
              >
                {k} <span className="opacity-60">({countFor(k)})</span>
              </button>
            ))}
          </div>
        )}

        {produk === undefined ? (
          <p className="text-sm font-semibold uppercase opacity-60 animate-pulse">
            Memuat menu...
          </p>
        ) : filtered.length === 0 ? (
          <div className="border-[3px] border-dashed border-neo-ink bg-neo-paper p-8 text-center">
            <p className="text-lg font-black uppercase">
              Tidak ada produk untuk kategori ini
            </p>
            <p className="mt-1 text-sm font-semibold opacity-60">
              Coba pilih filter lain atau tambahkan produk di tab "Atur Menu".
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => {
              const inCart = (cart[p._id]?.qty ?? 0) > 0;
              return (
                <button
                  key={p._id}
                  onClick={() => addToCart(p._id)}
                  disabled={p.stok <= 0}
                  className={`group flex min-h-36 flex-col items-start justify-between gap-2 border-[3px] border-neo-ink p-3 text-left transition-transform neo-press ${
                    p.stok <= 0
                      ? "bg-neo-paper opacity-40 grayscale cursor-not-allowed"
                      : "bg-neo-paper hover:bg-neo-yellow"
                  } ${inCart ? "bg-neo-turquoise" : ""}`}
                >
                  <div className="flex w-full items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-base font-black uppercase leading-tight">
                        {p.nama}
                      </h3>
                      <KategoriChip kategori={p.kategori} />
                    </div>
                    <StockBadge stok={p.stok} />
                  </div>
                  <div className="flex w-full items-center justify-between gap-2">
                    <p className="text-xl font-black">
                      {formatRupiah(p.harga)}
                    </p>
                    {inCart ? (
                      <span className="border-2 border-neo-ink bg-neo-ink px-2 py-0.5 text-xs font-black uppercase text-neo-cream">
                        {cart[p._id].qty}x
                      </span>
                    ) : (
                      <span className="flex size-7 items-center justify-center border-2 border-neo-ink bg-neo-yellow text-sm font-black transition-transform group-hover:rotate-90">
                        <Plus className="size-4" />
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* RIGHT: sticky cart */}
      <aside className="w-full lg:w-96 lg:shrink-0">
        <div className="sticky top-28 flex max-h-[calc(100vh-8rem)] flex-col border-[3px] border-neo-ink bg-neo-paper neo-shadow-lg">
          <div className="flex items-center justify-between border-b-[3px] border-neo-ink bg-neo-ink px-4 py-3 text-neo-cream">
            <h2 className="text-lg font-black uppercase flex items-center gap-2">
              <ShoppingCart className="size-5" />
              Pesanan
            </h2>
            <span className="border-2 border-neo-cream px-2 py-0.5 text-sm font-black">
              {totalItems} item
            </span>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3">
            {cartRows.length === 0 ? (
              <p className="py-8 text-center text-sm font-semibold uppercase tracking-wide opacity-50">
                Keranjang kosong
                <br />
                <span className="text-xs font-normal normal-case">
                  Pilih produk dari menu di sebelah kiri.
                </span>
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {cartRows.map(({ produk: p, qty }) => (
                  <li
                    key={p._id}
                    className="flex items-center justify-between gap-2 border-2 border-neo-ink bg-neo-cream p-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black uppercase">
                        {p.nama}
                      </p>
                      <p className="text-xs font-bold opacity-60">
                        {formatRupiah(p.harga)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        onClick={() => changeQty(p._id, -1)}
                        className="flex size-7 items-center justify-center border-2 border-neo-ink bg-neo-paper text-base font-black neo-press-sm"
                        aria-label={`Kurangi ${p.nama}`}
                      >
                        -
                      </button>
                      <span className="w-7 text-center text-sm font-black">
                        {qty}
                      </span>
                      <button
                        onClick={() => changeQty(p._id, 1)}
                        className="flex size-7 items-center justify-center border-2 border-neo-ink bg-neo-yellow text-base font-black neo-press-sm"
                        aria-label={`Tambah ${p.nama}`}
                      >
                        +
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t-[3px] border-neo-ink px-4 py-3">
            <div className="mb-1 flex items-center justify-between text-sm font-bold uppercase opacity-60">
              <span>Subtotal</span>
              <span>{formatRupiah(totalBayar)}</span>
            </div>
            <div className="mb-3 flex items-center justify-between border-y-2 border-dashed border-neo-ink py-2">
              <span className="text-lg font-black uppercase">Total</span>
              <span className="text-2xl font-black">
                {formatRupiah(totalBayar)}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="rounded-none border-2 border-neo-ink bg-neo-paper font-black uppercase neo-shadow-sm neo-press-sm"
                onClick={clearCart}
                disabled={cartRows.length === 0 || checkoutLoading}
              >
                <Trash2 className="size-4" />
                Kosongkan
              </Button>
              <Button
                className="flex-1 rounded-none border-2 border-neo-ink bg-neo-green font-black uppercase neo-shadow-sm neo-press"
                onClick={handleCheckout}
                disabled={cartRows.length === 0 || checkoutLoading}
              >
                {checkoutLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    Bayar
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

/* ============================ MENU MANAGER ============================ */

function EmptyMenuNotice() {
  return (
    <div className="border-[3px] border-dashed border-neo-ink bg-neo-paper p-8 text-center">
      <p className="text-lg font-black uppercase">
        Menu masih kosong
      </p>
      <p className="mt-1 text-sm font-semibold opacity-60">
        Muat menu contoh atau tambahkan produk secara manual di tab "Atur Menu".
      </p>
    </div>
  );
}

function MenuManager() {
  const produk = useQuery(api.produk.list, {});
  const seed = useMutation(api.produk.seed);
  const save = useMutation(api.produk.save);
  const remove = useMutation(api.produk.remove);
  const [seeding, setSeeding] = useState(false);
  const [saving, setSaving] = useState(false);

  const [nama, setNama] = useState("");
  const [kategori, setKategori] = useState<Kategori>("Makanan");
  const [harga, setHarga] = useState("");
  const [stok, setStok] = useState("");
  const [status, setStatus] = useState<"Tampilkan" | "Sembunyikan">("Tampilkan");

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const r = await seed();
      toast.success(r.message ?? "Menu contoh dimuat.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memuat contoh.");
    } finally {
      setSeeding(false);
    }
  };

  const handleSave = async () => {
    const hargaNum = Number(harga);
    const stokNum = Number(stok);
    if (!nama.trim()) return toast.error("Nama produk wajib diisi.");
    if (!Number.isFinite(hargaNum) || hargaNum < 0)
      return toast.error("Harga harus angka valid.");
    if (!Number.isFinite(stokNum) || stokNum < 0)
      return toast.error("Stok harus angka valid.");
    setSaving(true);
    try {
      await save({ nama, kategori, harga: hargaNum, stok: stokNum, status });
      toast.success(`Produk "${nama}" disimpan.`);
      setNama("");
      setHarga("");
      setStok("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (
    id: Id<"produk">,
    current: string,
    pNama: string,
  ) => {
    const existing = (produk ?? []).find((x) => x._id === id);
    try {
      await save({
        id,
        nama: pNama,
        kategori: existing?.kategori ?? "Makanan",
        harga: existing?.harga ?? 0,
        stok: existing?.stok ?? 0,
        status: current === "Tampilkan" ? "Sembunyikan" : "Tampilkan",
      });
      toast.success(`Status "${pNama}" diubah.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengubah status.");
    }
  };

  const handleRemove = async (id: Id<"produk">, pNama: string) => {
    try {
      await remove({ id });
      toast.success(`Produk "${pNama}" dihapus.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus.");
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-black uppercase">Atur Menu</h2>
        <Button
          variant="outline"
          className="rounded-none border-2 border-neo-ink bg-neo-paper font-black uppercase neo-shadow-sm neo-press-sm"
          onClick={handleSeed}
          disabled={seeding}
        >
          {seeding ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          Muat Menu Contoh
        </Button>
      </div>

      {/* Add / edit form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        className="mb-6 grid gap-3 border-[3px] border-neo-ink bg-neo-paper p-4 neo-shadow-sm sm:grid-cols-2 lg:grid-cols-6"
      >
        <div className="lg:col-span-2">
          <label className="mb-1 block text-xs font-black uppercase tracking-wide">
            Nama Produk
          </label>
          <Input
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="cth: Es Teh Manis"
            className="rounded-none border-2 border-neo-ink bg-neo-cream"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-black uppercase tracking-wide">
            Kategori
          </label>
          <select
            value={kategori}
            onChange={(e) => setKategori(e.target.value as Kategori)}
            className="h-9 w-full rounded-none border-2 border-neo-ink bg-neo-cream px-2 text-sm font-bold"
          >
            <option value="Makanan">Makanan</option>
            <option value="Minuman">Minuman</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-black uppercase tracking-wide">
            Harga (Rp)
          </label>
          <Input
            value={harga}
            onChange={(e) => setHarga(e.target.value)}
            inputMode="numeric"
            placeholder="15000"
            className="rounded-none border-2 border-neo-ink bg-neo-cream"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-black uppercase tracking-wide">
            Stok
          </label>
          <Input
            value={stok}
            onChange={(e) => setStok(e.target.value)}
            inputMode="numeric"
            placeholder="10"
            className="rounded-none border-2 border-neo-ink bg-neo-cream"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-black uppercase tracking-wide">
            Status
          </label>
          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as "Tampilkan" | "Sembunyikan")
            }
            className="h-9 w-full rounded-none border-2 border-neo-ink bg-neo-cream px-2 text-sm font-bold"
          >
            <option value="Tampilkan">Tampilkan</option>
            <option value="Sembunyikan">Sembunyikan</option>
          </select>
        </div>
        <Button
          type="submit"
          disabled={saving}
          className="rounded-none border-2 border-neo-ink bg-neo-blue font-black uppercase text-white neo-shadow-sm neo-press sm:col-span-2 lg:col-span-6"
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Plus className="size-4" />
          )}
          Tambah Produk
        </Button>
      </form>

      {/* Product list */}
      {produk === undefined ? (
        <p className="text-sm font-semibold uppercase opacity-60 animate-pulse">
          Memuat menu...
        </p>
      ) : produk.length === 0 ? (
        <EmptyMenuNotice />
      ) : (
        <ul className="flex flex-col gap-2">
          {produk.map((p) => (
            <li
              key={p._id}
              className="flex flex-wrap items-center justify-between gap-3 border-2 border-neo-ink bg-neo-paper p-3"
            >
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 font-black uppercase leading-tight">
                  {p.nama}
                  <KategoriChip kategori={p.kategori} />
                  {p.status === "Sembunyikan" && (
                    <span className="text-xs font-bold uppercase opacity-50">
                      (tersembunyi)
                    </span>
                  )}
                </p>
                <p className="text-sm font-bold opacity-60">
                  {formatRupiah(p.harga)} - stok {p.stok}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StockBadge stok={p.stok} />
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-none border-2 border-neo-ink bg-neo-paper font-black uppercase neo-press-sm"
                  onClick={() => toggleStatus(p._id, p.status, p.nama)}
                >
                  {p.status === "Tampilkan" ? "Sembunyikan" : "Tampilkan"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-none border-2 border-neo-ink bg-neo-red font-black uppercase text-white neo-press-sm"
                  onClick={() => handleRemove(p._id, p.nama)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ============================ RIWAYAT VIEW ============================ */

function RiwayatView() {
  const transaksi = useQuery(api.transaksi.list);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h2 className="mb-4 text-2xl font-black uppercase">
        Riwayat Transaksi
      </h2>
      {transaksi === undefined ? (
        <p className="text-sm font-semibold uppercase opacity-60 animate-pulse">
          Memuat riwayat...
        </p>
      ) : transaksi.length === 0 ? (
        <div className="border-[3px] border-dashed border-neo-ink bg-neo-paper p-8 text-center">
          <p className="text-lg font-black uppercase">Belum ada transaksi</p>
          <p className="mt-1 text-sm font-semibold opacity-60">
            Transaksi yang disimpan akan muncul di sini.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {transaksi.map((t) => (
            <li
              key={t._id}
              className="flex flex-wrap items-center justify-between gap-3 border-2 border-neo-ink bg-neo-paper p-3"
            >
              <div className="min-w-0">
                <p className="font-mono text-sm font-black">{t.trxId}</p>
                <p className="truncate text-sm font-semibold opacity-70">
                  {t.detail}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-black">
                  {formatRupiah(t.totalBayar)}
                </span>
                <span className="text-xs font-bold uppercase opacity-50">
                  {new Date(t.createdAt).toLocaleString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
