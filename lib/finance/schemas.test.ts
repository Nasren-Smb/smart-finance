import { describe, it, expect } from "vitest";
import {
  transactionTypeSchema,
  createTransactionDateSchema,
  createTransactionInputSchema,
} from "./schemas";

describe("Validasi Zod - lib/finance/schemas.ts", () => {
  // Gunakan basis tanggal simulasi: 2026-11-18 WIB
  const simulatedNow = new Date("2026-11-18T10:00:00Z");
  const schemaForTest = createTransactionInputSchema(simulatedNow);
  const dateSchemaForTest = createTransactionDateSchema(simulatedNow);

  describe("Input Valid", () => {
    it("menerima input pemasukan valid", () => {
      const validIncome = {
        type: "income",
        amount: 2500000,
        description: "Gaji Bulanan",
        transaction_date: "2026-11-18",
      };
      const parsed = schemaForTest.safeParse(validIncome);
      expect(parsed.success).toBe(true);
    });

    it("menerima input pengeluaran valid", () => {
      const validExpense = {
        type: "expense",
        amount: 50000,
        description: "Makan Siang",
        transaction_date: "2026-02-28",
      };
      const parsed = schemaForTest.safeParse(validExpense);
      expect(parsed.success).toBe(true);
    });

    it("melakukan trim pada description", () => {
      const input = {
        type: "expense",
        amount: 15000,
        description: "   Kopi Pagi   ",
        transaction_date: "2026-01-01",
      };
      const parsed = schemaForTest.safeParse(input);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.description).toBe("Kopi Pagi");
      }
    });

    it("menerima description tepat 100 karakter", () => {
      const exact100 = "a".repeat(100);
      const input = {
        type: "expense",
        amount: 10000,
        description: exact100,
        transaction_date: "2026-11-18",
      };
      const parsed = schemaForTest.safeParse(input);
      expect(parsed.success).toBe(true);
    });

    it("menerima description 100 karakter dengan spasi di tepi setelah di-trim", () => {
      const text100 = "   " + "b".repeat(100) + "   ";
      const input = {
        type: "income",
        amount: 10000,
        description: text100,
        transaction_date: "2026-11-18",
      };
      const parsed = schemaForTest.safeParse(input);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.description.length).toBe(100);
      }
    });
  });

  describe("Pelanggaran Keterangan/Deskripsi (description)", () => {
    it("menolak description lebih dari 100 karakter (101 karakter)", () => {
      const text101 = "a".repeat(101);
      const input = {
        type: "expense",
        amount: 10000,
        description: text101,
        transaction_date: "2026-11-18",
      };
      const parsed = schemaForTest.safeParse(input);
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        expect(parsed.error.issues[0]?.message).toContain(
          "Keterangan maksimal 100 karakter"
        );
      }
    });

    it("menolak description string kosong", () => {
      const input = {
        type: "expense",
        amount: 20000,
        description: "",
        transaction_date: "2026-11-18",
      };
      const parsed = schemaForTest.safeParse(input);
      expect(parsed.success).toBe(false);
    });

    it("menolak description yang hanya berisi spasi", () => {
      const input = {
        type: "income",
        amount: 50000,
        description: "     ",
        transaction_date: "2026-11-18",
      };
      const parsed = schemaForTest.safeParse(input);
      expect(parsed.success).toBe(false);
    });
  });

  describe("Pelanggaran Tanggal Transaksi (transaction_date)", () => {
    it("menerima tanggal hari ini (2026-11-18)", () => {
      expect(dateSchemaForTest.safeParse("2026-11-18").success).toBe(true);
    });

    it("menerima tanggal kemarin (2026-11-17)", () => {
      expect(dateSchemaForTest.safeParse("2026-11-17").success).toBe(true);
    });

    it("menolak tanggal besok di masa depan (2026-11-19)", () => {
      const parsed = dateSchemaForTest.safeParse("2026-11-19");
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        expect(parsed.error.issues[0]?.message).toBe(
          "Tanggal tidak boleh melewati hari ini"
        );
      }
    });

    it("menolak format tanggal yang salah", () => {
      expect(dateSchemaForTest.safeParse("18-11-2026").success).toBe(false);
      expect(dateSchemaForTest.safeParse("2026/11/18").success).toBe(false);
      expect(dateSchemaForTest.safeParse("invalid-date").success).toBe(false);
    });

    it("menolak bulan yang tidak valid", () => {
      expect(dateSchemaForTest.safeParse("2026-13-01").success).toBe(false);
      expect(dateSchemaForTest.safeParse("2026-00-10").success).toBe(false);
    });

    it("menolak tanggal tidak valid dalam kalender (misal 31 April)", () => {
      expect(dateSchemaForTest.safeParse("2026-04-31").success).toBe(false);
    });

    it("menolak 29 Februari pada tahun bukan kabisat (2025)", () => {
      expect(dateSchemaForTest.safeParse("2025-02-29").success).toBe(false);
    });

    it("menerima 29 Februari pada tahun kabisat masa lalu (2024)", () => {
      expect(dateSchemaForTest.safeParse("2024-02-29").success).toBe(true);
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
      const parsed = schemaForTest.safeParse(input);
      expect(parsed.success).toBe(false);
    });

    it("menolak nominal negatif", () => {
      const input = {
        type: "income",
        amount: -50000,
        description: "Penyesuaian",
        transaction_date: "2026-11-18",
      };
      const parsed = schemaForTest.safeParse(input);
      expect(parsed.success).toBe(false);
    });

    it("menolak nominal desimal/float", () => {
      const input = {
        type: "expense",
        amount: 15000.75,
        description: "Kopi",
        transaction_date: "2026-11-18",
      };
      const parsed = schemaForTest.safeParse(input);
      expect(parsed.success).toBe(false);
    });
  });

  describe("Pelanggaran Tipe (type)", () => {
    it("menolak tipe selain income atau expense", () => {
      expect(transactionTypeSchema.safeParse("transfer").success).toBe(false);
      expect(transactionTypeSchema.safeParse("").success).toBe(false);
    });
  });
});
