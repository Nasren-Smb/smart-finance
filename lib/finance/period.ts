export interface DateRange {
  from: string;
  to: string;
}

export type PeriodMode = "semua" | "bulan" | "minggu" | "kustom";

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
 * Menghasilkan rentang tanggal dari hari pertama sampai hari terakhir bulan yang memuat `today`.
 * Menerima `today` berupa string "YYYY-MM-DD" dan dihitung murni dengan aritmetika UTC.
 */
export function monthRange(today: string): DateRange {
  const [yearStr, monthStr] = today.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10); // 1-12

  // Hari pertama bulan (tanggal 1)
  const firstDay = new Date(Date.UTC(year, month - 1, 1));

  // Hari terakhir bulan: tanggal 0 dari bulan berikutnya
  const lastDay = new Date(Date.UTC(year, month, 0));

  return {
    from: formatUtcYmd(firstDay),
    to: formatUtcYmd(lastDay),
  };
}

/**
 * Menghasilkan rentang tanggal dari Senin sampai Minggu (minggu kalender penuh) yang memuat `today`.
 * Menerima `today` berupa string "YYYY-MM-DD" dan dihitung murni dengan aritmetika UTC.
 * Tidak dipotong di batas pergantian bulan.
 */
export function weekRange(today: string): DateRange {
  const [yearStr, monthStr, dayStr] = today.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  const currentDate = new Date(Date.UTC(year, month - 1, day));

  // getUTCDay(): 0 = Minggu, 1 = Senin, ..., 6 = Sabtu
  const dayOfWeek = currentDate.getUTCDay();
  // Hitung selisih hari ke hari Senin terdekat (Senin = index 0)
  // Jika Minggu (0), selisih mundur 6 hari. Jika Senin (1), selisih 0 hari.
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const monday = new Date(currentDate.getTime());
  monday.setUTCDate(currentDate.getUTCDate() - diffToMonday);

  const sunday = new Date(monday.getTime());
  sunday.setUTCDate(monday.getUTCDate() + 6);

  return {
    from: formatUtcYmd(monday),
    to: formatUtcYmd(sunday),
  };
}

/**
 * Fungsi murni untuk menurunkan mode periode dari objek filter dan tanggal hari ini (today).
 * Digunakan untuk menginisialisasi mode saat halaman dimuat atau saat navigasi Back/Forward.
 * - Tanpa from dan to = "semua"
 * - Sama persis dengan monthRange(today) = "bulan"
 * - Sama persis dengan weekRange(today) = "minggu"
 * - Selain itu (termasuk hanya salah satu terisi atau rentang kustom) = "kustom"
 */
export function derivePeriodMode(
  filters: { from?: string; to?: string },
  today: string
): PeriodMode {
  if (!filters.from && !filters.to) {
    return "semua";
  }

  const currentMonth = monthRange(today);
  if (filters.from === currentMonth.from && filters.to === currentMonth.to) {
    return "bulan";
  }

  const currentWeek = weekRange(today);
  if (filters.from === currentWeek.from && filters.to === currentWeek.to) {
    return "minggu";
  }

  return "kustom";
}
