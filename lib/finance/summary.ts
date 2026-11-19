import { z } from "zod";
import { sql, eq, and } from "drizzle-orm";
import { getDb, type Database } from "@/lib/db";
import { transactions } from "@/lib/db/schema";
import { isValidCalendarDate } from "./schemas";

/**
 * Skema validasi query untuk endpoint GET /api/summary.
 * Parameter from dan to keduanya wajib berupa string YYYY-MM-DD yang valid secara kalender,
 * tanggal di masa depan diperbolehkan (misal untuk periode minggu ini atau bulan ini),
 * dan from tidak boleh setelah to.
 */
export const summaryQuerySchema = z
  .object({
    from: z
      .string({
        message: "Parameter 'from' wajib diisi",
      })
      .refine(isValidCalendarDate, {
        message: "Format tanggal 'from' harus YYYY-MM-DD yang valid",
      }),
    to: z
      .string({
        message: "Parameter 'to' wajib diisi",
      })
      .refine(isValidCalendarDate, {
        message: "Format tanggal 'to' harus YYYY-MM-DD yang valid",
      }),
  })
  .refine(
    (data) => data.from <= data.to,
    {
      message: "Tanggal 'from' tidak boleh setelah tanggal 'to'",
      path: ["from"],
    }
  );

export type SummaryQueryParams = z.infer<typeof summaryQuerySchema>;

export interface PeriodSummary {
  totalIncome: number;
  totalExpense: number;
  difference: number;
}

/**
 * Menghitung total pemasukan, total pengeluaran, dan selisih periode langsung di database (SUM).
 * WAJIB menyertakan filter user_id dari pengguna terverifikasi di server.
 * Periode inklusif berdasarkan transaction_date.
 * Periode tanpa data mengembalikan 0.
 * Selisih (difference) = totalIncome - totalExpense (boleh negatif).
 */
export async function getPeriodSummary(
  userId: string,
  query: SummaryQueryParams,
  txClient?: Database
): Promise<PeriodSummary> {
  const db = txClient ?? getDb();

  const [row] = await db
    .select({
      totalIncome: sql<string>`coalesce(
        sum(
          case
            when ${transactions.type} = 'income' then ${transactions.amount}
            else 0
          end
        ),
        0
      )`,
      totalExpense: sql<string>`coalesce(
        sum(
          case
            when ${transactions.type} = 'expense' then ${transactions.amount}
            else 0
          end
        ),
        0
      )`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.user_id, userId),
        sql`${transactions.transaction_date} >= ${query.from}`,
        sql`${transactions.transaction_date} <= ${query.to}`
      )
    );

  const totalIncome = Number(row?.totalIncome ?? "0");
  const totalExpense = Number(row?.totalExpense ?? "0");
  const difference = totalIncome - totalExpense;

  return {
    totalIncome,
    totalExpense,
    difference,
  };
}
