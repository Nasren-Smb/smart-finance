/**
 * Konstanta konfigurasi untuk transaksi dan daftar transaksi.
 */

// Jumlah item transaksi per halaman (tampilan)
export const PAGE_SIZE = 20;

// Batas maksimal panjang karakter keterangan/sumber setelah di-trim (diterapkan pada validasi aplikasi)
export const DESCRIPTION_MAX_LENGTH = 100;

// Urutan pengurutan daftar transaksi:
// Terbaru dulu: transaction_date menurun (DESC), lalu created_at menurun (DESC), lalu id menurun (DESC) agar stabil.
export const TRANSACTION_SORT_ORDER = [
  "transaction_date DESC",
  "created_at DESC",
  "id DESC",
] as const;
