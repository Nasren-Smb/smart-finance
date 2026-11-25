import { isValidCalendarDate } from "./finance/schemas";

/**
 * Tepat 30 kalimat motivasi statis untuk Smart Finance.
 * Diambil tanpa penambahan kata, perubahan tanda baca, atau perubahan urutan.
 */
export const MOTIVATION_QUOTES: readonly string[] = [
  "Langkah kecil yang kamu ambil hari ini tetap berarti, sekecil apa pun kelihatannya.",
  "Tidak apa-apa berjalan pelan, yang penting kamu terus melangkah dengan caramu sendiri.",
  "Setiap catatan yang kamu tulis adalah bukti bahwa kamu peduli pada dirimu sendiri.",
  "Hari yang kurang baik bukan akhir perjalananmu, besok selalu ada kesempatan baru.",
  "Kamu sudah melangkah sejauh ini, dan itu layak dihargai.",
  "Mengatur keuangan adalah cara merawat masa depanmu dengan penuh kasih.",
  "Kebiasaan baik tumbuh dari hal sederhana yang dilakukan dengan sabar.",
  "Kamu tidak perlu sempurna untuk maju, cukup mau mencoba lagi.",
  "Tenangkan hati, semua hal baik butuh waktu untuk tumbuh.",
  "Setiap rupiah yang kamu catat membuat gambaran hidupmu semakin jelas.",
  "Hari ini, beri dirimu izin untuk beristirahat sejenak, lalu lanjutkan dengan semangat baru.",
  "Perjalananmu milikmu sendiri, tidak perlu dibandingkan dengan siapa pun.",
  "Kamu lebih mampu dari yang kamu kira, dan hari ini adalah buktinya.",
  "Kesabaran yang kamu tanam hari ini akan berbuah di waktu yang tepat.",
  "Rencana sederhana yang dijalani dengan setia lebih berharga daripada rencana besar yang tak pernah dimulai.",
  "Apa pun yang terjadi kemarin, hari ini kamu boleh memulai lagi dengan lembut.",
  "Berhemat bukan berarti menahan diri, tetapi memilih apa yang benar-benar membuatmu tenang.",
  "Rasa cukup adalah harta yang bisa kamu rawat setiap hari.",
  "Selalu ada hal baik dalam hidupmu yang layak disyukuri hari ini.",
  "Kamu pantas bangga atas usaha kecil yang kamu lakukan dengan tulus.",
  "Jangan lupa menengok dirimu sendiri, kamu juga berhak mendapat perhatian yang hangat.",
  "Satu hari yang berjalan baik cukup untuk mengingatkan bahwa kamu bisa.",
  "Keraguan boleh datang, tetapi keberanianmu untuk mencoba selalu lebih besar.",
  "Setiap pagi adalah halaman kosong yang siap kamu isi dengan hal-hal baik.",
  "Mimpi besar dimulai dari kebiasaan kecil yang kamu jaga dengan konsisten.",
  "Kamu tidak sendirian, banyak orang yang juga sedang belajar dan bertumbuh seperti dirimu.",
  "Kemajuan tidak selalu terlihat besar, tetapi selalu terasa pada hati yang tenang.",
  "Hari ini cukup lakukan yang kamu bisa, dan itu sudah lebih dari cukup.",
  "Semoga hari ini membawa ketenangan dan hal-hal kecil yang membuatmu tersenyum.",
  "Teruslah bertumbuh dengan lembut, dunia punya tempat untuk setiap langkahmu.",
] as const;

const MS_PER_DAY = 86_400_000;

/**
 * Menghitung indeks kalimat motivasi berdasarkan tanggal kalender YYYY-MM-DD.
 * Menggunakan hari kalender UTC murni agar konsisten dan deterministik.
 *
 * @param dateStr Tanggal kalender dalam format "YYYY-MM-DD"
 * @param totalQuotes Jumlah total kalimat (default: MOTIVATION_QUOTES.length)
 * @returns Indeks kalimat dalam rentang 0 hingga totalQuotes - 1
 */
export function getMotivationIndex(
  dateStr: string,
  totalQuotes: number = MOTIVATION_QUOTES.length
): number {
  if (!totalQuotes || totalQuotes <= 0 || !Number.isInteger(totalQuotes)) {
    throw new Error("totalQuotes harus berupa bilangan bulat positif lebih besar dari 0");
  }

  if (!isValidCalendarDate(dateStr)) {
    throw new Error(`Format tanggal tidak valid atau bukan tanggal kalender: "${dateStr}"`);
  }

  const [yearStr, monthStr, dayStr] = dateStr.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  const utcMs = Date.UTC(year, month - 1, day);
  const dayNumber = Math.floor(utcMs / MS_PER_DAY);

  // Modulus aman non-negatif
  return ((dayNumber % totalQuotes) + totalQuotes) % totalQuotes;
}
