import { describe, it, expect } from "vitest";
import {
  transactionInputSchema,
  transactionTypeSchema,
  transactionDateSchema,
} from "./schemas";

describe("Validasi Zod - lib/finance/schemas.ts", () => {
  describe("Input Valid", () => {
    it("menerima input pemasukan valid", () => {
      const validIncome = {
        type: "income",
        amount: 2500000,
        description: "Gaji Bulanan",
        transaction_date: "2026-11-18",
      };
      const parsed = transactionInputSchema.safeParse(validIncome);
      expect(parsed.success).toBe(true);
    });

    it("menerima input pengeluaran valid", () => {
      const validExpense = {
        type: "expense",
        amount: 50000,
        description: "Makan Siang",
        transaction_date: "2026-02-28",
      };
      const parsed = transactionInputSchema.safeParse(validExpense);
      expect(parsed.success).toBe(true);
    });

    it("melakukan trim pada description", () => {
      const input = {
        type: "expense",
        amount: 15000,
        description: "   Kopi Pagi   ",
        transaction_date: "2026-01-01",
      };
      const parsed = transactionInputSchema.safeParse(input);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.description).toBe("Kopi Pagi");
      }
    });

    it("menerima tanggal di masa depan (kebijakan belum diputuskan)", () => {
      const futureInput = {
        type: "income",
        amount: 500000,
        description: "Projected Bonus",
        transaction_date: "2030-12-31",
      };
      const parsed = transactionInputSchema.safeParse(futureInput);
      expect(parsed.success).toBe(true);
    });
  });

  describe("Pelanggaran Nominal (amount)", () => {
    it("menolak nominal 0", () => {
      const input = {
        type: "income",
        amount: 0,
        description: "Bonus",
        transaction_date: "2026-11-18",
      };
      const parsed = transactionInputSchema.safeParse(input);
      expect(parsed.success).toBe(false);
    });

    it("menolak nominal negatif", () => {
      const input = {
        type: "income",
        amount: -50000,
        description: "Penyesuaian",
        transaction_date: "2026-11-18",
      };
      const parsed = transactionInputSchema.safeParse(input);
      expect(parsed.success).toBe(false);
    });

    it("menolak nominal desimal/float", () => {
      const input = {
        type: "expense",
        amount: 15000.75,
        description: "Kopi",
        transaction_date: "2026-11-18",
      };
      const parsed = transactionInputSchema.safeParse(input);
      expect(parsed.success).toBe(false);
    });
  });

  describe("Pelanggaran Keterangan/Deskripsi (description)", () => {
    it("menolak description string kosong", () => {
      const input = {
        type: "expense",
        amount: 20000,
        description: "",
        transaction_date: "2026-11-18",
      };
      const parsed = transactionInputSchema.safeParse(input);
      expect(parsed.success).toBe(false);
    });

    it("menolak description yang hanya berisi spasi", () => {
      const input = {
        type: "income",
        amount: 50000,
        description: "     ",
        transaction_date: "2026-11-18",
      };
      const parsed = transactionInputSchema.safeParse(input);
      expect(parsed.success).toBe(false);
    });
  });

  describe("Pelanggaran Tanggal (transaction_date)", () => {
    it("menolak format tanggal yang salah", () => {
      expect(transactionDateSchema.safeParse("18-11-2026").success).toBe(false);
      expect(transactionDateSchema.safeParse("2026/11/18").success).toBe(false);
      expect(transactionDateSchema.safeParse("invalid-date").success).toBe(false);
    });

    it("menolak bulan yang tidak valid", () => {
      expect(transactionDateSchema.safeParse("2026-13-01").success).toBe(false);
      expect(transactionDateSchema.safeParse("2026-00-10").success).toBe(false);
    });

    it("menolak tanggal tidak valid dalam kalender (misal 31 April)", () => {
      expect(transactionDateSchema.safeParse("2026-04-31").success).toBe(false);
    });

    it("menolak 29 Februari pada tahun bukan kabisat (2025)", () => {
      expect(transactionDateSchema.safeParse("2025-02-29").success).toBe(false);
    });

    it("menerima 29 Februari pada tahun kabisat (2024)", () => {
      expect(transactionDateSchema.safeParse("2024-02-29").success).toBe(true);
    });
  });

  describe("Pelanggaran Tipe (type)", () => {
    it("menolak tipe selain income atau expense", () => {
      expect(transactionTypeSchema.safeParse("transfer").success).toBe(false);
      expect(transactionTypeSchema.safeParse("").success).toBe(false);
    });
  });
});
