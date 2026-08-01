import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // Two-monitor POS: product menu (Produk) and sales records (Transaksi).
    // Mirrors the Google Sheets layout from the original Apps Script design:
    //   Produk:    Nama | Kategori | Harga | Stok | Status
    //   Transaksi: Timestamp | ID Transaksi | Detail Pesanan | Total Bayar
    produk: defineTable({
      nama: v.string(), // product name
      kategori: v.union(v.literal("Makanan"), v.literal("Minuman")), // category tag
      harga: v.number(), // price in IDR
      stok: v.number(), // remaining stock
      status: v.string(), // "Tampilkan" (visible on display) | "Sembunyikan"
    }).index("by_status", ["status"]),

    transaksi: defineTable({
      trxId: v.string(), // e.g. TRX-1722400000000
      detail: v.string(), // "Kopi Susu x2 | Nasi Goreng x1"
      totalBayar: v.number(), // grand total in IDR
      createdAt: v.number(), // epoch millis
    }).index("by_createdAt", ["createdAt"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
