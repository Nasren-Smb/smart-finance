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
(kosong)

## Terakhir Selesai
Fase 2: Lapisan database Drizzle, skema tabel `transactions` + SQL migrasi RLS, validasi Zod, fungsi bisnis aturan saldo murni & advisory lock database, konfigurasi Vitest + 32 unit test lulus, serta verifikasi lint, typecheck, dan build lulus.

## Tugas Berikutnya
Developer menjalankan migrasi database (`npm run db:migrate`), lalu lanjut ke Fase 3 (Transaksi: tambah, edit, hapus, daftar, filter, cari).

## Catatan Penting
- File penting Fase 2:
  - `lib/db/index.ts`: Klien Drizzle lazy dengan driver postgres.js (`prepare: false` untuk transaction pooler).
  - `lib/db/schema.ts`: Skema tabel `transactions` (bigint Rupiah, check constraint > 0, check description non-empty, index).
  - `drizzle/0000_curved_reptil.sql`: File migrasi SQL mencakup FK `auth.users(id)` cascade dan kebijakan RLS Supabase.
  - `lib/finance/balance.ts`: Fungsi murni kalkulasi saldo, validasi add/update/delete, dan `InsufficientBalanceError`.
  - `lib/finance/balance-db.ts`: Fungsi `getBalance(userId)` via SQL SUM dan `runWithUserLock` berbasis `pg_advisory_xact_lock(hashtext(userId))`.
  - `lib/finance/schemas.ts`: Skema validasi Zod untuk input transaksi.
  - `vitest.config.mts`: Konfigurasi Vitest ESM dengan alias `@`.
  - `drizzle.config.ts`: Konfigurasi Drizzle dengan pemuat `@next/env`.
- Variabel environment baru: `DATABASE_URL` dan `DATABASE_MIGRATION_URL` (hanya diakses di server).
- Keamanan: Query Drizzle wajib menyertakan filter eksplisit `user_id = userId` pengguna terverifikasi karena connection pooler Drizzle membypass RLS Supabase.

## Masalah Terbuka
- Developer perlu menjalankan `npm run db:migrate` setelah mengisi `DATABASE_MIGRATION_URL` di `.env.local`.
- Testing manual login Google di browser oleh developer (memeriksa keberadaan cookie `sb-*-auth-token`, akses Beranda, dan tombol Keluar).
