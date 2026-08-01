import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const TAMPIL = "Tampilkan";
const SEMBUNYI = "Sembunyikan";

/**
 * List products. Used by the cashier (all rows), the menu display
 * (tampilOnly=true), and the management panel.
 *
 * The `tick` argument is only used by the display monitor to force a
 * silent background refetch every 4 seconds (mirrors the GAS polling design).
 */
export const list = query({
  args: {
    tampilOnly: v.optional(v.boolean()),
    tick: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    void args.tick; // polling signal only — data is already reactive
    const all = await ctx.db.query("produk").collect();
    const filtered = args.tampilOnly
      ? all.filter((p) => p.status === TAMPIL)
      : all;
    // Stable alphabetical order so display cards never jump around.
    return filtered.sort((a, b) => a.nama.localeCompare(b.nama, "id"));
  },
});

const SAMPLE_MENU = [
  { nama: "Kopi Hitam", harga: 18000, stok: 40, status: TAMPIL },
  { nama: "Kopi Susu Gula Aren", harga: 24000, stok: 35, status: TAMPIL },
  { nama: "Es Teh Manis", harga: 8000, stok: 60, status: TAMPIL },
  { nama: "Teh Tarik", harga: 15000, stok: 25, status: TAMPIL },
  { nama: "Nasi Goreng Spesial", harga: 28000, stok: 20, status: TAMPIL },
  { nama: "Mie Goreng Jawa", harga: 24000, stok: 0, status: TAMPIL },
  { nama: "Kentang Goreng", harga: 18000, stok: 30, status: TAMPIL },
  { nama: "Roti Bakar Coklat", harga: 16000, stok: 18, status: TAMPIL },
  { nama: "Pisang Goreng", harga: 12000, stok: 22, status: TAMPIL },
  { nama: "Es Jeruk", harga: 12000, stok: 45, status: TAMPIL },
  { nama: "Coklat Panas", harga: 17000, stok: 15, status: TAMPIL },
  { nama: "Brownies Lumer", harga: 22000, stok: 12, status: TAMPIL },
  { nama: "Air Mineral", harga: 5000, stok: 100, status: TAMPIL },
  { nama: "Jus Alpukat", harga: 20000, stok: 0, status: TAMPIL },
  { nama: "Donat Gula", harga: 10000, stok: 28, status: SEMBUNYI },
];

/** Seed the menu with sample items (only if the Produk table is empty). */
export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Silakan masuk terlebih dahulu untuk mengelola menu.");
    }
    const existing = await ctx.db.query("produk").first();
    if (existing) {
      return { seeded: 0, message: "Menu sudah berisi data." };
    }
    for (const item of SAMPLE_MENU) {
      await ctx.db.insert("produk", item);
    }
    return { seeded: SAMPLE_MENU.length, message: "Menu contoh berhasil dimuat." };
  },
});

/** Insert a new product or patch an existing one (management panel). */
export const save = mutation({
  args: {
    id: v.optional(v.id("produk")),
    nama: v.string(),
    harga: v.number(),
    stok: v.number(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Silakan masuk terlebih dahulu untuk mengelola menu.");
    }
    const nama = args.nama.trim();
    if (!nama) throw new Error("Nama produk tidak boleh kosong.");
    if (args.harga < 0 || args.stok < 0) {
      throw new Error("Harga dan stok tidak boleh negatif.");
    }
    if (args.status !== TAMPIL && args.status !== SEMBUNYI) {
      throw new Error("Status tidak valid.");
    }
    const payload = { nama, harga: args.harga, stok: args.stok, status: args.status };
    if (args.id) {
      await ctx.db.patch(args.id, payload);
      return { id: args.id };
    }
    const id = await ctx.db.insert("produk", payload);
    return { id };
  },
});

/** Delete a product (management panel). */
export const remove = mutation({
  args: { id: v.id("produk") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Silakan masuk terlebih dahulu untuk mengelola menu.");
    }
    await ctx.db.delete(args.id);
    return { ok: true };
  },
});
