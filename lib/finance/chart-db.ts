import { sql, eq, and, asc } from "drizzle-orm";
import { getDb, type Database } from "@/lib/db";
import { transactions } from "@/lib/db/schema";
import {
  type ChartQueryParams,
  type ChartBucket,
  type ChartResponseData,
  generateDayBuckets,
  generateWeekBuckets,
  generateMonthBuckets,
} from "./chart";

/**
 * Mengambil data agregasi untuk chart langsung di database (SUM dengan GROUP BY).
 * WAJIB menyertakan filter user_id dari pengguna terverifikasi di server.
 */
export async function getChartData(
  userId: string,
  query: ChartQueryParams,
  txClient?: Database
): Promise<ChartResponseData> {
  const db = txClient ?? getDb();

  // LEVEL: YEAR
  // Memuat hanya tahun yang punya data, urut naik.
  // Jika tidak ada data, buckets kosong [].
  if (query.level === "year") {
    const rows = await db
      .select({
        yearStr: sql<string>`to_char(${transactions.transaction_date}, 'YYYY')`,
        income: sql<string>`coalesce(
          sum(case when ${transactions.type} = 'income' then ${transactions.amount} else 0 end),
          0
        )`,
        expense: sql<string>`coalesce(
          sum(case when ${transactions.type} = 'expense' then ${transactions.amount} else 0 end),
          0
        )`,
      })
      .from(transactions)
      .where(eq(transactions.user_id, userId))
      .groupBy(sql`to_char(${transactions.transaction_date}, 'YYYY')`)
      .orderBy(asc(sql`to_char(${transactions.transaction_date}, 'YYYY')`));

    const buckets: ChartBucket[] = rows.map((r) => {
      const year = r.yearStr;
      return {
        from: `${year}-01-01`,
        to: `${year}-12-31`,
        income: Number(r.income),
        expense: Number(r.expense),
      };
    });

    return {
      level: "year",
      buckets,
    };
  }

  // LEVEL: DAY, WEEK, MONTH
  // Hasilkan template fixed buckets untuk level tersebut
  const anchor = query.anchor!;
  let bucketTemplates: Array<{ from: string; to: string }> = [];

  if (query.level === "day") {
    bucketTemplates = generateDayBuckets(anchor);
  } else if (query.level === "week") {
    bucketTemplates = generateWeekBuckets(anchor);
  } else if (query.level === "month") {
    bucketTemplates = generateMonthBuckets(anchor);
  }

  const rangeFrom = bucketTemplates[0].from;
  const rangeTo = bucketTemplates[bucketTemplates.length - 1].to;

  // Single query agregasi per tanggal di rentang rangeFrom s.d. rangeTo
  const dailyRows = await db
    .select({
      txDate: sql<string>`to_char(${transactions.transaction_date}, 'YYYY-MM-DD')`,
      income: sql<string>`coalesce(
        sum(case when ${transactions.type} = 'income' then ${transactions.amount} else 0 end),
        0
      )`,
      expense: sql<string>`coalesce(
        sum(case when ${transactions.type} = 'expense' then ${transactions.amount} else 0 end),
        0
      )`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.user_id, userId),
        sql`${transactions.transaction_date} >= ${rangeFrom}`,
        sql`${transactions.transaction_date} <= ${rangeTo}`
      )
    )
    .groupBy(sql`to_char(${transactions.transaction_date}, 'YYYY-MM-DD')`);

  // Map transaksi harian ke lookup table: date -> { income, expense }
  const dateTotals = new Map<string, { income: number; expense: number }>();
  for (const row of dailyRows) {
    dateTotals.set(row.txDate, {
      income: Number(row.income),
      expense: Number(row.expense),
    });
  }

  // Agregasikan ke bucket template (inklusif from s.d. to)
  const buckets: ChartBucket[] = bucketTemplates.map((template) => {
    let income = 0;
    let expense = 0;

    for (const [dateStr, totals] of dateTotals.entries()) {
      if (dateStr >= template.from && dateStr <= template.to) {
        income += totals.income;
        expense += totals.expense;
      }
    }

    return {
      from: template.from,
      to: template.to,
      income,
      expense,
    };
  });

  return {
    level: query.level,
    buckets,
  };
}
