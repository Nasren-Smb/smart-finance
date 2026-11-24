import { countDaysInclusive } from "./export";

export const MONTH_OPTIONS = [
  { value: 1, label: "Januari" },
  { value: 2, label: "Februari" },
  { value: 3, label: "Maret" },
  { value: 4, label: "April" },
  { value: 5, label: "Mei" },
  { value: 6, label: "Juni" },
  { value: 7, label: "Juli" },
  { value: 8, label: "Agustus" },
  { value: 9, label: "September" },
  { value: 10, label: "Oktober" },
  { value: 11, label: "November" },
  { value: 12, label: "Desember" },
];

/**
 * Menghasilkan daftar tahun (tahun ini mundur 5 tahun -> total 6 tahun).
 * Contoh: 2026 -> [2026, 2025, 2024, 2023, 2022, 2021]
 */
export function getAvailableYears(currentYear: number): number[] {
  const years: number[] = [];
  for (let i = 0; i < 6; i++) {
    years.push(currentYear - i);
  }
  return years;
}

/**
 * Menghasilkan daftar bulan yang tersedia:
 * Jika selectedYear === currentYear, bulan yang lebih besar dari currentMonth tidak tersedia.
 * Jika selectedYear < currentYear, semua 12 bulan tersedia.
 */
export function getAvailableMonths(
  selectedYear: number,
  currentYear: number,
  currentMonth: number
): typeof MONTH_OPTIONS {
  if (selectedYear < currentYear) {
    return MONTH_OPTIONS;
  }
  return MONTH_OPTIONS.filter((m) => m.value <= currentMonth);
}

/**
 * Mengubah tahun dan bulan menjadi rentang tanggal YYYY-MM-DD:
 * from = tanggal 1 bulan itu
 * to = tanggal terakhir bulan itu (memperhatikan kabisat untuk Februari)
 */
export function getMonthDateRange(
  year: number,
  month: number
): { from: string; to: string } {
  const yearStr = String(year);
  const monthStr = String(month).padStart(2, "0");
  const from = `${yearStr}-${monthStr}-01`;

  // Hari terakhir bulan: new Date(Date.UTC(year, month, 0)) mengembalikan hari terakhir dari month (1-indexed)
  const lastDate = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const lastDayStr = String(lastDate).padStart(2, "0");
  const to = `${yearStr}-${monthStr}-${lastDayStr}`;

  return { from, to };
}

/**
 * Mengekstrak nama file dari header Content-Disposition.
 * Jika tidak ditemukan / tidak ada, mengembalikan fallbackFileName.
 * Contoh header: 'attachment; filename="smart-finance-semua-2026-11-01_2026-11-30.xlsx"'
 */
export function parseContentDispositionFileName(
  headerValue: string | null | undefined,
  fallbackFileName: string
): string {
  if (!headerValue) return fallbackFileName;

  // Coba match filename="name" atau filename=name
  const match = headerValue.match(/filename=["']?([^"';\n]+)["']?/i);
  if (match && match[1]) {
    return match[1].trim();
  }

  return fallbackFileName;
}

export interface DateRangeValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validasi rentang tanggal kustom di sisi klien:
 * - Dari dan Sampai harus terisi
 * - Dari tidak boleh setelah Sampai
 * - Rentang maksimal 366 hari inklusif (menggunakan countDaysInclusive)
 */
export function validateCustomDateRange(
  from: string,
  to: string
): DateRangeValidationResult {
  if (!from || !to) {
    return {
      valid: false,
      error: "Isi kedua tanggal.",
    };
  }

  if (from > to) {
    return {
      valid: false,
      error: "Tanggal Dari tidak boleh setelah Sampai.",
    };
  }

  const days = countDaysInclusive(from, to);
  if (days > 366) {
    return {
      valid: false,
      error: "Rentang tanggal maksimal 366 hari.",
    };
  }

  return { valid: true };
}
