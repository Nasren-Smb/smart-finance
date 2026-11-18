# Standar Tech Stack - Smart Finance

Dokumen ini mendefinisikan batasan arsitektur teknis dan dependensi Smart Finance; teknologi di luar dokumen ini harus ditanyakan dulu.

## 1. Stack Utama (Telah Diputuskan)
- **Framework**: Next.js App Router (dilarang menggunakan Pages Router). Server Component menjadi pilihan default; gunakan directive `"use client"` hanya saat membutuhkan state atau event listener.
- **Bahasa**: TypeScript dalam mode strict.
- **Backend**: Next.js Route Handlers tanpa server terpisah (penggunaan Server Actions wajib tanya dulu).
- **Database**: Supabase (PostgreSQL).
- **ORM**: Drizzle ORM (skema Drizzle adalah satu-satunya sumber kebenaran untuk nama tabel dan kolom). Koneksi wajib melalui connection string POOLER, bukan koneksi langsung.
- **Autentikasi**: Supabase Auth khusus Google Login (tanpa email dan password).
- **Styling**: Tailwind CSS (penggunaan warna murni dari token, rujuk `docs/design.md`).
- **Hosting**: Vercel (serverless environment).

## 2. Keamanan, Database, dan Lingkungan Vercel
- **Keamanan Data**: Seluruh data pengguna wajib diisolasi menggunakan Row Level Security (RLS). Kunci publik boleh diakses oleh browser; kunci rahasia dan password database hanya diakses di sisi server melalui environment variable.
- **Migrasi**: Perubahan skema atau pembuatan file migrasi wajib tanya dulu. Dilarang menghapus atau mengubah berkas migrasi yang sudah ada.
- **Karakteristik Vercel**:
  - Filesystem bersifat non-persisten; dilarang menyimpan data atau file ke disk lokal.
  - Nilai rahasia hanya dikelola lewat environment variable. Dilarang mengubah `vercel.json` atau konfigurasi deployment tanpa izin.
  - Versi 1 tidak menggunakan fitur cron.
  - Pengembangan dan pengujian wajib diselesaikan di localhost sebelum proses deploy.

## 3. Catatan Versi Paket
Tabel versi dependensi akan dicatat oleh developer dari `package.json` setelah fase 1 selesai. Agent dilarang menebak atau mengisi versi paket sendiri. Wajib memeriksa dokumentasi resmi sesuai versi terpasang sebelum menggunakan API paket terkait.

## 4. Belum Diputuskan (Tanya Developer, Jangan Menebak)
- **Validasi Input**: Belum disetujui (usulan yang diajukan: Zod).
- **Visualisasi Chart**: Belum disetujui (usulan yang diajukan: Recharts).
- **Framework Testing**: Belum disetujui (usulan yang diajukan: Vitest).
- **Export Excel dan PDF**: Pemilihan pustaka akan ditentukan pada fase 6.

## 5. Batasan dan Larangan
- Dilarang menggunakan Pages Router.
- Dilarang menggunakan library komponen UI di luar Tailwind CSS.
- Dilarang mencampur file CSS biasa dengan Tailwind CSS.
- Dilarang menambah dependency atau paket baru apa pun tanpa izin tertulis.
