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
- **Validasi Teks**: Pengeluaran wajib memiliki keterangan (tujuan transaksi); pemasukan wajib memiliki sumber.
- **Nominal**: Bilangan bulat Rupiah (dilarang float).
- **Tanggal**: Diizinkan tanggal mundur.
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
- **Minggu**: Dimulai hari SENIN. Jika melewati pergantian bulan, minggu dipotong di batas bulan. Jumlah seluruh minggu harus sama dengan total bulan tanpa hitung ganda.

## 7. Grafik
- Menampilkan batang pemasukan dan pengeluaran berdampingan menggunakan satu komponen yang dipakai ulang.
- **Skala Periode**:
  - Harian: 7 batang (hari dalam 1 minggu).
  - Mingguan: 4-5 batang (minggu dalam 1 bulan).
  - Bulanan: 12 batang (bulan dalam 1 tahun).
  - Tahunan: Semua tahun yang memiliki data.
- Periode default adalah periode yang sedang berjalan.
- Interaksi: Klik atau sentuh batang akan membuka halaman Transaksi dengan filter periode tersebut.
- Dilarang membuat grafik porsi per kategori.

## 8. Pencarian, Filter, dan Export
- **Daftar Transaksi**: Filter berdasarkan jenis dan periode; pencarian melalui keterangan atau sumber.
- **Export Laporan**:
  - Pilihan isi: (a) pengeluaran + total, (b) pemasukan + total, (c) semua + selisih.
  - Pilihan periode: Per bulan atau rentang tanggal.
  - Format berkas: Excel atau PDF.

## 9. Edukasi & Motivasi
- Berisi hanya kalimat motivasi keuangan ASLI tanpa nama tokoh; tanpa artikel atau tips.
- Disimpan dalam satu file statis; hanya boleh diubah langsung oleh developer.
- Tanpa fitur admin dan tanpa tabel database.
- Tampilan: "Kalimat hari ini" di posisi atas, daftar lengkap di bawah.

## 10. Kondisi Khusus Antarmuka
- **Pengguna Baru**: Menampilkan saldo 0 disertai ajakan "Catat pemasukan pertamamu".
- **Data Kosong**: Menampilkan pesan ramah, bukan layar kosong.
- **Status Error & 404**: Halaman tidak ditemukan dan kegagalan memuat memiliki antarmuka tersendiri.

## 11. Di Luar Cakupan v1
- Transaksi berulang.
- Fitur kategori.
- Multi-dompet.
- Anggaran.
- Target tabungan.
- Tema terang.
- Progressive Web App (PWA).

## 12. Belum Diputuskan (Tanya Developer, Jangan Menebak)
- Izin tanggal transaksi di masa depan.
- Batas panjang karakter untuk keterangan dan sumber.
- Urutan serta jumlah item per halaman pada daftar Transaksi.
- Format tampilan tanggal dan nominal uang.
- Struktur kolom dan tata letak dokumen Excel serta PDF.
