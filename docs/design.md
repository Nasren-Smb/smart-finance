# Panduan Desain - Smart Finance

Dokumen ini adalah sumber kebenaran tampilan; hal yang tidak tercakup harus ditanyakan, bukan dikarang.

## 1. Arah Desain
- Gaya: modern minimalis, tema gelap (abu-abu gelap), mobile-first.
- Tema: hanya tema gelap di v1.
- Penerapan warna: didefinisikan SATU KALI sebagai token di konfigurasi Tailwind (cara penulisan mengikuti versi Tailwind yang terpasang). Komponen hanya memakai token; dilarang menulis kode hex langsung di komponen.

## 2. Palet Warna
| Peran | Hex | Kegunaan |
| :--- | :--- | :--- |
| Latar utama | `#141416` | Background halaman |
| Permukaan | `#1C1C20` | Kartu, form, menu |
| Permukaan terangkat | `#26262B` | Hover, input aktif |
| Garis | `#2E2E34` | Border tipis |
| Teks utama | `#F4F4F5` | Judul, nominal |
| Teks sekunder | `#A1A1AA` | Keterangan, label |
| Teks redup | `#71717A` | Placeholder, hint |
| Aksen | `#60A5FA` | Tombol utama, tautan, elemen aktif |
| Pemasukan | `#34D399` | Nominal dan batang pemasukan |
| Pengeluaran | `#F87171` | Nominal dan batang pengeluaran |
| Peringatan | `#FBBF24` | Pesan seperti "Saldo tidak cukup" |

## 3. Prinsip Desain
- Satu warna aksen saja; hijau dan merah hanya untuk makna uang.
- Tanpa bayangan tebal, cukup border tipis.
- Sudut membulat sedang (sekitar 12 sampai 16 px) dan ruang kosong lega.
- Angka nominal memakai angka berlebar sama (tabular).
- Jangan hanya mengandalkan warna: pemasukan bertanda "+", pengeluaran bertanda "−".
- Elemen yang disentuh harus cukup besar untuk ukuran jempol.

## 4. Tata Letak (Layout)
- **HP (Dirancang Lebih Dulu)**:
  - Menu bawah: Beranda, Transaksi, Grafik, Export, Edukasi.
  - Akun via ikon profil di pojok atas Beranda.
  - Tombol tambah transaksi melayang di pojok bawah.
  - Daftar transaksi berbentuk kartu; form tambah/edit berupa lembar dari bawah.
- **Laptop**:
  - Sidebar di KIRI (bukan atas): nama aplikasi di atas, menu di tengah, Akun di bawah.
  - Konten di kanan dengan susunan kartu 2 sampai 3 kolom.
  - Daftar transaksi berbentuk tabel.
- **Susunan Beranda**: (1) kartu Saldo besar, (2) ringkasan periode (pemasukan, pengeluaran, selisih) dengan pemilih periode, (3) grafik ringkas, (4) transaksi terbaru.
- **Footer**: "© 2026 Smart Finance · Dibuat oleh Nasren Sembiring" (Laptop: bawah area konten; HP: hanya di akhir Beranda dan halaman Login).

## 5. Belum Diputuskan (Tanya Developer, Jangan Menebak)
- Pilihan font (Inter atau Geist).
- Gaya ikon.
- Animasi dan transisi.
