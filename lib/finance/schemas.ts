import { z } from "zod";
import { todayWIB } from "./date";
import { DESCRIPTION_MAX_LENGTH } from "./constants";

export const transactionTypeSchema = z.enum(["income", "expense"]);

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Validasi string YYYY-MM-DD kalender yang valid (termasuk kabisat).
 */
export function isValidCalendarDate(dateStr: string): boolean {
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

/**
 * Membuat skema validasi tanggal transaksi dengan injeksi `now` untuk batas WIB.
 */
export function createTransactionDateSchema(now: Date = new Date()) {
  return z
    .string({
      error: "Tanggal transaksi wajib diisi",
    })
    .refine(isValidCalendarDate, {
      message: "Format tanggal harus YYYY-MM-DD yang valid",
    })
    .refine((val) => val <= todayWIB(now), {
      message: "Tanggal tidak boleh melewati hari ini",
    });
}

export const transactionDateSchema = createTransactionDateSchema();

/**
 * Skema nominal amount: bilangan bulat positif Rupiah, dibatasi maksimal Number.MAX_SAFE_INTEGER
 */
export const amountSchema = z
  .number({
    error: "Nominal wajib diisi berupa angka",
  })
  .int("Nominal harus berupa bilangan bulat Rupiah")
  .positive("Nominal harus lebih besar dari 0")
  .max(
    Number.MAX_SAFE_INTEGER,
    `Nominal maksimal ${Number.MAX_SAFE_INTEGER}`
  );

/**
 * Membuat skema validasi transaksi lengkap dengan injeksi `now`.
 */
export function createTransactionInputSchema(now: Date = new Date()) {
  return z.object({
    type: transactionTypeSchema,
    amount: amountSchema,
    description: z
      .string({
        error: "Keterangan/sumber wajib diisi berupa teks",
      })
      .trim()
      .min(1, "Keterangan/sumber tidak boleh kosong")
      .max(
        DESCRIPTION_MAX_LENGTH,
        `Keterangan maksimal ${DESCRIPTION_MAX_LENGTH} karakter`
      ),
    transaction_date: createTransactionDateSchema(now),
  });
}

export const transactionInputSchema = createTransactionInputSchema();

export const updateTransactionInputSchema = transactionInputSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Minimal satu field harus diubah",
  });

export type TransactionInput = z.infer<typeof transactionInputSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionInputSchema>;
