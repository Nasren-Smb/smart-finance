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

## 5. Tipografi dan Ikon
- **Font Utama**: Inter via `next/font/google` (subset latin, variabel CSS `--font-inter`), diterapkan ke seluruh aplikasi menggantikan Geist Sans.
- **Font Monospace**: Geist Mono via `next/font/google` (variabel CSS `--font-geist-mono`) digunakan untuk angka tabular/nominal transaksi.
- **Ikon**: Menggunakan paket `lucide-react` (impor bernama per komponen). Ikon yang benar-benar dipakai:
  - Menu Beranda: `House`
  - Menu Transaksi: `ArrowLeftRight`
  - Menu Grafik: `ChartColumn`
  - Menu Export: `FileDown`
  - Menu Edukasi: `Lightbulb`
  - Profil Akun: `User`
  - Tombol Tambah Transaksi: `Plus`
  - Tombol Keluar: `LogOut`
  - Aksi transaksi: tombol "Edit" dan "Hapus" pada daftar transaksi tetap berupa teks saja, tanpa ikon (`Pencil` dan `Trash2` tidak dipakai).
  - Ikon dekoratif diberi `aria-hidden="true"`, sedangkan tombol berbasis ikon wajib memiliki label aksesibel yang jelas dalam Bahasa Indonesia.
  - Warna ikon mengikuti token warna Tailwind yang sudah ada (status aktif memakai token `accent`). Ukuran berkisar antara 20 sampai 24 px (w-5 h-5 atau w-7 h-7 pada tombol FAB).
- **Favicon & Error Handling**: Favicon aplikasi menggunakan `app/icon.svg` bertema warna aksen dengan inisial "S", serta halaman 404 (`not-found.tsx`) dan penanganan error (`error.tsx`, `global-error.tsx`) menerapkan konsistensi tema gelap dan Bahasa Indonesia.
- **Fokus Global & Skeleton**: Diterapkan aturan fokus global `focus-visible` (outline 2px solid warna aksen, offset 2px) untuk elemen interaktif (tautan, tombol, select, tabindex), dan fallback loading pada Beranda, Akun, serta Tambah Transaksi diselaraskan menggunakan skeleton bertema gelap (`animate-pulse`).

## 6. Belum Diputuskan (Tanya Developer, Jangan Menebak)
- Animasi dan transisi.
