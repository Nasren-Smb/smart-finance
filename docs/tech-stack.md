# Standar Tech Stack - Smart Finance

Dokumen ini mendefinisikan daftar teknologi yang boleh dipakai; yang tidak tercantum harus ditanyakan dulu.

## 1. Ringkasan Status Teknologi
| Bagian | Teknologi | Status |
| :--- | :--- | :--- |
| Framework | Next.js (App Router) | Terpasang |
| UI Library | React | Terpasang |
| Bahasa | TypeScript | Terpasang |
| Styling | Tailwind CSS | Terpasang |
| Auth & SSR Client | Supabase (`@supabase/ssr`, `@supabase/supabase-js`) | Terpasang |
| Linter | ESLint | Terpasang |
| ORM | Drizzle ORM (skema Drizzle = sumber kebenaran nama tabel/kolom) | Terpasang |
| Driver Database | Driver Postgres (`postgres` / postgres.js) | Terpasang |
| Validasi Input | Zod | Terpasang |
| Testing Framework | Vitest | Terpasang |
| Layanan Database & Auth | Supabase (PostgreSQL dan Auth login Google saja) | Terpasang |
| Hosting | Vercel (serverless; belum dideploy) | Terpasang |
| Version Control | Git / GitHub (dikelola developer secara manual) | Terpasang |
| Visualisasi Data | Recharts | Terpasang |
| Export Dokumen | Library export Excel dan PDF | Belum diputuskan (fase 6) |

## 2. Versi Dependensi (package.json)
| Paket | Versi di package.json |
| :--- | :--- |
| `next` | `16.4.6` |
| `react` | `19.3.0` |
| `react-dom` | `19.3.0` |
| `@supabase/ssr` | `^0.12.7` |
| `@supabase/supabase-js` | `^2.119.0` |
| `drizzle-orm` | `^0.45.4` |
| `postgres` | `^4.1.1` |
| `zod` | `^4.6.7` |
| `recharts` | `3.11.0` |
| `tailwindcss` | `4.3.3` |
| `@tailwindcss/turbopack` | `4.3.3` |
| `typescript` | `^5` |
| `drizzle-kit` | `^0.31.11` |
| `vitest` | `^5.1.0` |
| `vite` | `^8.3.8` |
| `eslint` | `^9` |
| `eslint-config-next` | `16.4.6` |
| `@types/node` | `^24` |
| `@types/react` | `^19` |
| `@types/react-dom` | `^19` |

- **Catatan Versi**: Versi persis yang terpasang ada di `package-lock.json`.
- **Package Manager**: `npm`.
- **Struktur Direktori**: Tanpa folder `src/`.
- **Script Build**: Script `"build"` memakai flag `next build --webpack`.

## 3. Struktur Proyek Saat Ini
- `app/`: Rute utama aplikasi berbasis Next.js App Router (layout root, styling global).
- `app/login/`: Rute dan antarmuka halaman login pengguna dengan Google.
- `app/auth/callback/`: Route handler untuk pertukaran kode otentikasi (PKCE) menjadi sesi cookie.
- `lib/supabase/`: Helper inisialisasi client Supabase (browser client, server client, dan helper middleware).
- `lib/db/`: Koneksi Drizzle lazy dan definisi skema tabel database.
- `lib/finance/`: Logika aturan saldo murni, query saldo database ber-advisory lock, dan skema validasi Zod.
- `drizzle/`: Berkas migrasi SQL hasil generate `drizzle-kit`.
- `docs/`: Dokumentasi produk, panduan desain, standar tech-stack, dan catatan progres serah-terima.
- `middleware.ts`: File middleware root untuk sinkronisasi sesi dan proteksi navigasi.

## 4. Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DATABASE_URL` (koneksi runtime lewat Supabase transaction pooler, port 6543)
- `DATABASE_MIGRATION_URL` (koneksi migrasi lewat Supabase session pooler, port 5432)
- **Catatan**: Nilai `ANON_KEY` diisi dengan publishable key Supabase (Supabase menyebutnya publishable; nama variabel ini dipertahankan karena itu yang dibaca kode). Kunci rahasia dan connection string database hanya diakses di sisi server.

## 5. Arsitektur dan Aturan Platform
- **Next.js**: Server Component secara default; gunakan `"use client"` hanya saat membutuhkan state atau event listener. Backend berbasis Route Handlers tanpa server terpisah (Server Actions wajib tanya dulu).
- **Supabase & Database**: Menggunakan connection string POOLER, bukan koneksi langsung (`prepare: false`). Seluruh data dilindungi Row Level Security (RLS). Perubahan skema/migrasi wajib tanya dulu; dilarang menghapus atau mengubah migrasi lama.
- **Isolasi Query Drizzle**: RLS Supabase TIDAK otomatis melindungi query yang dijalankan via koneksi langsung/pooler Drizzle (postgres connection string menggunakan bypass RLS atau user postgres). Oleh karena itu, semua query Drizzle WAJIB menyertakan filter eksplisit `user_id = userId` dari pengguna yang telah diverifikasi otentikasinya.
- **Vercel**: Filesystem non-persisten (dilarang menyimpan file ke disk lokal). Nilai rahasia hanya lewat environment variable. Dilarang mengubah `vercel.json` atau konfigurasi deploy tanpa izin. Tidak ada fitur cron di v1.

## 6. Catatan Penting dan Pelajaran
- Pengembangan dilakukan di Windows (PowerShell) dan dites lokal di `localhost` sebelum deploy.
- Gejala "login Google berhasil di Supabase tapi pengguna kembali ke /login": periksa dulu validitas kunci di `.env.local` sebelum mengubah kode. Penyebab pada Fase 1 adalah nilai kunci yang tidak valid.
- Next.js 16 menandai konvensi file "middleware" sebagai deprecated demi "proxy"; proyek masih memakai `middleware.ts` dan migrasi belum dilakukan.
- Font saat ini memakai font bawaan template dan belum diputuskan sebagai font final.
- Perubahan file `.env` tidak terbaca tanpa restart server dev.

## 7. Batasan dan Larangan Tanpa Izin
- Dilarang menggunakan Pages Router.
- Dilarang menggunakan library UI di luar Tailwind CSS.
- Dilarang mencampur file CSS biasa dengan Tailwind CSS.
- Dilarang menambah dependency apa pun yang tidak berstatus "Terpasang" atau "Diputuskan".
