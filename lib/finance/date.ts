/**
 * Mengembalikan tanggal hari ini dalam format "YYYY-MM-DD" menurut zona waktu WIB (Asia/Jakarta).
 * Tidak bergantung pada zona waktu mesin (misal server UTC di Vercel).
 * Parameter `now` menerima Date untuk keperluan pengujian.
 */
export function todayWIB(now: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(now);
}
