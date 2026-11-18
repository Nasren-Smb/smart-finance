# Catatan Progres Proyek - Smart Finance

Dokumen ini adalah catatan serah-terima antar sesi dan akun. Agent hanya memperbarui ISI bagian-bagiannya di akhir tiap tugas dan tidak mengubah struktur file.

## Status Fase
- [x] Fase 1: Setup proyek, koneksi Supabase, login Google
- [x] Fase 2: Skema database (Drizzle) dan aturan saldo
- [ ] Fase 3: Transaksi (tambah, edit, hapus, daftar, filter, cari)
- [ ] Fase 4: Beranda (saldo dan ringkasan periode)
- [ ] Fase 5: Grafik
- [ ] Fase 6: Export Excel/PDF
- [ ] Fase 7: Edukasi & Motivasi, footer, perapian

## Sedang Dikerjakan
Fase 3: Langkah 4 (Perbaikan persistensi state form tambah transaksi pada Cache Components)

## Terakhir Selesai
Fase 3 (Langkah 4): Perbaikan bug state form `/transaksi/baru` yang tertahan dalam kondisi "Menyimpan..." dan isian lama tidak ter-reset akibat perilaku React `<Activity mode="hidden">` pada Cache Components Next.js 16. State `isLoading` kini selalu dikembalikan di blok `finally`, form direset bersih di jalur sukses dan melalui cleanup `useLayoutEffect`, toggle jenis dinonaktifkan saat mengirim untuk mencegah race condition, serta verifikasi lint, typecheck, test (68 passed), dan build lulus 100%.

## Tugas Berikutnya
Fase 3: Langkah 5 (Fitur edit transaksi, konfirmasi hapus transaksi, filter jenis & rentang tanggal, serta pencarian transaksi).

## Catatan Penting
- Pelajaran Cache Components Next.js 16 (Form Reset & Navigation):
  - Dengan `cacheComponents: true`, Next.js tidak me-unmount rute saat pengguna bernavigasi berpindah halaman, melainkan menggunakan React `<Activity mode="hidden">` (display: none).
  - Akibatnya, `useState` tidak otomatis di-reset saat rute dikunjungi kembali kecuali form direset secara eksplisit (`resetForm()`) atau melalui cleanup lifecycle (`useLayoutEffect`).
  - Penjaminan `setIsLoading(false)` wajib diletakkan di blok `finally` agar tidak ada jalur eksekusi yang meninggalkan tombol dalam keadaan disabled / "Menyimpan...".
- Halaman UI Transaksi:
  - `/transaksi/baru`: Client component form tambah transaksi dienkapsulasi `<Suspense>` untuk kepatuhan Cache Components Next.js 16 terkait evaluasi waktu. Mengirim request ke `POST /api/transactions`.
  - `/transaksi`: Client component yang memanggil `GET /api/balance` dan `GET /api/transactions`. Mendukung keyset pagination menggunakan `nextCursor`. Responsif (kartu di mobile, tabel di desktop lg).
- Helper Murni:
  - `lib/format-input.ts`: Fungsi `parseNominal` (parsing input string ke integer Rupiah aman) dan `mapApiResponseError` (pemetaan kode status HTTP/error payload ke pesan ramah pengguna).
- Aksesibilitas & Desain:
  - Seluruh input form terhubung dengan `<label htmlFor="...">`.
  - Area pesan status dan error menggunakan atribut `aria-live="polite"`.
  - Target sentuh interaktif dirancang minimal 44-48 px.
  - Teks sepenuhnya Bahasa Indonesia dan warna murni menggunakan token Tailwind (`bg-main`, `surface`, `surface-elevated`, `line`, `text-main`, `text-secondary`, `text-muted`, `accent`, `income`, `expense`, `warning`).

## Masalah Terbuka
- Developer perlu menjalankan `npm run db:migrate` setelah mengisi `DATABASE_MIGRATION_URL` di `.env.local`.
- Pengujian manual interaksi form tambah transaksi berulang kali di peramban (memastikan form selalu segar dan tombol kembali aktif setelah submit).
