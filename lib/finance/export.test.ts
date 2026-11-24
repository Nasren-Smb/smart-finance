import { describe, it, expect } from "vitest";
import {
  exportQuerySchema,
  countDaysInclusive,
  buildExportFileName,
  prepareExportData,
} from "./export";

describe("lib/finance/export.ts", () => {
  describe("countDaysInclusive", () => {
    it("menghitung 1 hari untuk tanggal yang sama", () => {
      expect(countDaysInclusive("2026-11-01", "2026-11-01")).toBe(1);
    });

    it("menghitung 30 hari untuk 1 bulan November", () => {
      expect(countDaysInclusive("2026-11-01", "2026-11-30")).toBe(30);
    });

    it("menghitung tahun kabisat (366 hari)", () => {
      expect(countDaysInclusive("2028-01-01", "2028-12-31")).toBe(366);
    });

    it("menghitung tahun non-kabisat (365 hari)", () => {
      expect(countDaysInclusive("2026-01-01", "2026-12-31")).toBe(365);
    });
  });

  describe("exportQuerySchema", () => {
    it("menerima parameter yang valid", () => {
      const res = exportQuerySchema.safeParse({
        content: "all",
        format: "xlsx",
        from: "2026-11-01",
        to: "2026-11-30",
      });
      expect(res.success).toBe(true);
    });

    it("menerima tanggal masa depan", () => {
      const res = exportQuerySchema.safeParse({
        content: "expense",
        format: "pdf",
        from: "2029-01-01",
        to: "2029-01-31",
      });
      expect(res.success).toBe(true);
    });

    it("menolak jika parameter content tidak valid", () => {
      const res = exportQuerySchema.safeParse({
        content: "kategori",
        format: "xlsx",
        from: "2026-11-01",
        to: "2026-11-30",
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0].path).toContain("content");
      }
    });

    it("menolak jika parameter format tidak valid", () => {
      const res = exportQuerySchema.safeParse({
        content: "all",
        format: "csv",
        from: "2026-11-01",
        to: "2026-11-30",
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0].path).toContain("format");
      }
    });

    it("menolak jika bentuk tanggal bukan YYYY-MM-DD", () => {
      const res = exportQuerySchema.safeParse({
        content: "all",
        format: "xlsx",
        from: "01-11-2026",
        to: "2026-11-30",
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0].path).toContain("from");
      }
    });

    it("menolak tanggal yang tidak nyata seperti 2026-02-30", () => {
      const res = exportQuerySchema.safeParse({
        content: "income",
        format: "pdf",
        from: "2026-02-01",
        to: "2026-02-30",
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0].path).toContain("to");
      }
    });

    it("menolak tanggal 29 Februari pada tahun non-kabisat (2026-02-29)", () => {
      const res = exportQuerySchema.safeParse({
        content: "income",
        format: "pdf",
        from: "2026-02-01",
        to: "2026-02-29",
      });
      expect(res.success).toBe(false);
    });

    it("menolak jika from lebih besar dari to", () => {
      const res = exportQuerySchema.safeParse({
        content: "all",
        format: "xlsx",
        from: "2026-11-30",
        to: "2026-11-01",
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0].message).toContain("tidak boleh setelah");
      }
    });

    it("menerima rentang persis 366 hari", () => {
      const res = exportQuerySchema.safeParse({
        content: "all",
        format: "xlsx",
        from: "2028-01-01",
        to: "2028-12-31", // Kabisat = 366 hari
      });
      expect(res.success).toBe(true);
    });

    it("menolak rentang lebih dari 366 hari (367 hari)", () => {
      const res = exportQuerySchema.safeParse({
        content: "all",
        format: "xlsx",
        from: "2026-01-01",
        to: "2027-01-02", // 365 + 2 = 367 hari
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0].message).toContain("maksimal 366 hari");
      }
    });
  });

  describe("buildExportFileName", () => {
    it("menghasilkan nama file untuk expense xlsx", () => {
      expect(
        buildExportFileName("expense", "2026-11-01", "2026-11-30", "xlsx")
      ).toBe("smart-finance-pengeluaran-2026-11-01_2026-11-30.xlsx");
    });

    it("menghasilkan nama file untuk income pdf", () => {
      expect(
        buildExportFileName("income", "2026-11-01", "2026-11-30", "pdf")
      ).toBe("smart-finance-pemasukan-2026-11-01_2026-11-30.pdf");
    });

    it("menghasilkan nama file untuk all xlsx", () => {
      expect(
        buildExportFileName("all", "2026-11-01", "2026-11-30", "xlsx")
      ).toBe("smart-finance-semua-2026-11-01_2026-11-30.xlsx");
    });
  });

  describe("prepareExportData", () => {
    const sampleTxs = [
      {
        transaction_date: "2026-11-02",
        description: "Gaji bulanan",
        type: "income" as const,
        amount: 5000000,
      },
      {
        transaction_date: "2026-11-03",
        description: "Bayar kontrakan",
        type: "expense" as const,
        amount: 1500000,
      },
      {
        transaction_date: "2026-11-05",
        description: "Beli bensin",
        type: "expense" as const,
        amount: 50000,
      },
    ];

    it("menyusun data untuk content 'all' dengan selisih positif", () => {
      const data = prepareExportData(sampleTxs, "all", "2026-11-01", "2026-11-30");
      expect(data.title).toBe("Laporan Keuangan Smart Finance");
      expect(data.periodLabel).toBe("1 Nov 2026 – 30 Nov 2026");
      expect(data.contentLabel).toBe("Semua transaksi");
      expect(data.rows.length).toBe(3);
      expect(data.rows[0].sign).toBe("+");
      expect(data.rows[1].sign).toBe("-");
      expect(data.summary.totalIncome).toBe(5000000);
      expect(data.summary.totalExpense).toBe(1550000);
      expect(data.summary.difference).toBe(3450000);
    });

    it("menyusun data untuk content 'all' dengan selisih negatif", () => {
      const deficitTxs = [
        {
          transaction_date: "2026-11-02",
          description: "Bonus kecil",
          type: "income" as const,
          amount: 500000,
        },
        {
          transaction_date: "2026-11-03",
          description: "Reparasi motor",
          type: "expense" as const,
          amount: 1200000,
        },
      ];
      const data = prepareExportData(deficitTxs, "all", "2026-11-01", "2026-11-30");
      expect(data.summary.difference).toBe(-700000);
    });

    it("menyusun data untuk content 'expense' (hanya totalPengeluaran)", () => {
      const expenseOnly = [
        {
          transaction_date: "2026-11-03",
          description: "Bayar kontrakan",
          type: "expense" as const,
          amount: 1500000,
        },
      ];
      const data = prepareExportData(expenseOnly, "expense", "2026-11-01", "2026-11-30");
      expect(data.contentLabel).toBe("Pengeluaran");
      expect(data.summary.totalExpense).toBe(1500000);
      expect(data.summary.totalIncome).toBeUndefined();
      expect(data.summary.difference).toBeUndefined();
      expect(data.rows[0].sign).toBe("-");
    });

    it("menyusun data untuk content 'income' (hanya totalPemasukan)", () => {
      const incomeOnly = [
        {
          transaction_date: "2026-11-02",
          description: "Gaji bulanan",
          type: "income" as const,
          amount: 5000000,
        },
      ];
      const data = prepareExportData(incomeOnly, "income", "2026-11-01", "2026-11-30");
      expect(data.contentLabel).toBe("Pemasukan");
      expect(data.summary.totalIncome).toBe(5000000);
      expect(data.summary.totalExpense).toBeUndefined();
      expect(data.summary.difference).toBeUndefined();
      expect(data.rows[0].sign).toBe("+");
    });
  });
});
