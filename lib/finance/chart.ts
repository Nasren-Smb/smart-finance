import { z } from "zod";
import { isValidCalendarDate } from "./schemas";
import { weekRange } from "./period";

export type ChartLevel = "day" | "week" | "month" | "year";

export interface ChartBucket {
  from: string;
  to: string;
  income: number;
  expense: number;
}

export interface ChartResponseData {
  level: ChartLevel;
  buckets: ChartBucket[];
}

/**
 * Memformat objek Date UTC ke string "YYYY-MM-DD".
 */
function formatUtcYmd(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Menghasilkan 7 bucket harian (from === to) dari Senin sampai Minggu
 * untuk minggu kalender yang memuat anchor.
 */
export function generateDayBuckets(anchor: string): Array<{ from: string; to: string }> {
  const fullWeek = weekRange(anchor);
  const [fromY, fromM, fromD] = fullWeek.from.split("-").map(Number);

  const buckets: Array<{ from: string; to: string }> = [];
  const current = new Date(Date.UTC(fromY, fromM - 1, fromD));

  for (let i = 0; i < 7; i++) {
    const ymd = formatUtcYmd(current);
    buckets.push({ from: ymd, to: ymd });
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return buckets;
}

/**
 * Menghasilkan bucket mingguan dalam 1 bulan (4 sampai 6 bucket).
 * Bucket minggu yang melewati batas bulan DIPOTONG di batas bulan:
 * - Bucket pertama selalu mulai dari tanggal 1 bulan tersebut.
 * - Bucket perantara berakhir di hari Minggu dan mulai lagi di hari Senin.
 * - Bucket terakhir selalu berakhir di tanggal terakhir bulan tersebut.
 * Jumlah seluruh hari dalam bucket dijamin sama persis dengan total hari bulan tersebut.
 */
export function generateWeekBuckets(anchor: string): Array<{ from: string; to: string }> {
  const [yearStr, monthStr] = anchor.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10); // 1-12

  const lastDay = new Date(Date.UTC(year, month, 0));
  const totalDays = lastDay.getUTCDate();

  const buckets: Array<{ from: string; to: string }> = [];

  let currentStartDay = 1;

  while (currentStartDay <= totalDays) {
    const curDate = new Date(Date.UTC(year, month - 1, currentStartDay));
    // getUTCDay(): 0 = Minggu, 1 = Senin, ..., 6 = Sabtu
    const dayOfWeek = curDate.getUTCDay();
    // Berapa hari tersisa sampai hari Minggu terdekat?
    // Jika Minggu (0), diff = 0 (hari ini adalah akhir minggu)
    // Jika Senin (1), diff = 6 (sampai Minggu)
    const daysToSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;

    const potentialEndDay = currentStartDay + daysToSunday;
    // Potong di batas akhir bulan
    const currentEndDay = Math.min(potentialEndDay, totalDays);

    const fromDate = new Date(Date.UTC(year, month - 1, currentStartDay));
    const toDate = new Date(Date.UTC(year, month - 1, currentEndDay));

    buckets.push({
      from: formatUtcYmd(fromDate),
      to: formatUtcYmd(toDate),
    });

    currentStartDay = currentEndDay + 1;
  }

  return buckets;
}

/**
 * Menghasilkan 12 bucket bulanan untuk tahun kalender yang memuat anchor (Jan s.d. Des).
 */
export function generateMonthBuckets(anchor: string): Array<{ from: string; to: string }> {
  const [yearStr] = anchor.split("-");
  const year = parseInt(yearStr, 10);

  const buckets: Array<{ from: string; to: string }> = [];

  for (let m = 1; m <= 12; m++) {
    const firstDay = new Date(Date.UTC(year, m - 1, 1));
    const lastDay = new Date(Date.UTC(year, m, 0));

    buckets.push({
      from: formatUtcYmd(firstDay),
      to: formatUtcYmd(lastDay),
    });
  }

  return buckets;
}

/**
 * Skema validasi query untuk endpoint GET /api/chart.
 * - level: "day" | "week" | "month" | "year" (wajib)
 * - anchor: "YYYY-MM-DD" (wajib untuk day, week, month; diabaikan untuk year)
 * Tanggal anchor di masa depan diterima.
 */
export const chartQuerySchema = z
  .object({
    level: z.enum(["day", "week", "month", "year"], {
      message: "Parameter 'level' harus salah satu dari: day, week, month, year",
    }),
    anchor: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.level !== "year") {
      if (!data.anchor) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Parameter 'anchor' wajib diisi untuk level '${data.level}'`,
          path: ["anchor"],
        });
        return;
      }

      if (!isValidCalendarDate(data.anchor)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Format tanggal 'anchor' harus YYYY-MM-DD yang valid",
          path: ["anchor"],
        });
      }
    }
  });

export type ChartQueryParams = z.infer<typeof chartQuerySchema>;
