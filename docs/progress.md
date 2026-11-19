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
Fase 4: Beranda (Saldo dan ringkasan periode)

## Terakhir Selesai
Fase 3 (Langkah 5b Perbaikan State Mode Periode "Pilih Tanggal"):
1. Terbukti Dugaan Bug: Sebelumnya `activePeriodMode` diturunkan secara pasif dari `filters.from` dan `filters.to` pada setiap siklus render. Saat "Pilih tanggal" diklik, handler mengisi default `from/to` dengan nilai bulan ini, sehingga mode langsung terhitung kembali sebagai "month" dan input tanggal kustom tertutup.
2. Solusi & Perbaikan:
   - Mode periode dijadikan state eksplisit `periodMode: "semua" | "bulan" | "minggu" | "kustom"` di `components/TransactionFilterBar.tsx`.
   - Dibuat fungsi murni `derivePeriodMode(filters, today)` di `lib/finance/period.ts` beserta unit test lengkapnya di `lib/finance/period.test.ts` (14 tests passed) untuk inisialisasi awal dan sinkronisasi eksternal (muat ulang, Back/Forward).
   - Klik "Pilih tanggal" mengubah `periodMode = "kustom"`, membuka input Dari dan Sampai tanpa mengisi otomatis nilai tanggal.
   - Penambahan pesan peringatan `Isi kedua tanggal` jika hanya salah satu tanggal kustom yang terisi.
   - Pilihan "Bulan ini" dan "Minggu ini" diverifikasi dapat diterima API tanpa terhambat batas tanggal hari ini.
3. Verifikasi: lint bersih (0 error/warning), typecheck lulus, 108 tests Vitest lulus 100%, dan build produksi Next.js 16 (webpack) berhasil 100%.

Fase 3 (Langkah 5b Perbaikan Filter Tanggal & Dev Recoverable Error):
1. Investigasi & Verifikasi Skema Filter: Menghilangkan pembatasan tanggal `max={today}` pada input kustom filter agar tanggal akhir bulan atau periode masa depan kalender dapat dipilih tanpa pembatasan artificial di klien, sementara aturan masa depan tetap ditegakkan ketat pada skema mutasi transaksi.
2. Penanganan Hydration & Recoverable Error Next.js 16 (Turbopack):
   - Di `components/TransactionFilterBar.tsx`, inisialisasi `todayWIB()` ditangani setelah komponen terpasang di client (`mountedToday`), mengeliminasi mismatch antara waktu pre-render server dan waktu browser client.
   - Di `app/(app)/page.tsx` (Beranda), ditambahkan `export const instant = false` untuk menonaktifkan validasi prefetch instant yang sebelumnya terhenti di level server rendering akibat percabangan `redirect()` dan pembacaan cookie otentikasi.
3. Test Vitest & Verifikasi: Menambahkan pengujian pada `lib/api/api.test.ts` untuk memvalidasi rentang query filter bulan penuh (`from=2026-11-01` sampai `to=2026-11-30`) dan menolak `from > to`, sementara validasi `transaction_date` untuk pembuatan transaksi tetap menolak tanggal masa depan. Seluruh 108 test lulus, lint & typecheck bersih, build Next.js lulus 100%.

Fase 3 (Langkah 5b):
1. Fungsi murni periode (`lib/finance/period.ts`) dan unit test (`lib/finance/period.test.ts`): fungsi `monthRange` (bulan penuh) dan `weekRange` (Senin–Minggu penuh) dengan aritmetika murni UTC tanpa bergantung zona waktu mesin. 8 test case wajib lulus persis.
2. Fungsi murni filter (`lib/finance/filters.ts`) dan unit test (`lib/finance/filters.test.ts`): fungsi `parseFilters`, `buildSearchString`, dan `buildApiQuery` dengan validasi Zod (type enum, from/to calendar date & from <= to, q trim maks 100 karakter), round trip stabil, dan penanganan nilai rusak tanpa melempar error.
3. Komponen UI Filter (`components/TransactionFilterBar.tsx`): input pencarian dengan debounce 400ms dan tombol hapus teks, kontrol segmen jenis (Semua | Pemasukan | Pengeluaran), kontrol segmen periode (Semua waktu | Bulan ini | Minggu ini | Pilih tanggal) dengan input tanggal kustom (Sampai >= Dari), tombol reset filter, dan panel collapsible di mobile dengan badge filter aktif. Elemen sentuh minimal 44px.
4. Integrasi halaman `/transaksi` (`app/(app)/transaksi/page.tsx` & `TransaksiContent.tsx`): URL sebagai single source of truth (`router.replace` tanpa scroll), boundary `<Suspense>` untuk `useSearchParams()`, `AbortController` untuk membatalkan permintaan lama saat mengetik cepat, pembedaan keadaan kosong (tanpa filter vs dengan filter), saldo global tetap terpisah dan tidak terpengaruh filter, pemulihan state loading di `finally`, serta kepatuhan penuh token warna Tailwind dan aksesibilitas screen reader (`aria-live`).
5. Verifikasi menyeluruh: lint (0 error/warning), typecheck (`tsc --noEmit`), 102 tests Vitest lulus, dan build produksi Next.js 16 (webpack) lulus 100%.

Fase 3 (Diagnosis Overlay Beranda): Analisis kandidat penyebab issue overlay dev Next.js 16.4.6 (`cacheComponents: true`, `partialPrefetching: true`) pada `app/(app)/page.tsx`. Kandidat diverifikasi terhadap dokumentasi resmi Next.js 16.

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
