import { z } from "zod";
import { isValidCalendarDate } from "./schemas";
import { formatTanggal } from "../format";
import type { Transaction } from "@/lib/db/schema";

export type ExportContent = "expense" | "income" | "all";
export type ExportFormat = "xlsx" | "pdf";

/**
 * Menghitung selisih hari inklusif antara from dan to (keduanya YYYY-MM-DD).
 * Contoh: 2026-11-01 s.d. 2026-11-01 = 1 hari.
 */
export function countDaysInclusive(from: string, to: string): number {
  const [y1, m1, d1] = from.split("-").map(Number);
  const [y2, m2, d2] = to.split("-").map(Number);

  const utc1 = Date.UTC(y1, m1 - 1, d1);
  const utc2 = Date.UTC(y2, m2 - 1, d2);

  const diffMs = utc2 - utc1;
  const days = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return days + 1;
}

/**
 * Skema validasi query untuk endpoint GET /api/export.
 * - content: "expense" | "income" | "all" (wajib)
 * - format: "xlsx" | "pdf" (wajib)
 * - from: "YYYY-MM-DD" valid kalender (wajib)
 * - to: "YYYY-MM-DD" valid kalender (wajib)
 * - from <= to
 * - Rentang hari inklusif <= 366 hari
 */
export const exportQuerySchema = z
  .object({
    content: z.enum(["expense", "income", "all"], {
      message: "Parameter 'content' harus salah satu dari: expense, income, all",
    }),
    format: z.enum(["xlsx", "pdf"], {
      message: "Parameter 'format' harus salah satu dari: xlsx, pdf",
    }),
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
  .superRefine((data, ctx) => {
    if (data.from && data.to && isValidCalendarDate(data.from) && isValidCalendarDate(data.to)) {
      if (data.from > data.to) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Tanggal 'from' tidak boleh setelah tanggal 'to'",
          path: ["from"],
        });
        return;
      }

      const days = countDaysInclusive(data.from, data.to);
      if (days > 366) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Rentang tanggal maksimal 366 hari",
          path: ["to"],
        });
      }
    }
  });

export type ExportQueryParams = z.infer<typeof exportQuerySchema>;

/**
 * Menghasilkan nama file export sesuai spesifikasi:
 * smart-finance-<isi>-<dari>_<sampai>.<ekstensi>
 * <isi>: "pengeluaran", "pemasukan", atau "semua"
 */
export function buildExportFileName(
  content: ExportContent,
  from: string,
  to: string,
  format: ExportFormat
): string {
  const isiMap: Record<ExportContent, string> = {
    expense: "pengeluaran",
    income: "pemasukan",
    all: "semua",
  };

  const isi = isiMap[content];
  return `smart-finance-${isi}-${from}_${to}.${format}`;
}

export interface ExportRow {
  date: string; // YYYY-MM-DD
  description: string;
  type: "income" | "expense";
  typeLabel: "Pemasukan" | "Pengeluaran";
  amount: number; // Nilai absolut integer
  sign: "+" | "-";
}

export interface ExportSummary {
  totalIncome?: number;
  totalExpense?: number;
  difference?: number;
}

export interface PreparedExportData {
  title: string;
  periodLabel: string;
  contentLabel: string;
  content: ExportContent;
  rows: ExportRow[];
  summary: ExportSummary;
}

/**
 * Menyusun data transaksi menjadi baris dan ringkasan siap cetak.
 */
export function prepareExportData(
  transactionsList: Pick<Transaction, "transaction_date" | "description" | "type" | "amount">[],
  content: ExportContent,
  from: string,
  to: string
): PreparedExportData {
  const contentLabelMap: Record<ExportContent, string> = {
    expense: "Pengeluaran",
    income: "Pemasukan",
    all: "Semua transaksi",
  };

  const periodLabel = `${formatTanggal(from)} – ${formatTanggal(to)}`;

  let totalIncome = 0;
  let totalExpense = 0;

  const rows: ExportRow[] = transactionsList.map((tx) => {
    const isIncome = tx.type === "income";
    if (isIncome) {
      totalIncome += tx.amount;
    } else {
      totalExpense += tx.amount;
    }

    return {
      date: tx.transaction_date,
      description: tx.description,
      type: tx.type,
      typeLabel: isIncome ? "Pemasukan" : "Pengeluaran",
      amount: tx.amount,
      sign: isIncome ? "+" : "-",
    };
  });

  const summary: ExportSummary = {};
  if (content === "expense") {
    summary.totalExpense = totalExpense;
  } else if (content === "income") {
    summary.totalIncome = totalIncome;
  } else {
    summary.totalIncome = totalIncome;
    summary.totalExpense = totalExpense;
    summary.difference = totalIncome - totalExpense;
  }

  return {
    title: "Laporan Keuangan Smart Finance",
    periodLabel,
    contentLabel: contentLabelMap[content],
    content,
    rows,
    summary,
  };
}
