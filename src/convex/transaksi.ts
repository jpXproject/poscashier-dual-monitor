import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * simpanTransaksi — the checkout handler, mirroring the GAS version:
 *  1. Validates stock for every cart item.
 *  2. Deducts stock directly from the Produk table.
 *  3. Generates a unique transaction id: TRX-[TIMESTAMP].
 *  4. Appends a row to the Transaksi table.
 * Returns { success: true, trxId }.
 */
export const simpanTransaksi = mutation({
  args: {
    keranjang: v.array(
      v.object({
        id: v.id("produk"),
        qty: v.number(),
      }),
    ),
    totalBayar: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Silakan masuk terlebih dahulu untuk melakukan transaksi.");
    }
    if (args.keranjang.length === 0) {
      throw new Error("Keranjang masih kosong.");
    }

    const lines: string[] = [];
    for (const item of args.keranjang) {
      const produk = await ctx.db.get(item.id);
      if (!produk) {
        throw new Error("Produk tidak ditemukan. Muat ulang menu.");
      }
      if (item.qty <= 0) {
        throw new Error(`Jumlah tidak valid untuk ${produk.nama}.`);
      }
      if (produk.stok < item.qty) {
        throw new Error(
          `Stok ${produk.nama} tidak mencukupi (tersisa ${produk.stok}).`,
        );
      }
      await ctx.db.patch(item.id, { stok: produk.stok - item.qty });
      lines.push(`${produk.nama} x${item.qty}`);
    }

    const trxId = `TRX-${Date.now()}`;
    await ctx.db.insert("transaksi", {
      trxId,
      detail: lines.join(" | "),
      totalBayar: args.totalBayar,
      createdAt: Date.now(),
    });

    return { success: true, trxId };
  },
});

/** Recent transactions for the cashier history panel. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Silakan masuk terlebih dahulu.");
    }
    return await ctx.db
      .query("transaksi")
      .withIndex("by_createdAt")
      .order("desc")
      .take(50);
  },
});
