import { z } from "zod";
import { isValidCalendarDate } from "@/lib/finance/schemas";

/**
 * Escape karakter wildcard LIKE SQL (%, _, \) agar pencarian teks bersifat literal.
 */
export function escapeLikeWildcards(text: string): string {
  return text.replace(/([%_\\])/g, "\\$1");
}

export const transactionQuerySchema = z
  .object({
    type: z.enum(["income", "expense"]).optional(),
    from: z
      .string()
      .refine(isValidCalendarDate, {
        message: "Format tanggal 'from' harus YYYY-MM-DD yang valid",
      })
      .optional(),
    to: z
      .string()
      .refine(isValidCalendarDate, {
        message: "Format tanggal 'to' harus YYYY-MM-DD yang valid",
      })
      .optional(),
    q: z
      .string()
      .trim()
      .max(100, "Pencarian maksimal 100 karakter")
      .optional(),
    cursor: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.from && data.to) {
        return data.from <= data.to;
      }
      return true;
    },
    {
      message: "Tanggal 'from' tidak boleh setelah tanggal 'to'",
      path: ["from"],
    }
  );

export type TransactionQueryParams = z.infer<typeof transactionQuerySchema>;

export const uuidParamSchema = z.string().uuid("ID transaksi harus berupa UUID yang valid");
