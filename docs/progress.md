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
Fase 3: Langkah 2 (Migrasi konvensi middleware ke proxy Next.js 16.4.6)

## Terakhir Selesai
Fase 3 (Langkah 2): Migrasi konvensi file `middleware.ts` ke `proxy.ts` dengan ekspor fungsi `proxy` untuk Next.js 16.4.6. Peringatan deprecation build telah hilang sepenuhnya, dan verifikasi lint, typecheck, test, serta build lulus 100%.

## Tugas Berikutnya
Fase 3: Langkah 3 (Implementasi form tambah/edit transaksi, validasi, dan integrasi mutasi database).

## Catatan Penting
- Migrasi Proxy Next.js 16:
  - File root `middleware.ts` dimigrasikan ke `proxy.ts` dengan ekspor fungsi `proxy(request: NextRequest)`.
  - Peringatan `The "middleware" file convention is deprecated. Please use "proxy" instead` telah hilang dari output build.
  - Seluruh logika sinkronisasi sesi Supabase SSR dan proteksi rute pengalihan dipertahankan persis tanpa perubahan.
- Kerangka Navigasi & Tata Letak:
  - Route group: `(app)` membungkus `/`, `/transaksi`, `/transaksi/baru`, `/grafik`, `/export`, `/edukasi`, `/akun`. Rute `/login` dan `/auth/callback` tetap di luar `(app)`.
  - Breakpoint: `lg` (1024px) memisahkan tampilan desktop (Sidebar di kiri) dan mobile (Bottom Navigation di bawah).
  - Gaya ikon SVG buatan sendiri dengan garis tipis konsisten (gaya ikon belum diputuskan secara final oleh developer).
  - Elemen sentuh interaktif dirancang minimal 44-48 px untuk keramahan jempol mobile.
  - Halaman `/akun` memverifikasi pengguna di sisi server di dalam batas React `Suspense` untuk mematuhi aturan Cache Components Next.js 16.
- Keputusan Produk Fase 3 (Langkah 0):
  - Tanggal transaksi di masa depan DITOLAK (maksimal hari ini WIB `Asia/Jakarta`).
  - Panjang keterangan/sumber maksimal 100 karakter setelah di-trim (diterapkan di validasi Zod aplikasi, belum di constraint database).
  - Urutan daftar transaksi: `transaction_date DESC`, `created_at DESC`, `id DESC` (stabil).
  - Paginasi daftar: 20 item per tampilan (`PAGE_SIZE = 20`) dengan tombol "Muat lebih banyak".
  - Format nominal: `Rp 1.250.000` (titik pemisah ribuan).
  - Format tanggal: `18 Nov 2026` (Indonesia 3 huruf bulan, independen dari zona waktu lokal mesin).

## Masalah Terbuka
- Developer perlu menjalankan `npm run db:migrate` setelah mengisi `DATABASE_MIGRATION_URL` di `.env.local`.
- Testing manual alur navigasi dan proteksi proxy oleh developer di browser (akses halaman tanpa login dialihkan ke `/login`, setelah login dapat mengakses rute di dalam `(app)`).
