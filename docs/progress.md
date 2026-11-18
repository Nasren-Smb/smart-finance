# Catatan Progres Proyek - Smart Finance

Dokumen ini adalah catatan serah-terima antar sesi dan akun. Agent hanya memperbarui ISI bagian-bagiannya di akhir tiap tugas dan tidak mengubah struktur file.

## Status Fase
- [x] Fase 1: Setup proyek, koneksi Supabase, login Google
- [ ] Fase 2: Skema database (Drizzle) dan aturan saldo
- [ ] Fase 3: Transaksi (tambah, edit, hapus, daftar, filter, cari)
- [ ] Fase 4: Beranda (saldo dan ringkasan periode)
- [ ] Fase 5: Grafik
- [ ] Fase 6: Export Excel/PDF
- [ ] Fase 7: Edukasi & Motivasi, footer, perapian

## Sedang Dikerjakan
(kosong)

## Terakhir Selesai
Fase 1: Setup proyek Next.js, perbaikan persistensi cookie sesi pada auth callback dan middleware/proxy, verifikasi lint, typecheck, dan build lulus.

## Tugas Berikutnya
Fase 2.

## Catatan Penting
- Token warna palet Tailwind CSS v4 di `app/globals.css`:
  - `bg-main`: `#141416`
  - `surface`: `#1C1C20`
  - `surface-elevated`: `#26262B`
  - `line`: `#2E2E34`
  - `text-main`: `#F4F4F5`
  - `text-secondary`: `#A1A1AA`
  - `text-muted`: `#71717A`
  - `accent`: `#60A5FA`
  - `income`: `#34D399`
  - `expense`: `#F87171`
  - `warning`: `#FBBF24`
- Pendekatan Sesi & Autentikasi:
  - `@supabase/ssr` digunakan untuk browser client (`lib/supabase/client.ts`), server client (`lib/supabase/server.ts`), dan middleware sesi (`lib/supabase/middleware.ts` & `middleware.ts`).
  - Route callback (`app/auth/callback/route.ts`) langsung mengikat `setAll` ke header cookie `NextResponse.redirect()` sehingga session cookie Supabase (`sb-*-auth-token`) tidak terbuang saat pengalihan kembali ke `/`.
  - Middleware (`lib/supabase/middleware.ts`) menyalin seluruh cookie yang diperbarui/disinkronkan ke objek `NextResponse.redirect()` ketika terjadi pengalihan rute.
  - Verifikasi keamanan server-side menggunakan metode resmi `supabase.auth.getUser()`.
  - Halaman `/` dilindungi di level server dan dienkapsulasi dengan React `Suspense` untuk kompatibilitas partial prerendering / cacheComponents.

## Masalah Terbuka
- Testing manual login Google di browser oleh developer (memeriksa keberadaan cookie `sb-*-auth-token`, akses Beranda, dan tombol Keluar).
- Testing framework otomatis (Vitest) belum dipasang sesuai keputusan yang tertunda.
