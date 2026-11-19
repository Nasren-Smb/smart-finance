import { z } from "zod";

export interface TransactionFilters {
  type?: "income" | "expense";
  from?: string;
  to?: string;
  q?: string;
}

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

function isValidCalendarDate(val: string): boolean {
  if (!dateRegex.test(val)) return false;
  const [yearStr, monthStr, dayStr] = val.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export const filterSchema = z
  .object({
    type: z.enum(["income", "expense"]).optional(),
    from: z
      .string()
      .refine(isValidCalendarDate, { message: "Format tanggal from tidak valid" })
      .optional(),
    to: z
      .string()
      .refine(isValidCalendarDate, { message: "Format tanggal to tidak valid" })
      .optional(),
    q: z
      .string()
      .transform((val) => val.trim())
      .refine((val) => val.length <= 100, {
        message: "q maksimal 100 karakter",
      })
      .transform((val) => (val.length > 0 ? val : undefined))
      .optional(),
  })
  .refine(
    (data) => {
      if (data.from && data.to) {
        return data.from <= data.to;
      }
      return true;
    },
    {
      message: "from tidak boleh setelah to",
      path: ["from"],
    }
  );

/**
 * Mem-parsing URLSearchParams atau record string menjadi filter yang valid.
 * Nilai tidak valid diabaikan (kembali ke undefined / tidak ada).
 * Tidak pernah melempar error.
 */
export function parseFilters(
  searchParams: URLSearchParams | Record<string, string | string[] | undefined>
): TransactionFilters {
  const getParam = (key: string): string | undefined => {
    if (searchParams instanceof URLSearchParams) {
      return searchParams.get(key) ?? undefined;
    }
    const val = searchParams[key];
    if (Array.isArray(val)) return val[0];
    return val ?? undefined;
  };

  const rawType = getParam("type");
  const rawFrom = getParam("from");
  const rawTo = getParam("to");
  const rawQ = getParam("q");

  const rawObj: Record<string, unknown> = {};
  if (rawType !== undefined) rawObj.type = rawType;
  if (rawFrom !== undefined) rawObj.from = rawFrom;
  if (rawTo !== undefined) rawObj.to = rawTo;
  if (rawQ !== undefined) rawObj.q = rawQ;

  // Jalankan safeParse parsial per-field terlebih dulu agar field yang valid tetap selamat
  const result: TransactionFilters = {};

  if (rawType === "income" || rawType === "expense") {
    result.type = rawType;
  }

  if (typeof rawQ === "string") {
    const trimmed = rawQ.trim();
    if (trimmed.length > 0 && trimmed.length <= 100) {
      result.q = trimmed;
    }
  }

  const validFrom = typeof rawFrom === "string" && isValidCalendarDate(rawFrom);
  const validTo = typeof rawTo === "string" && isValidCalendarDate(rawTo);

  if (validFrom && validTo) {
    if (rawFrom <= rawTo) {
      result.from = rawFrom;
      result.to = rawTo;
    }
    // Jika from > to, abaikan keduanya
  } else {
    if (validFrom) result.from = rawFrom;
    if (validTo) result.to = rawTo;
  }

  return result;
}

/**
 * Menghasilkan query string untuk URL halaman dengan urutan parameter stabil.
 * Nilai kosong/undefined tidak ditulis.
 */
export function buildSearchString(filters: TransactionFilters): string {
  const params = new URLSearchParams();

  // Urutan parameter stabil: type, from, to, q
  if (filters.type) params.set("type", filters.type);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.q && filters.q.trim().length > 0) params.set("q", filters.q.trim());

  const str = params.toString();
  return str ? `?${str}` : "";
}

/**
 * Menghasilkan query string untuk endpoint GET /api/transactions.
 * Menyertakan cursor jika ada.
 */
export function buildApiQuery(filters: TransactionFilters, cursor?: string | null): string {
  const params = new URLSearchParams();

  if (filters.type) params.set("type", filters.type);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.q && filters.q.trim().length > 0) params.set("q", filters.q.trim());
  if (cursor) params.set("cursor", cursor);

  const str = params.toString();
  return str ? `?${str}` : "";
}
