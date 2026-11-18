# Aturan Agen Coding - Smart Finance

## 1. Identitas Proyek
- **Proyek**: Smart Finance, aplikasi pencatat keuangan multi-pengguna (web, mobile-first, tema gelap).
- **Pembuat**: Nasren Sembiring.
- **Detail Produk**: Rujuk [docs/product.md](file:///c:/Users/USER/Desktop/Smart-Finance/docs/product.md).

## 2. Peran Agent: Eksekutor
Perencanaan dilakukan di luar repo. Kerjakan hanya isi prompt.
- Kerjakan persis yang diminta: tidak lebih, tidak kurang.
- Dilarang membuat rencana mandiri atau artifact (Task List, Implementation Plan, Walkthrough) kecuali diminta prompt.
- Dilarang menambah fitur, dependency, refactor, atau perbaikan "sekalian" di luar permintaan.
- Jika prompt ambigu atau bertabrakan dengan kode: berhenti dan ajukan satu pertanyaan spesifik. Jangan menebak atau berimprovisasi.
- Masalah di luar tugas: laporkan saja, jangan perbaiki sendiri.
- Jika dokumen yang dirujuk belum ada, sampaikan langsung; jangan mengarang isinya.

## 3. Efisiensi Token (Wajib)
Sesi dimulai dari nol karena pergantian akun reguler.
- Awal sesi: baca hanya AGENTS.md, docs/progress.md, dan file yang disebut di prompt.
- Dilarang memindai atau membaca seluruh repo atau satu folder penuh.
- Baca file di `docs/` hanya yang relevan dengan tugas aktif.
- Dilarang membuka: `node_modules`, `.next`, `.git`, `package-lock.json`, file hasil generate, serta migrasi lama (kecuali tugas terkait migrasi).
- Gunakan pencarian terarah (nama fungsi atau file spesifik), hindari penjelajahan luas.
- Tanyakan terlebih dahulu jika membutuhkan file yang tidak disebut di prompt.
- Dilarang membaca ulang file yang telah dibaca dalam sesi yang sama.
- Perubahan kecil: edit bagian yang berubah, jangan menulis ulang seluruh file.
- Buat laporan yang singkat dan padat.

## 4. Anti-Halusinasi
- Dilarang mengarang nama fungsi, kolom, tabel, endpoint, paket, atau opsi konfigurasi. Pastikan ada di kode, skema Drizzle, atau dokumentasi.
- Baca skema Drizzle sebelum menulis query.
- Pastikan paket terdaftar di `package.json` sebelum melakukan import.
- Ikuti versi paket di `package.json` dan dokumentasi resmi versi tersebut (Next.js, Drizzle, Tailwind, Supabase cepat berubah).
- Dilarang menyatakan "sudah jalan" sebelum verifikasi benar-benar dieksekusi.
- Pisahkan fakta dari asumsi; tuliskan seluruh asumsi pada laporan akhir.
- Jika tidak yakin: katakan dan tanyakan.

## 5. Standar Teknologi
- **Stack Utama**: Next.js App Router (bukan Pages Router) + TypeScript strict; Supabase (PostgreSQL + Auth, login Google saja); Drizzle ORM; Tailwind CSS; Hosting Vercel (serverless, tanpa penyimpanan file lokal).
- **Pustaka Tambahan**: Rujuk [docs/tech-stack.md](file:///c:/Users/USER/Desktop/Smart-Finance/docs/tech-stack.md) (validasi, chart, test, export). Agent dilarang memilih library sendiri.

## 6. Aturan Inti Bisnis
Sumber lengkap: [docs/product.md](file:///c:/Users/USER/Desktop/Smart-Finance/docs/product.md).
- Saldo DIHITUNG dari total pemasukan dikurangi total pengeluaran; dilarang menyimpan saldo sebagai nilai statis tersendiri.
- Pengeluaran melebihi saldo DITOLAK dengan pesan "Saldo tidak cukup"; validasi wajib di level SERVER; aturan ini berlaku juga saat menghapus atau mengurangi nilai pemasukan.
- Nominal berupa bilangan bulat Rupiah, dilarang menggunakan float.
- Zona waktu WIB. Perhitungan minggu dimulai Senin, dipotong di batas pergantian bulan.
- Pengeluaran wajib memiliki keterangan; pemasukan wajib memiliki sumber.
- Tidak ada fitur kategori.
- Isolasi data pengguna menggunakan Row Level Security (RLS).
- Teks antarmuka sepenuhnya menggunakan Bahasa Indonesia.
- Warna hanya menggunakan token Tailwind (rujuk [docs/design.md](file:///c:/Users/USER/Desktop/Smart-Finance/docs/design.md)); dilarang menulis kode hex langsung pada komponen.
- Kalimat motivasi tersimpan di satu file statis; agent dilarang menambah atau mengubah isinya.

## 7. Di Luar Cakupan v1 (Dilarang Dikerjakan)
- Transaksi berulang, kategori, banyak dompet, anggaran, target tabungan, tema terang, dan PWA.

## 8. Batasan dan Larangan
- **Wajib Dilakukan**: Jalankan lint, typecheck, test, dan build sebelum selesai (gunakan perintah dari `package.json`); simpan rahasia hanya di environment variable.
- **Wajib Tanya Dulu**: Menambah dependency; mengubah skema database atau membuat migrasi; mengubah aturan bisnis; mengubah file di luar prompt; mengubah konfigurasi Vercel atau Supabase.
- **Dilarang Keras**:
  - Mengedit `.env*` atau meng-commit rahasia.
  - Memakai service-role key Supabase di kode browser.
  - Menghapus atau mengubah migrasi yang sudah ada.
  - Menggunakan tipe `any` tanpa alasan tertulis.
  - Menggunakan Pages Router.
  - Mengarang kutipan atau konten motivasi.
  - MENJALANKAN PERINTAH GIT APA PUN (`add`, `commit`, `push`, `pull`, `status`, `diff`, `log`, dll.). Git dikelola manual oleh developer.

## 9. Alur Kerja Tugas
1. Baca prompt; jika ambigu atau bertabrakan dengan kode, berhenti dan tanya.
2. Kerjakan instruksi sesuai prompt, satu perubahan logis per langkah.
3. Verifikasi dengan menjalankan lint, typecheck, test, dan build.
4. Perbarui [docs/progress.md](file:///c:/Users/USER/Desktop/Smart-Finance/docs/progress.md).
5. Kirim laporan akhir lalu BERHENTI, tanpa menjalankan perintah commit atau push.

## 10. Definition of Done
- Lint, typecheck, test, dan build lulus verifikasi.
- Bersih dari sisa `console.log`.
- `docs/progress.md` telah diperbarui.
- Laporan akhir diserahkan sesuai format.

## 11. Format Laporan Akhir
- **Diubah**: File yang dimodifikasi beserta ringkasannya.
- **Dijalankan**: Perintah yang dieksekusi beserta hasilnya.
- **Belum dikerjakan atau gagal**: Item yang tertunda beserta alasannya.
- **Asumsi**: Daftar asumsi yang digunakan.
- **Pertanyaan**: Hal yang perlu dikonfirmasi kepada developer.
