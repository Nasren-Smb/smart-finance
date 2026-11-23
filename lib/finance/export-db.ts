import { and, eq, gte, lte, asc } from "drizzle-orm";
import { getDb, type Database } from "@/lib/db";
import { transactions, type Transaction } from "@/lib/db/schema";
import type { ExportQueryParams } from "./export";

/**
 * Mengambil transaksi untuk kebutuhan export:
 * - Wajib menyertakan filter user_id dari pengguna terverifikasi di server.
 * - Filter transaction_date inklusif dari from sampai to.
 * - expense: hanya pengeluaran, income: hanya pemasukan, all: keduanya.
 * - Urutan: tanggal terlama ke terbaru (ASC), lalu created_at terlama ke terbaru (ASC), lalu id (ASC) agar stabil.
 */
export async function getExportTransactions(
  userId: string,
  query: ExportQueryParams,
  txClient?: Database
): Promise<Transaction[]> {
  const db = txClient ?? getDb();

  const conditions = [
    eq(transactions.user_id, userId),
    gte(transactions.transaction_date, query.from),
    lte(transactions.transaction_date, query.to),
  ];

  if (query.content === "expense") {
    conditions.push(eq(transactions.type, "expense"));
  } else if (query.content === "income") {
    conditions.push(eq(transactions.type, "income"));
  }

  const items = await db
    .select()
    .from(transactions)
    .where(and(...conditions))
    .orderBy(
      asc(transactions.transaction_date),
      asc(transactions.created_at),
      asc(transactions.id)
    );

  return items;
}
