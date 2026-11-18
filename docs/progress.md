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
Fase 3: Langkah 0 (Pencatatan keputusan produk di kode dan dokumen)

## Terakhir Selesai
Fase 2: Lapisan database Drizzle, skema tabel `transactions` + SQL migrasi RLS, validasi Zod, fungsi bisnis aturan saldo murni & advisory lock database, konfigurasi Vitest + 32 unit test lulus, serta verifikasi lint, typecheck, dan build lulus.

## Tugas Berikutnya
Fase 3: Implementasi UI dan endpoint transaksi (tambah, edit, hapus, daftar, filter, cari).

## Catatan Penting
- Keputusan Produk Fase 3 (Langkah 0):
  - Tanggal transaksi di masa depan DITOLAK (maksimal hari ini WIB `Asia/Jakarta`).
  - Panjang keterangan/sumber maksimal 100 karakter setelah di-trim (diterapkan di validasi Zod aplikasi, belum di constraint database).
  - Urutan daftar transaksi: `transaction_date DESC`, `created_at DESC`, `id DESC` (stabil).
  - Paginasi daftar: 20 item per tampilan (`PAGE_SIZE = 20`) dengan tombol "Muat lebih banyak".
  - Format nominal: `Rp 1.250.000` (titik pemisah ribuan).
  - Format tanggal: `18 Nov 2026` (Indonesia 3 huruf bulan, independen dari zona waktu lokal mesin).
- File baru Fase 3 (Langkah 0):
  - `lib/finance/date.ts` & `date.test.ts`: Helper `todayWIB(now)` menggunakan `Intl` dengan `timeZone: "Asia/Jakarta"`.
  - `lib/finance/constants.ts`: Konstanta `PAGE_SIZE`, `DESCRIPTION_MAX_LENGTH`, dan komentar urutan daftar.
  - `lib/format.ts` & `format.test.ts`: Helper `formatRupiah` dan `formatTanggal`.
  - Pembaruan `lib/finance/schemas.ts` & `schemas.test.ts`: Validasi tolak masa depan dan batas 100 karakter.
- File penting Fase 2:
  - `lib/db/index.ts`: Klien Drizzle lazy dengan driver postgres.js (`prepare: false` untuk transaction pooler).
  - `lib/db/schema.ts`: Skema tabel `transactions` (bigint Rupiah, check constraint > 0, check description non-empty, index).
  - `drizzle/0000_curved_reptil.sql`: File migrasi SQL mencakup FK `auth.users(id)` cascade dan kebijakan RLS Supabase.
  - `lib/finance/balance.ts`: Fungsi murni kalkulasi saldo, validasi add/update/delete, dan `InsufficientBalanceError`.
  - `lib/finance/balance-db.ts`: Fungsi `getBalance(userId)` via SQL SUM dan `runWithUserLock` berbasis `pg_advisory_xact_lock(hashtext(userId))`.
  - `vitest.config.mts`: Konfigurasi Vitest ESM dengan alias `@`.
  - `drizzle.config.ts`: Konfigurasi Drizzle dengan pemuat `@next/env`.
- Variabel environment: `DATABASE_URL` dan `DATABASE_MIGRATION_URL` (hanya di server).
- Keamanan: Query Drizzle wajib menyertakan filter eksplisit `user_id = userId` pengguna terverifikasi karena connection pooler Drizzle membypass RLS Supabase.

## Masalah Terbuka
- Developer perlu menjalankan `npm run db:migrate` setelah mengisi `DATABASE_MIGRATION_URL` di `.env.local`.
- Testing manual login Google di browser oleh developer (memeriksa keberadaan cookie `sb-*-auth-token`, akses Beranda, dan tombol Keluar).
