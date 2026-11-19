# Spesifikasi API Server - Smart Finance

Dokumen ini mendefinisikan kontrak endpoint REST API Smart Finance.

## 1. Format Respons Seragam

### Sukses
```json
{
  "data": { ... }
}
```

### Gagal
```json
{
  "error": {
    "code": "STRING_ERROR_CODE",
    "message": "Pesan deskriptif dalam Bahasa Indonesia",
    "fields": {
      "nama_field": "Pesan kesalahan spesifik"
    }
  }
}
```

## 2. Aturan Otentikasi dan Keamanan
- Verifikasi pengguna dilakukan di server menggunakan Supabase Server Client (`supabase.auth.getUser()`).
- Permintaan tanpa sesi otentikasi dialihkan oleh `proxy.ts` ke `/login` sebelum mencapai handler. Jika permintaan langsung menjangkau handler tanpa otentikasi (misal panggilan API via curl/fetch non-browser), handler mengembalikan respons HTTP `401 Unauthorized` sebagai lapisan pertahanan ganda.
- Nilai `user_id` HANYA diekstrak dari kredensial server terverifikasi; dilarang menerima `user_id` dari payload body atau parameter URL.
- Seluruh query Drizzle wajib menyertakan filter eksplisit `user_id = user.id`.
- Mutasi data (`POST`, `PATCH`, `DELETE`) wajib menyertakan header `Content-Type: application/json` (jika tidak: respons `415 Unsupported Media Type`).

## 3. Tabel Endpoint

| Metode | Path | Payload / Parameter | Status Sukses | Kode Error Potensial |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/transactions` | Body: `{ type, amount, description, transaction_date }` | `201 Created` | `400` (VALIDATION_ERROR, INVALID_JSON), `401` (UNAUTHORIZED), `415` (UNSUPPORTED_MEDIA_TYPE), `422` (INSUFFICIENT_BALANCE), `500` |
| `GET` | `/api/transactions` | Query: `type`, `from`, `to`, `q`, `cursor` | `200 OK` (`{ items, nextCursor }`) | `400` (VALIDATION_ERROR, INVALID_CURSOR), `401` (UNAUTHORIZED), `500` |
| `GET` | `/api/transactions/[id]` | Path: `id` (UUID) | `200 OK` (`Transaction`) | `400` (INVALID_ID), `401` (UNAUTHORIZED), `404` (NOT_FOUND), `500` |
| `PATCH` | `/api/transactions/[id]` | Path: `id` (UUID)<br>Body: minimal 1 field parsial | `200 OK` (`Transaction`) | `400` (VALIDATION_ERROR, INVALID_ID, INVALID_JSON), `401` (UNAUTHORIZED), `404` (NOT_FOUND), `415`, `422` (INSUFFICIENT_BALANCE), `500` |
| `DELETE` | `/api/transactions/[id]` | Path: `id` (UUID) | `200 OK` (`{ id }`) | `400` (INVALID_ID), `401` (UNAUTHORIZED), `404` (NOT_FOUND), `415`, `422` (INSUFFICIENT_BALANCE), `500` |
| `GET` | `/api/balance` | - | `200 OK` (`{ balance }`) | `401` (UNAUTHORIZED), `500` |
| `GET` | `/api/summary` | Query: `from`, `to` (wajib, YYYY-MM-DD) | `200 OK` (`{ totalIncome, totalExpense, difference }`) | `400` (VALIDATION_ERROR), `401` (UNAUTHORIZED), `500` |

## 4. Mekanisme Keamanan Saldo
- Operasi mutasi penambahan, pembaruan nominal/jenis, dan penghapusan transaksi berjalan di dalam blok transaksi database dengan advisory lock `pg_advisory_xact_lock(hashtext(userId))`.
- Jika saldo akumulasi menjadi `< 0`, mutasi dibatalkan dan API mengembalikan status `422 Unprocessable Entity` dengan error code `"INSUFFICIENT_BALANCE"` dan pesan `"Saldo tidak cukup"`.
