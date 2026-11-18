import { z } from "zod";

export const transactionTypeSchema = z.enum(["income", "expense"]);

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Validasi string YYYY-MM-DD kalender yang valid (termasuk kabisat).
 */
function isValidCalendarDate(dateStr: string): boolean {
  if (!dateRegex.test(dateStr)) return false;
  const [yearStr, monthStr, dayStr] = dateStr.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  const dateObj = new Date(Date.UTC(year, month - 1, day));
  return (
    dateObj.getUTCFullYear() === year &&
    dateObj.getUTCMonth() === month - 1 &&
    dateObj.getUTCDate() === day
  );
}

export const transactionDateSchema = z
  .string({
    error: "Tanggal transaksi wajib diisi",
  })
  // TODO: Kebijakan apakah tanggal transaksi di masa depan diizinkan belum diputuskan oleh developer. Saat ini diterima selama format kalender valid.
  .refine(isValidCalendarDate, {
    message: "Format tanggal harus YYYY-MM-DD yang valid",
  });

export const transactionInputSchema = z.object({
  type: transactionTypeSchema,
  amount: z
    .number({
      error: "Nominal wajib diisi berupa angka",
    })
    .int("Nominal harus berupa bilangan bulat Rupiah")
    .positive("Nominal harus lebih besar dari 0"),
  description: z
    .string({
      error: "Keterangan/sumber wajib diisi berupa teks",
    })
    .trim()
    .min(1, "Keterangan/sumber tidak boleh kosong"),
  transaction_date: transactionDateSchema,
});

export const updateTransactionInputSchema = transactionInputSchema.partial();

export type TransactionInput = z.infer<typeof transactionInputSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionInputSchema>;
