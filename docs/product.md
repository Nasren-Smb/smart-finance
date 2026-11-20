# Spesifikasi Produk - Smart Finance

Dokumen ini mendefinisikan persyaratan fungsional dan perilaku aplikasi Smart Finance; jika kode bertabrakan dengan dokumen ini, agent berhenti dan bertanya.

## 1. Ikhtisar Produk
- Aplikasi pencatat keuangan multi-pengguna.
- Fitur utama: login Google, pencatatan pemasukan dan pengeluaran manual, pemantauan saldo, ringkasan, grafik, serta export laporan.
- Tampilan: mobile-first, tema gelap, antarmuka sepenuhnya Bahasa Indonesia.
- Pembuat: Nasren Sembiring.
- Footer: "© 2026 Smart Finance · Dibuat oleh Nasren Sembiring" (Laptop: bawah area konten; HP: hanya di akhir Beranda dan halaman Login).

## 2. Navigasi dan Tata Letak
- **HP (Mobile)**:
  - Menu bawah: Beranda, Transaksi, Grafik, Export, Edukasi.
  - Akun: ikon profil di pojok atas Beranda.
  - Tombol tambah transaksi: tombol melayang di pojok bawah.
- **Laptop (Desktop)**:
  - Sidebar di KIRI (bukan atas).
  - Menu Akun di bagian bawah sidebar.
  - Kartu konten disusun dalam 2-3 kolom.

## 3. Struktur Halaman
1. **Login**: Satu tombol "Masuk dengan Google".
2. **Beranda**: Kartu Saldo, ringkasan periode, grafik ringkas, transaksi terbaru.
3. **Tambah/Edit Transaksi**: Formulir input (pada HP berupa lembar dari bawah / bottom sheet).
4. **Transaksi**: Daftar, filter, cari, edit, hapus (tampilan kartu di HP, tabel di laptop). "Detail periode" merujuk ke halaman ini dengan filter periode terisi.
5. **Grafik**: Visualisasi data transaksi.
6. **Export**: Unduh laporan transaksi.
7. **Akun**: Informasi akun Google dan tombol Keluar.
8. **Edukasi & Motivasi**: Konten motivasi keuangan.

## 4. Aturan Transaksi
- **Jenis**: Pemasukan atau pengeluaran.
- **Field**: Jenis, nominal, tanggal, teks pendukung.
- **Validasi Teks**: Pengeluaran wajib memiliki keterangan (tujuan transaksi); pemasukan wajib memiliki sumber. Batas maksimal keterangan/sumber adalah 100 karakter setelah di-trim (diterapkan pada validasi aplikasi, belum di database).
- **Nominal**: Bilangan bulat Rupiah (dilarang float).
- **Tanggal**: Diizinkan tanggal mundur. Tanggal transaksi di masa depan DITOLAK (batas maksimal adalah hari ini menurut zona waktu WIB / Asia/Jakarta).
- **Kategori**: TIDAK ADA kategori.
- **Aksi**: Edit dan hapus hanya oleh pemilik transaksi; penghapusan wajib konfirmasi.

## 5. Perhitungan Saldo
- **Rumus**: Total SELURUH pemasukan dikurangi total SELURUH pengeluaran.
- Saldo dihitung dinamis, dilarang disimpan sebagai angka tersendiri.
- Pengguna baru mulai dengan saldo 0. Saldo terbawa antarbulan dan tidak pernah di-reset.
- **Larangan Saldo Negatif**: Saldo tidak boleh minus. Aksi yang membuat saldo < 0 wajib DITOLAK dengan pesan "Saldo tidak cukup".
  - Skenario penolakan: tambah pengeluaran, menaikkan nominal pengeluaran saat edit, menghapus pemasukan, atau mengecilkan nominal pemasukan saat edit.
  - Validasi wajib dieksekusi di level SERVER (browser hanya pelengkap).

## 6. Ringkasan Periode dan Waktu
- **Pilihan Periode**: Bulan, minggu, atau rentang tanggal bebas.
- **Isi**: Total pemasukan, total pengeluaran, dan selisih (pemasukan - pengeluaran) khusus periode tersebut.
- **Pemisahan di Beranda**: Saldo (seluruh riwayat) dan Selisih periode wajib dipisah dengan label jelas agar tidak tertukar.
- **Zona Waktu**: WIB (Asia/Jakarta) untuk semua penentuan hari, minggu, dan bulan.
- **Minggu**: Dimulai hari SENIN sampai MINGGU (minggu kalender penuh), tidak dipotong di batas bulan pada kartu ringkasan Beranda dan filter transaksi. Pada visualisasi batang grafik (Fase 5), minggu disajikan proporsional terhadap bulan tanpa hitung ganda.

## 7. Grafik
- Menampilkan batang pemasukan dan pengeluaran berdampingan menggunakan satu komponen yang dipakai ulang (`TransactionBarChart`).
- **Skala Periode**:
  - Harian (`day`): 7 batang (hari Senin sampai Minggu dalam 1 minggu kalender penuh).
  - Mingguan (`week`): 4-6 batang (minggu dalam 1 bulan kalender, di mana minggu yang melewati batas bulan dipotong di batas bulan agar proporsional tanpa hitung ganda).
  - Bulanan (`month`): 12 batang (bulan Januari sampai Desember dalam 1 tahun kalender).
  - Tahunan (`year`): Semua tahun yang memiliki riwayat transaksi (diurutkan naik).
- Periode default adalah periode yang sedang berjalan.
- **Interaksi**: Klik atau sentuh kolom batang bucket akan membuka halaman Transaksi (`/transaksi?from=...&to=...`) dengan filter periode bucket tersebut.
- **Grafik Ringkas di Beranda**: Kartu "Grafik minggu ini" menampilkan visualisasi 7 batang harian (Senin–Minggu) minggu berjalan dengan tautan "Lihat grafik lengkap" menuju halaman `/grafik`.
- Dilarang membuat grafik porsi per kategori.

## 8. Pencarian, Filter, Daftar Transaksi, dan Export
- **Daftar Transaksi**: Filter berdasarkan jenis dan periode; pencarian melalui keterangan atau sumber.
  - Urutan tampilan: Terbaru dulu (`transaction_date` menurun / DESC, lalu `created_at` menurun / DESC, lalu `id` menurun / DESC agar stabil).
  - Paginasi: 20 item per tampilan dengan tombol "Muat lebih banyak".
- **Export Laporan**:
  - Pilihan isi: (a) pengeluaran + total, (b) pemasukan + total, (c) semua + selisih.
  - Pilihan periode: Per bulan atau rentang tanggal.
  - Format berkas: Excel atau PDF.

## 9. Format Tampilan
- **Nominal**: "Rp 1.250.000" (titik sebagai pemisah ribuan, awalan "Rp ").
- **Tanggal**: "18 Nov 2026" (format Indonesia: tanggal, nama bulan singkat 3 huruf, tahun).

## 10. Edukasi & Motivasi
- Berisi hanya kalimat motivasi keuangan ASLI tanpa nama tokoh; tanpa artikel atau tips.
- Disimpan dalam satu file statis; hanya boleh diubah langsung oleh developer.
- Tanpa fitur admin dan tanpa tabel database.
- Tampilan: "Kalimat hari ini" di posisi atas, daftar lengkap di bawah.

## 11. Kondisi Khusus Antarmuka
- **Pengguna Baru**: Menampilkan saldo 0 disertai ajakan "Catat pemasukan pertamamu".
- **Data Kosong**: Menampilkan pesan ramah, bukan layar kosong.
- **Status Error & 404**: Halaman tidak ditemukan dan kegagalan memuat memiliki antarmuka tersendiri.

## 12. Di Luar Cakupan v1
- Transaksi berulang.
- Fitur kategori.
- Multi-dompet.
- Anggaran.
- Target tabungan.
- Tema terang.
- Progressive Web App (PWA).

## 13. Belum Diputuskan (Tanya Developer, Jangan Menebak)
- Struktur kolom dan tata letak dokumen Excel serta PDF.
