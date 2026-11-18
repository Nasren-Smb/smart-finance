import { sql, eq } from "drizzle-orm";
import { getDb, type Database } from "@/lib/db";
import { transactions } from "@/lib/db/schema";

/**
 * Menghitung saldo pengguna langsung di database menggunakan SUM.
 * Saldo = total pemasukan - total pengeluaran untuk seluruh riwayat user_id.
 * WAJIB menyertakan filter user_id dari pengguna terverifikasi.
 */
export async function getBalance(
  userId: string,
  txClient?: Database
): Promise<number> {
  const db = txClient ?? getDb();

  const result = await db
    .select({
      total: sql<string>`coalesce(
        sum(
          case
            when ${transactions.type} = 'income' then ${transactions.amount}
            when ${transactions.type} = 'expense' then -${transactions.amount}
            else 0
          end
        ),
        0
      )`,
    })
    .from(transactions)
    .where(eq(transactions.user_id, userId));

  const totalStr = result[0]?.total ?? "0";
  return Number(totalStr);
}

/**
 * Helper untuk menjalankan operasi di dalam transaksi database dengan advisory lock
 * per pengguna (pg_advisory_xact_lock) agar race condition dua permintaan bersamaan
 * tidak melewati batas saldo (mencegah saldo menjadi negatif).
 */
export async function runWithUserLock<T>(
  userId: string,
  callback: (tx: Database) => Promise<T>
): Promise<T> {
  const db = getDb();

  return await db.transaction(async (tx) => {
    // Gunakan hashtext untuk mengonversi UUID string menjadi 32-bit int hash untuk advisory lock
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${userId}))`);
    return await callback(tx as unknown as Database);
  });
}
