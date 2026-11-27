# Catatan Progres Proyek - Smart Finance

Dokumen ini adalah catatan serah-terima antar sesi dan akun. Agent hanya memperbarui ISI bagian-bagiannya di akhir tiap tugas dan tidak mengubah struktur file.

## Status Fase
- [x] Fase 1: Setup proyek, koneksi Supabase, login Google
- [x] Fase 2: Skema database (Drizzle) dan aturan saldo
- [x] Fase 3: Transaksi (tambah, edit, hapus, daftar, filter, cari)
- [x] Fase 4: Beranda (saldo dan ringkasan periode)
- [x] Fase 5: Grafik
- [x] Fase 6: Export Excel/PDF
- [ ] Fase 7: Edukasi & Motivasi, footer, perapian

## Sedang Dikerjakan
Fase 7: Edukasi dan Motivasi, footer, dan perapian akhir aplikasi (Langkah 7.3b prompt B1 selesai: skeleton tiga halaman dan aturan fokus terlihat global selesai; langkah 7.3b prompt B2: kontras text-muted belum dimulai).

## Terakhir Selesai
Fase 7 (Langkah 7.3b Prompt B1 - Skeleton & Fokus Terlihat Global):
- Penggantian fallback teks polos Suspense menjadi skeleton bertema gelap (`animate-pulse` dengan kartu ber-border line): `app/(app)/page.tsx`, `app/(app)/akun/page.tsx`, dan `app/(app)/transaksi/baru/page.tsx`.
- Penambahan aturan fokus terlihat global pada elemen interaktif `a:focus-visible`, `button:focus-visible`, `select:focus-visible`, `[tabindex]:focus-visible` di `app/globals.css` menggunakan token `--color-accent` dengan outline 2px solid dan outline-offset 2px.
- Pembaruan dokumen `docs/design.md` dan `docs/progress.md`.

Fase 7 (Langkah 7.3b Prompt A - 404, Error, Judul Tab, Favicon, Kebersihan):
- Pembuatan `app/not-found.tsx`: Server Component tema gelap dengan token Tailwind, teks Bahasa Indonesia, judul "Halaman tidak ditemukan", dan tautan kembali ke Beranda.
- Pembuatan `app/(app)/error.tsx` dan `app/global-error.tsx`: Client Component penanganan galat ramah pengguna tanpa menampilkan detail teknis atau console logging, dilengkapi tombol "Coba lagi" (reset) dan tautan kembali ke Beranda.
- Judul Tab & Metadata:
  - `app/layout.tsx`: `title.default: "Smart Finance"`, `title.template: "%s · Smart Finance"`.
  - Export `metadata` judul per halaman ditambahkan ke seluruh halaman server, dan untuk dua halaman client (`/transaksi/baru` dan `/login`) ditambahkan berkas `layout.tsx` khusus yang mengekspor metadata title ("Tambah Transaksi" dan "Masuk") tanpa membungkus children.
- Favicon: membuat `app/icon.svg` (persegi sudut membulat dengan latar warna aksen `#60A5FA` dan huruf "S" tebal di tengah) serta menghapus `app/favicon.ico`.
- Kebersihan:
  - Menghapus panggilan `console.error` saat hapus transaksi di `app/(app)/transaksi/TransaksiContent.tsx`.
  - Menghapus 5 berkas SVG template Next.js di `public/` (`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`) setelah verifikasi tidak ada rujukan di kodebase.
- Pembaruan dokumen `docs/tech-stack.md`, `docs/progress.md`, dan `docs/design.md`.

Fase 7 (Langkah 7.2 - Font Inter & Ikon Lucide):
- Penerapan font Inter melalui `next/font/google` (subset latin, variabel `--font-inter`) di `app/layout.tsx` dan `app/globals.css`, menggantikan Geist Sans. Geist Mono tetap dipertahankan untuk kebutuhan angka nominal transaksi (`font-mono`).
- Pemasangan `lucide-react` versi 1.79.0 (`^1.79.0`).
- Penggantian simbol lama (SVG buatan sendiri) dengan ikon resmi Lucide:
  - Menu navigasi Sidebar: `House` (Beranda), `ArrowLeftRight` (Transaksi), `ChartColumn` (Grafik), `FileDown` (Export), `Lightbulb` (Edukasi), `Plus` (Tambah transaksi), `User` (Akun).
  - Menu navigasi BottomNav: `House` (Beranda), `ArrowLeftRight` (Transaksi), `ChartColumn` (Grafik), `FileDown` (Export), `Lightbulb` (Edukasi), `Plus` (FAB Tambah transaksi dengan `aria-label="Tambah transaksi"`).
  - Profil Akun di Beranda HP: `User` (dengan `aria-label="Akun Saya"`).
  - Tombol Keluar di `/akun`: `LogOut`.
- Seluruh ikon dekoratif dilengkapi `aria-hidden="true"`, dan tombol aksi tetap memiliki label aksesibel Bahasa Indonesia.
- Tombol Edit dan Hapus pada daftar transaksi sengaja tetap berupa teks saja (tanpa ikon), serta Geist Mono tetap dipertahankan untuk angka nominal (`font-mono`).
- Pembaruan dokumen `docs/design.md`, `docs/tech-stack.md`, dan `docs/progress.md`.

Fase 7 (Langkah 7.1 - Halaman Edukasi & Motivasi):
- Pembuatan modul statis `lib/motivation.ts` dan pengujian `lib/motivation.test.ts`:
  - `MOTIVATION_QUOTES`: array statis `readonly string[]` berisi tepat 30 kalimat motivasi keuangan asli yang tidak boleh diubah oleh agent.
  - `getMotivationIndex`: fungsi murni menghitung indeks kalimat (0-29) berdasarkan string tanggal kalender "YYYY-MM-DD" dengan formula hari kalender UTC aman non-negatif (`((dayNumber % totalQuotes) + totalQuotes) % totalQuotes`). Melempar error untuk tanggal kalender tidak valid atau `totalQuotes <= 0`.
  - 11 unit tests Vitest menguji kelengkapan 30 kalimat, keunikan, deterministik, penambahan indeks per hari berurutan, pergantian bulan dan tahun, tahun kabisat (2028), wrap around dari 29 ke 0, serta penanganan error input invalid.
- Implementasi antarmuka `/edukasi`:
  - Server Component `app/(app)/edukasi/page.tsx` dengan `await connection()` di dalam `<Suspense>`.
  - Client Component `app/(app)/edukasi/EdukasiContent.tsx`:
    - Menggunakan `todayWIB()` via `useSyncExternalStore` untuk mencegah mismatch dan pembacaan unstable `Date.now()` saat prerendering/SSR Next.js.
    - Menampilkan kartu besar "Kalimat hari ini" di posisi atas hanya berisi label "Kalimat hari ini" dan kalimatnya (tanpa penanda urutan).
    - Menampilkan daftar bernomor (`<ol>`) berisi ke-30 kalimat lengkap di bawah yang tampil seragam (tanpa penanda visual khusus).
    - Tanpa kontrol interaktif apa pun (sesuai spesifikasi).
- Pembaruan dokumentasi `docs/product.md` dan `docs/progress.md`.

Fase 6 (Selesai Penuh & Lulus Tes Produksi Vercel):
- Penggabungan PR #11 ke `main` dan deploy ke Vercel:
  - Tes produksi di Vercel lulus 100%: route sementara `export-spike` sudah hilang (404), halaman `/export` tampil benar, ekspor Excel dan PDF untuk ketiga isi (Pengeluaran, Pemasukan, Semua transaksi) terunduh dan terverifikasi benar.
  - Halaman Beranda, Transaksi, dan Grafik tetap normal.
  - Konfigurasi `serverExternalPackages: ["pdfmake", "pdfkit"]` dan `outputFileTracingIncludes` untuk `"/api/export"` di `next.config.ts` terbukti bekerja dengan baik di lingkungan Vercel.

Fase 6 (Perbaikan Bundling Font PDFKit Turbopack):
- Investigasi dan pembuktian error font pdfkit di runtime produksi (`npm run start`):
  - Pada `pdfkit@0.21.0` (`node_modules/pdfkit/js/pdfkit.js:9251-9279`), font standar dimuat secara dinamis via `createRequire(__filename)('./standard-fonts/<Font>.cjs')`.
  - Ketika dibundel oleh Turbopack Next.js, `__filename` mengarah ke bundle runtime dan pemanggilan tersebut memicu `MODULE_NOT_FOUND`, lalu melempar: `Cannot load the standard font "Helvetica-Bold" from pdfkit's package directory, which is not available once pdfkit is bundled into another file. Either mark pdfkit as external in the bundler...`.
- Solusi minimal di `next.config.ts`:
  - Menambahkan `serverExternalPackages: ["pdfmake", "pdfkit"]` di tingkat root `NextConfig`.
  - Menambahkan `outputFileTracingIncludes: { "/api/export": ["./node_modules/pdfkit/js/standard-fonts/**/*"] }` untuk memastikan seluruh file font standar `.cjs`, `.mjs`, dan chunks ikut ter-trace ke output standalone Vercel.
  - Bagian `turbopack.rules` dipertahankan persis tanpa perubahan.
- Pelajaran penting: Unit test dan build sukses tidak otomatis membuktikan PDF berjalan di runtime produksi; verifikasi penuh membutuhkan `npm run build + npm run start` dan tes di Vercel.

Fase 6 (Perbaikan Bug Export PDF):
- Investigasi dan pembuktian penyebab error 500 PDF:
  - Pada `pdfmake` 0.3.15 di Node.js, `provideFont` (`PDFDocument.js:77`) memeriksa nama font string melalui `validateLocalFile(path)` (`PDFDocument.js:203`).
  - Karena sebelumnya `setLocalAccessPolicy(() => false)` menolak semua string path, nama font bawaan standar ("Helvetica", "Helvetica-Bold", dsb.) ikut terblokir dan melempar `Access to local file denied by resource access policy: Helvetica-Bold`.
- Solusi minimal di `lib/export/pdf.ts`:
  - `setLocalAccessPolicy((path) => ALLOWED_STANDARD_FONTS.has(path))` yang hanya mengizinkan 4 nama font standar yang dipakai ("Helvetica", "Helvetica-Bold", "Helvetica-Oblique", "Helvetica-BoldOblique"). Akses berkas lokal sembarang dan URL tetap ditolak (`setUrlAccessPolicy(() => false)`).
- Penambahan unit test Vitest di `lib/export/pdf.test.ts` (4 tests: expense, income, all selisih positif, all selisih negatif) yang terverifikasi gagal pada kode lama dan lulus pada kode baru. Total 203 tests lulus 100%.

Fase 6 (Langkah 2):
- Pembuatan modul logika murni form export `lib/finance/export-form.ts` dan 16 unit test Vitest di `lib/finance/export-form.test.ts`:
  - `getAvailableYears`: menghasilkan 6 tahun (tahun berjalan mundur 5 tahun).
  - `getAvailableMonths`: membatasi bulan masa depan pada tahun berjalan.
  - `getMonthDateRange`: tanggal 1 sampai akhir bulan (memperhatikan kabisat Februari).
  - `parseContentDispositionFileName`: ekstraksi filename dari header attachment dengan fallback cadangan.
  - `validateCustomDateRange`: validasi kedua tanggal terisi, Dari <= Sampai, dan batas 366 hari inklusif (menggunakan `countDaysInclusive`).
- Implementasi antarmuka klien halaman `/export` di `app/(app)/export/page.tsx` & `ExportContent.tsx`:
  - Satu kartu form (mobile-first, tema gelap), judul "Export Laporan".
  - Pilihan isi: Semua transaksi (default), Pemasukan, Pengeluaran.
  - Pilihan periode: "Per bulan" (default, dropdown Bulan dan Tahun) atau "Pilih tanggal" (input Dari dan Sampai dengan pola pemilih tanggal proyek).
  - Pilihan format: Excel (xlsx, default) atau PDF (pdf).
  - Tombol unduh laporan (min-h 44px, label "Menyiapkan..." saat proses, penanganan state dengan try/finally dan AbortController).
  - Unduhan file via `URL.createObjectURL` dan auto-revoke.
  - Notifikasi pesan sukses ("Laporan diunduh.") dan pesan error server (422 NO_TRANSACTIONS, 401 link ke /login, atau pesan umum) dengan role `alert`/`status`.
  - Integrasi Server Component dengan `await connection()` di dalam `<Suspense>`.
- Pembaruan `docs/product.md` dan `docs/progress.md`.
- Verifikasi menyeluruh: lint bersih (0 error/warning), typecheck lulus (`tsc --noEmit`), 199 tests Vitest lulus 100% (+16 tests dari langkah 1), dan build produksi Turbopack (`next build`) berhasil 100% (18 rute) tanpa peringatan.

Fase 6 (Langkah 1):
- Pembuatan fungsi murni logika export di `lib/finance/export.ts` dan pengujian di `lib/finance/export.test.ts` (21 test case):
  - Validasi parameter `content` (expense|income|all), `format` (xlsx|pdf), `from`, `to` (YYYY-MM-DD valid kalender, from <= to, maksimal 366 hari inklusif, tanggal masa depan diterima).
  - Pembentukan nama berkas: `smart-finance-<isi>-<dari>_<sampai>.<ekstensi>`.
  - Penyiapan data: label periode, kolom tabel, tanda nominal (+/-), dan baris ringkasan (termasuk penanganan selisih negatif).
- Pembuatan modul query database `lib/finance/export-db.ts`:
  - `getExportTransactions`: filter wajib `user_id = user.id`, filter tanggal inklusif `from` s.d. `to`, filter jenis transaksi jika `expense` atau `income`, urutan kronologis stabil (`transaction_date ASC`, `created_at ASC`, `id ASC`).
- Pembuatan generator dokumen:
  - `lib/export/xlsx.ts`: Excel tebal dan beku (*freeze pane* di baris 5), kolom tanggal bertipe Date UTC (`yyyy-mm-dd`), kolom nominal angka berformat Rupiah bertanda (`"+"\Rp\ #,##0` / `"-"\Rp\ #,##0`), baris ringkasan tebal.
  - `lib/export/pdf.ts`: Dokumen A4 portrait, standard 14 fonts (`Helvetica`), layout tabel bersih dengan *word-wrap*, nominal rata kanan, ringkasan total, footer dinamis "Halaman X dari N".
- Pembuatan endpoint produksi `GET /api/export` di `app/api/export/route.ts`:
  - Verifikasi pengguna server (401 jika unauthenticated).
  - Validasi query Zod (400 dengan error fields spesifik jika ada parameter tidak valid).
  - Penolakan jika tidak ada transaksi (422 `NO_TRANSACTIONS`, "Tidak ada transaksi pada periode ini").
  - Menghasilkan binary response bertipe `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` atau `application/pdf` dengan header `Content-Disposition: attachment`.
- Penghapusan folder route sementara `app/api/export-spike/`.
- Sinkronisasi dokumentasi `docs/api.md`, `docs/product.md`, `docs/tech-stack.md`, dan `docs/progress.md`.
- Verifikasi menyeluruh: lint bersih (0 error/warning), typecheck lulus (`tsc --noEmit`), 183 tests Vitest lulus 100% (+21 tests dari langkah 0), dan build produksi Turbopack (`next build`) berhasil 100% (18 rute) tanpa peringatan.

Fase 6 (Langkah 0):
- Pemasangan pustaka export: `exceljs@4.4.0` dan `pdfmake@0.3.15`, beserta devDependency `@types/pdfmake@0.3.3`.
- Pembuatan endpoint sementara `GET /api/export-spike?format=xlsx|pdf` di `app/api/export-spike/route.ts`:
  - Proteksi otentikasi server (401 jika belum login) dan validasi parameter query `format` (400 jika selain xlsx atau pdf).
  - Excel: workbook tebal & freeze baris header, format tanggal sungguhan (UTC Date), format angka Rupiah (`"Rp "#,##0`), ringkasan total pemasukan/pengeluaran/selisih, unduhan attachment `.xlsx`.
  - PDF: dokumen A4 portrait, standard 14 fonts (Helvetica) tanpa file TTF eksternal, tabel bergaris horizontal ringan, nominal rata kanan, ringkasan total, footer dinamis "Halaman X dari N", unduhan attachment `.pdf`.
  - Catatan Next.js 16 (Turbopack): Route segment config `export const dynamic = "force-dynamic"` ditolak karena tidak kompatibel dengan `nextConfig.cacheComponents` aktif; Next.js secara otomatis menetapkan route sebagai Dynamic (`ƒ`) melalui pembacaan `request.nextUrl` dan cookie otentikasi.
- Verifikasi menyeluruh: lint bersih (0 error/warning), typecheck lulus (`tsc --noEmit`), 162 unit tests Vitest lulus 100%, dan build produksi Turbopack (`next build`) berhasil 100% (18 route, tanpa peringatan).

Fase 5 (Langkah 3):
- Audit dan sinkronisasi dokumentasi proyek setelah Fase 5:
  - `docs/api.md`: Verifikasi kontrak `GET /api/chart` (query `level` & `anchor`, respons sukses `{ level, buckets }`, error 400 VALIDATION_ERROR, 401 UNAUTHORIZED, 500).
  - `docs/product.md`: Penyelarasan definisi grafik (empat tingkat tampilan, pemotongan minggu di batas bulan, interaksi klik batang ke `/transaksi`, dan grafik ringkas Beranda).
  - `docs/tech-stack.md`: Verifikasi Recharts 3.11.0 tercatat final sebagai library visualisasi data.
  - `docs/progress.md`: Penyelesaian Fase 5 (Langkah 0 s.d. 3), pencatatan keterbatasan keyboard Recharts 3.11.0, peringkasan riwayat langkah lama, dan penetapan Fase 6 sebagai fokus berikutnya.
- Verifikasi menyeluruh: lint bersih (0 error/warning), typecheck lulus, 162 tests Vitest lulus 100%, dan build produksi Next.js 16 (webpack) berhasil 100% (saat itu memakai webpack; sejak perbaikan deploy build memakai Turbopack, lihat Catatan Penting: Build dan Tailwind).

Fase 5 (Selesai Penuh - Langkah 0 s.d. 3):
- Langkah 0: Fungsi periode murni grafik (`generateDayBuckets`, `generateWeekBuckets` dengan pemotongan batas bulan, `generateMonthBuckets`), skema validasi Zod `chartQuerySchema`, fungsi agregasi database `getChartData` (filter wajib `user_id`, satu query agregasi efisien `SUM`/`GROUP BY`), dan route handler `GET /api/chart` (401 jika unauthenticated, 400 jika query tidak valid).
- Langkah 1: Instalasi `recharts@3.11.0` (kompatibel React 19), helper navigasi & label `lib/finance/chart-nav.ts` (`shiftAnchor`, `canGoNext`, `formatBucketLabel`, `formatPeriodTitle`, `formatRupiahRingkas`), komponen grafik `components/TransactionBarChart.tsx`, dan halaman `/grafik` (4 tingkat: Harian, Mingguan, Bulanan, Tahunan; navigasi periode; handling loading, error, empty state, dan refresh `window.focus`).
- Langkah 2: Interaksi klik batang grafik menuju filter `/transaksi?from=...&to=...` via `buildBucketTransactionUrl` (klik kolom penuh pada `BarChart` membaca `activeTooltipIndex ?? activeIndex` dan fallback `Bar`). Kartu "Grafik minggu ini" di Beranda (`HomeChartSection.tsx`) level `day` (Senin–Minggu) ber-anchor `todayWIB()` di client via `useSyncExternalStore` (bebas error prerender `Date.now()`).
- Keterbatasan Keyboard Recharts 3.11.0: `keyboardEventsMiddleware` internal Recharts 3.11 hanya menangani navigasi visual tooltip (panah kiri/kanan dan enter untuk toggle lock tooltip), tanpa mengekspos callback klik aksi domain ke wrapper luar. Navigasi klik batang dilayani melalui pointer/touch pada seluruh kolom bar.
- Langkah 3: Audit dokumen (`docs/api.md`, `docs/product.md`, `docs/tech-stack.md`, `docs/progress.md`) dan verifikasi akhir.

Fase 4 (Selesai Penuh - Langkah 0 s.d. 3):
- Langkah 0: Endpoint `GET /api/summary`, skema validasi query, agregasi database (`SUM`/`COALESCE`, filter `user_id = user.id`), unit test.
- Langkah 1: Kartu Saldo (`/api/balance`) dan kartu Ringkasan Periode (`GET /api/summary`) dengan pemilih periode ("Bulan ini", "Minggu ini", "Pilih tanggal"). Penanganan `Date.now()` SSR via `useSyncExternalStore`.
- Langkah 2: Bagian 5 Transaksi Terbaru (`HomeRecentTransactions`), tautan "Lihat semua", penanganan pengguna baru ("Catat pemasukan pertamamu"), serta penyegaran state saat kembali ke Beranda (`window.focus`).
- Langkah 3: Penanganan SSR prerender `Date.now()` pada Server Component `/` dan `/akun` via `await connection()` dari `next/server` sebelum auth Supabase. Sinkronisasi dokumen dan config.

Fase 3 (Selesai Penuh - Transaksi & Filter):
- CRUD Transaksi: Tambah, edit, hapus (konfirmasi dialog), daftar (kartu mobile, tabel desktop), paginasi keyset cursor. Mutasi dilindungi advisory lock dan validasi saldo server.
- Filter & Periode: Fungsi murni `period.ts` (`monthRange`, `weekRange`) dan `filters.ts` (`parseFilters`, `buildSearchString`, `buildApiQuery`). Komponen `TransactionFilterBar` (pencarian debounce, filter jenis & periode, panel mobile).
- Perbaikan Khusus: Header `Content-Type: application/json` pada mutasi DELETE klien, mode kustom filter tanggal mandiri, dan logging aman 500 server.

## Tugas Berikutnya
Fase 7: Edukasi dan Motivasi, footer, dan perapian akhir aplikasi.

## Catatan Penting
- Sinkronisasi Branch dan Riwayat Merge:
  - PR #9 dan #10 dari branch fase-6-export sempat ter-merge ke main sebelum fase selesai, sehingga main memuat route sementara export-spike sampai PR Fase 6 yang sebenarnya digabung; sebelum menggabung PR selalu periksa dengan git log --oneline origin/main..<branch>.
- Build dan Tailwind:
  - Script build adalah "next build" (Turbopack), tanpa --webpack.
  - Tailwind aktif hanya lewat turbopack.rules di next.config.ts (loader @tailwindcss/turbopack), tanpa postcss.config.
  - Build webpack tidak memproses Tailwind sehingga halaman produksi tampil tanpa gaya, jadi --webpack jangan ditambahkan kembali.
  - npm run dev dan npm run build sama-sama Turbopack; selalu uji juga lewat npm run build + npm run start.
- Deploy:
  - Aplikasi di-deploy ke Vercel dari branch main (Production Branch harus main); tes produksi lengkap sudah dilakukan developer.
  - Supabase Redirect URLs memuat alamat Vercel dan http://localhost:3000/**.
  - DATABASE_URL memakai Transaction pooler (port 6543) dengan prepare: false.
  - DATABASE_MIGRATION_URL (Session pooler, port 5432) hanya di laptop.
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
- Pengujian manual interaksi kartu ringkasan dan kartu saldo di Beranda (uji tombol Bulan ini, Minggu ini, Pilih tanggal kustom, serta tombol Coba lagi saat offline/error).
- Pengujian manual bagian Transaksi Terbaru di Beranda (kondisi pengguna baru "Catat pemasukan pertamamu", kondisi terisi 5 transaksi di mobile & desktop, serta tombol Coba lagi saat offline).
- Pengujian manual visualisasi grafik di `/grafik` (perpindahan tab Harian, Mingguan, Bulanan, Tahunan; tombol Sebelumnya/Berikutnya; tooltip; dan kondisi tanpa transaksi).
