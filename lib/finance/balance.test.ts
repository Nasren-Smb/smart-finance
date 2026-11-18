import { describe, it, expect } from "vitest";
import {
  calculateBalance,
  getTransactionEffect,
  validateAddTransaction,
  validateUpdateTransaction,
  validateDeleteTransaction,
  InsufficientBalanceError,
} from "./balance";

describe("Aturan Saldo - lib/finance/balance.ts", () => {
  it("saldo awal 0 jika tidak ada riwayat transaksi", () => {
    expect(calculateBalance([])).toBe(0);
  });

  it("menghitung efek transaksi dengan benar", () => {
    expect(getTransactionEffect({ type: "income", amount: 50000 })).toBe(50000);
    expect(getTransactionEffect({ type: "expense", amount: 20000 })).toBe(-20000);
  });

  it("menghitung akumulasi saldo seluruh riwayat transaksi", () => {
    const history = [
      { type: "income" as const, amount: 100000 },
      { type: "expense" as const, amount: 30000 },
      { type: "income" as const, amount: 50000 },
      { type: "expense" as const, amount: 20000 },
    ];
    expect(calculateBalance(history)).toBe(100000);
  });

  describe("validateAddTransaction", () => {
    it("menambah pemasukan meningkatkan saldo", () => {
      const balance = validateAddTransaction(0, { type: "income", amount: 100000 });
      expect(balance).toBe(100000);
    });

    it("menambah pengeluaran lebih kecil dari saldo diperbolehkan", () => {
      const balance = validateAddTransaction(100000, {
        type: "expense",
        amount: 40000,
      });
      expect(balance).toBe(60000);
    });

    it("menambah pengeluaran sama dengan saldo (saldo menjadi tepat 0) diperbolehkan", () => {
      const balance = validateAddTransaction(50000, {
        type: "expense",
        amount: 50000,
      });
      expect(balance).toBe(0);
    });

    it("menambah pengeluaran lebih besar dari saldo ditolak dengan InsufficientBalanceError", () => {
      expect(() =>
        validateAddTransaction(50000, { type: "expense", amount: 60000 })
      ).toThrowError(InsufficientBalanceError);

      expect(() =>
        validateAddTransaction(50000, { type: "expense", amount: 60000 })
      ).toThrowError("Saldo tidak cukup");
    });
  });

  describe("validateUpdateTransaction", () => {
    it("mengubah nominal pengeluaran naik yang masih dalam batas saldo", () => {
      // Saldo 50.000, pengeluaran lama 20.000 diubah menjadi 40.000
      // Saldo baru = 50.000 - (-20.000) + (-40.000) = 30.000
      const balance = validateUpdateTransaction(
        50000,
        { type: "expense", amount: 20000 },
        { type: "expense", amount: 40000 }
      );
      expect(balance).toBe(30000);
    });

    it("mengubah nominal pengeluaran naik melebihi saldo ditolak", () => {
      // Saldo 10.000, pengeluaran lama 20.000 diubah menjadi 40.000
      // Saldo baru = 10.000 - (-20.000) + (-40.000) = -10.000 -> DITOLAK
      expect(() =>
        validateUpdateTransaction(
          10000,
          { type: "expense", amount: 20000 },
          { type: "expense", amount: 40000 }
        )
      ).toThrowError(InsufficientBalanceError);
    });

    it("mengubah nominal pengeluaran turun diperbolehkan", () => {
      // Saldo 10.000, pengeluaran lama 30.000 diubah menjadi 10.000
      // Saldo baru = 10.000 - (-30.000) + (-10.000) = 30.000
      const balance = validateUpdateTransaction(
        10000,
        { type: "expense", amount: 30000 },
        { type: "expense", amount: 10000 }
      );
      expect(balance).toBe(30000);
    });

    it("mengubah jenis pemasukan menjadi pengeluaran diperbolehkan jika saldo cukup", () => {
      // Saldo 100.000, pemasukan lama 20.000 diubah menjadi pengeluaran 20.000
      // Saldo baru = 100.000 - 20.000 + (-20.000) = 60.000
      const balance = validateUpdateTransaction(
        100000,
        { type: "income", amount: 20000 },
        { type: "expense", amount: 20000 }
      );
      expect(balance).toBe(60000);
    });

    it("mengubah jenis pemasukan menjadi pengeluaran ditolak jika saldo tidak cukup", () => {
      // Saldo 30.000, pemasukan lama 20.000 diubah menjadi pengeluaran 20.000
      // Saldo baru = 30.000 - 20.000 + (-20.000) = -10.000 -> DITOLAK
      expect(() =>
        validateUpdateTransaction(
          30000,
          { type: "income", amount: 20000 },
          { type: "expense", amount: 20000 }
        )
      ).toThrowError(InsufficientBalanceError);
    });

    it("mengubah jenis pengeluaran menjadi pemasukan diperbolehkan", () => {
      // Saldo 20.000, pengeluaran lama 15.000 diubah menjadi pemasukan 15.000
      // Saldo baru = 20.000 - (-15.000) + 15.000 = 50.000
      const balance = validateUpdateTransaction(
        20000,
        { type: "expense", amount: 15000 },
        { type: "income", amount: 15000 }
      );
      expect(balance).toBe(50000);
    });

    it("mengecilkan pemasukan yang sudah terpakai ditolak", () => {
      // Saldo 5.000, pemasukan lama 50.000 diperkecil jadi 10.000 (selisih berkurang 40.000)
      // Saldo baru = 5.000 - 50.000 + 10.000 = -35.000 -> DITOLAK
      expect(() =>
        validateUpdateTransaction(
          5000,
          { type: "income", amount: 50000 },
          { type: "income", amount: 10000 }
        )
      ).toThrowError(InsufficientBalanceError);
    });
  });

  describe("validateDeleteTransaction", () => {
    it("menghapus pengeluaran diperbolehkan dan mengembalikan saldo", () => {
      // Saldo 20.000, pengeluaran 10.000 dihapus
      // Saldo baru = 20.000 - (-10.000) = 30.000
      const balance = validateDeleteTransaction(20000, {
        type: "expense",
        amount: 10000,
      });
      expect(balance).toBe(30000);
    });

    it("menghapus pemasukan yang uangnya belum terpakai (saldo cukup) diperbolehkan", () => {
      // Saldo 100.000, pemasukan 40.000 dihapus
      // Saldo baru = 100.000 - 40.000 = 60.000
      const balance = validateDeleteTransaction(100000, {
        type: "income",
        amount: 40000,
      });
      expect(balance).toBe(60000);
    });

    it("menghapus pemasukan yang uangnya sudah terpakai ditolak", () => {
      // Saldo 10.000, pemasukan 50.000 dihapus
      // Saldo baru = 10.000 - 50.000 = -40.000 -> DITOLAK
      expect(() =>
        validateDeleteTransaction(10000, { type: "income", amount: 50000 })
      ).toThrowError(InsufficientBalanceError);
    });
  });
});
