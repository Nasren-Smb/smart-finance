const MONTH_NAMES_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

/**
 * Format nominal Rupiah bulat dengan pemisah ribuan titik.
 * Contoh: 1250000 -> "Rp 1.250.000"
 */
export function formatRupiah(amount: number): string {
  const formattedNumber = new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(amount);

  return `Rp ${formattedNumber}`;
}

/**
 * Format tanggal YYYY-MM-DD menjadi format Indonesia singkat "DD Mon YYYY".
 * Contoh: "2026-11-18" -> "18 Nov 2026"
 * Menggunakan parsing murni tanpa konversi zona waktu lokal untuk mencegah pergeseran tanggal.
 */
export function formatTanggal(dateStr: string): string {
  const [yearStr, monthStr, dayStr] = dateStr.split("-");
  const day = Number(dayStr);
  const monthIndex = Number(monthStr) - 1;
  const year = Number(yearStr);

  const monthName = MONTH_NAMES_SHORT[monthIndex] ?? monthStr;
  return `${day} ${monthName} ${year}`;
}
