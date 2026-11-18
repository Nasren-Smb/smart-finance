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
Fase 3: Langkah 3 (Lapisan server transaksi / Route Handlers)

## Terakhir Selesai
Fase 3 (Langkah 3): Implementasi Route Handlers REST API (`/api/transactions`, `/api/transactions/[id]`, `/api/balance`) lengkap dengan verifikasi pengguna server-side, helper respons/error seragam, validasi Zod (termasuk batas `Number.MAX_SAFE_INTEGER`), advisory lock transaksi database, pagination keyset cursor buram base64url, sanitasi pencarian LIKE wildcard, dokumentasi `docs/api.md`, serta 58 unit test lulus.

## Tugas Berikutnya
Fase 3: Langkah 4 (Antarmuka pengguna transaksi: lembar tambah/edit transaksi, kartu daftar transaksi di HP, tabel di laptop, filter, cari, dan paginasi "Muat lebih banyak").

## Catatan Penting
- Lapisan Server Transaksi (Route Handlers):
  - `POST /api/transactions`: Buat transaksi dengan validasi saldo server-side & advisory lock (201).
  - `GET /api/transactions`: Daftar transaksi terpaginasi keyset cursor dengan filter `type`, `from`, `to`, `q` (escape LIKE).
  - `GET /api/transactions/[id]`: Ambil detail transaksi (404 jika bukan milik pengguna).
  - `PATCH /api/transactions/[id]`: Ubah transaksi parsial dengan validasi saldo (404 / 422).
  - `DELETE /api/transactions/[id]`: Hapus transaksi dengan validasi saldo (menolak 422 jika saldo menjadi negatif).
  - `GET /api/balance`: Saldo seluruh riwayat pengguna.
- Helper & Logika Server:
  - `lib/api/response.ts`: Format respons seragam `{ data }` dan `{ error: { code, message, fields } }`, serta pemetaan error.
  - `lib/api/auth.ts`: Verifikasi server-side `getUser()` mengekstrak `user.id`.
  - `lib/api/cursor.ts`: Keyset pagination encoder/decoder base64url.
  - `lib/api/query.ts`: Skema query parameter dan fungsi escape wildcard LIKE (`%`, `_`, `\`).
  - `lib/finance/transaction-service.ts`: Logika mutasi dan pembacaan transaksi Drizzle ber-filter `user_id`.
- Validasi Nominal:
  - Batas atas nominal dibatasi hingga `Number.MAX_SAFE_INTEGER` (`9.007.199.254.740.991`) untuk mencegah presisi floating point overflow pada runtime JavaScript.
- Dokumentasi:
  - Dibuat `docs/api.md` yang memuat spesifikasi lengkap kontrak API.

## Masalah Terbuka
- Developer perlu menjalankan `npm run db:migrate` setelah mengisi `DATABASE_MIGRATION_URL` di `.env.local`.
- Pengujian langsung endpoint Route Handlers terhadap instance PostgreSQL Supabase nyata (unit test saat ini menguji logika murni, skema validasi, cursor, escape LIKE, dan pemetaan error tanpa koneksi DB).
