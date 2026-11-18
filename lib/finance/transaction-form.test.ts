import { describe, it, expect } from "vitest";
import {
  getChangedTransactionFields,
  mapDeleteTransactionError,
  mapEditTransactionError,
  type TransactionFormState,
  type InitialTransactionData,
} from "./transaction-form";

describe("lib/finance/transaction-form.ts", () => {
  const baseInitial: InitialTransactionData = {
    id: "tx-123",
    type: "expense",
    amount: 50000,
    description: "Makan siang",
    transaction_date: "2026-11-18",
  };

  describe("getChangedTransactionFields", () => {
    it("mengembalikan null jika tidak ada perubahan sama sekali", () => {
      const current: TransactionFormState = {
        type: "expense",
        amount: 50000,
        description: "Makan siang",
        transaction_date: "2026-11-18",
      };

      const diff = getChangedTransactionFields(baseInitial, current);
      expect(diff).toBeNull();
    });

    it("mengabaikan spasi leading/trailing pada description saat membandingkan", () => {
      const current: TransactionFormState = {
        type: "expense",
        amount: 50000,
        description: "  Makan siang  ",
        transaction_date: "2026-11-18",
      };

      const diff = getChangedTransactionFields(baseInitial, current);
      expect(diff).toBeNull();
    });

    it("mendeteksi hanya perubahan nominal (amount)", () => {
      const current: TransactionFormState = {
        type: "expense",
        amount: 75000,
        description: "Makan siang",
        transaction_date: "2026-11-18",
      };

      const diff = getChangedTransactionFields(baseInitial, current);
      expect(diff).toEqual({
        amount: 75000,
      });
    });

    it("mendeteksi hanya perubahan keterangan yang di-trim", () => {
      const current: TransactionFormState = {
        type: "expense",
        amount: 50000,
        description: "  Makan siang bersama teman  ",
        transaction_date: "2026-11-18",
      };

      const diff = getChangedTransactionFields(baseInitial, current);
      expect(diff).toEqual({
        description: "Makan siang bersama teman",
      });
    });

    it("mendeteksi perubahan jenis transaksi (type)", () => {
      const current: TransactionFormState = {
        type: "income",
        amount: 50000,
        description: "Makan siang",
        transaction_date: "2026-11-18",
      };

      const diff = getChangedTransactionFields(baseInitial, current);
      expect(diff).toEqual({
        type: "income",
      });
    });

    it("mendeteksi perubahan tanggal transaksi", () => {
      const current: TransactionFormState = {
        type: "expense",
        amount: 50000,
        description: "Makan siang",
        transaction_date: "2026-11-17",
      };

      const diff = getChangedTransactionFields(baseInitial, current);
      expect(diff).toEqual({
        transaction_date: "2026-11-17",
      });
    });

    it("mendeteksi banyak field yang berubah sekaligus", () => {
      const current: TransactionFormState = {
        type: "income",
        amount: 100000,
        description: "Bonus mingguan",
        transaction_date: "2026-11-15",
      };

      const diff = getChangedTransactionFields(baseInitial, current);
      expect(diff).toEqual({
        type: "income",
        amount: 100000,
        description: "Bonus mingguan",
        transaction_date: "2026-11-15",
      });
    });
  });

  describe("mapDeleteTransactionError", () => {
    it("menangani 401 dan redirected sebagai sesi berakhir", () => {
      const res = mapDeleteTransactionError(401);
      expect(res.isSessionExpired).toBe(true);
      expect(res.message).toBe("Sesi berakhir. Silakan masuk lagi.");

      const resRedir = mapDeleteTransactionError(200, undefined, true);
      expect(resRedir.isSessionExpired).toBe(true);
      expect(resRedir.message).toBe("Sesi berakhir. Silakan masuk lagi.");
    });

    it("menangani 422 INSUFFICIENT_BALANCE dengan pesan spesifik penghapusan", () => {
      const res = mapDeleteTransactionError(422, {
        code: "INSUFFICIENT_BALANCE",
        message: "Saldo tidak cukup",
      });
      expect(res.message).toBe("Transaksi ini tidak bisa dihapus karena saldo akan menjadi minus.");
    });

    it("menangani 404 sebagai transaksi tidak ditemukan", () => {
      const res = mapDeleteTransactionError(404);
      expect(res.message).toBe("Transaksi tidak ditemukan atau sudah dihapus.");
    });

    it("menangani error lainnya secara generik", () => {
      const res = mapDeleteTransactionError(500);
      expect(res.message).toBe("Terjadi kesalahan. Coba lagi.");
    });
  });

  describe("mapEditTransactionError", () => {
    it("menangani 401 dan redirected sebagai sesi berakhir", () => {
      const res = mapEditTransactionError(401);
      expect(res.isSessionExpired).toBe(true);
      expect(res.message).toBe("Sesi berakhir. Silakan masuk lagi.");
    });

    it("menangani 404 sebagai transaksi tidak ditemukan", () => {
      const res = mapEditTransactionError(404);
      expect(res.message).toBe("Transaksi tidak ditemukan.");
    });

    it("menangani 422 INSUFFICIENT_BALANCE", () => {
      const res = mapEditTransactionError(422, {
        code: "INSUFFICIENT_BALANCE",
        message: "Saldo tidak cukup",
      });
      expect(res.message).toBe("Saldo tidak cukup. Perubahan ini akan membuat saldo menjadi minus.");
    });

    it("menangani 400 dengan pesan field validasi", () => {
      const res = mapEditTransactionError(400, {
        code: "VALIDATION_ERROR",
        message: "Data tidak valid",
        fields: { amount: "Nominal harus berupa bilangan bulat positif" },
      });
      expect(res.fields).toEqual({ amount: "Nominal harus berupa bilangan bulat positif" });
    });
  });
});
