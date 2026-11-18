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
Fase 3: Langkah 5a (Perbaikan bug DELETE transaksi 415 & pencatatan logging error)

## Terakhir Selesai
Fase 3 (Langkah 5a Bugfix): Perbaikan kegagalan tombol "Ya, Hapus" pada dialog konfirmasi transaksi.
- Penyebab: Handler `DELETE /api/transactions/[id]` mewajibkan header `Content-Type: application/json` (aturan mutasi 415), tetapi pemanggilan klien pada `app/(app)/transaksi/page.tsx` tidak menyertakan header tersebut karena tidak mengirim request body.
- Perbaikan: Menambahkan header `Content-Type: application/json` pada pemanggilan klien `fetch(..., { method: "DELETE" })` tanpa melonggarkan keamanan server; menambahkan logging terformat `[api] <METHOD> <ROUTE> <ERROR>` (maks 200 karakter, tanpa data sensitif pengguna) pada blok 500 handler server; dan mencatat `console.error("[hapus] status", response.status)` di konsol browser untuk respons tak terduga.
- Verifikasi: lint, typecheck, 83 tests Vitest, dan build produksi Next.js 16 (webpack) lulus 100%.

## Tugas Berikutnya
Fase 3: Langkah 5b (Filter jenis transaksi & rentang tanggal, serta fitur pencarian transaksi).

## Catatan Penting
- Penanganan Header Content-Type pada Mutasi:
  - Seluruh mutasi API (`POST`, `PATCH`, `DELETE`) pada server Smart Finance memvalidasi header `Content-Type: application/json` (mengembalikan `415 Unsupported Media Type` jika absen).
  - Panggilan `fetch` klien untuk `DELETE` wajib secara eksplisit menyertakan `headers: { "Content-Type": "application/json" }` meskipun tidak membawa payload body.
- Logging Error Aman:
  - Error level 500 server dicatat dengan pola `[api] ${method} ${routePath} ${truncatedMsg}` (pesan error dipotong 200 karakter, dilarang mencatat body, ID transaksi, user ID, atau token).
  - Browser console mencatat `[hapus] status <CODE>` untuk status non-200/401/404/422.
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
