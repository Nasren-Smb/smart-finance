import { describe, it, expect } from "vitest";
import {
  getAvailableYears,
  getAvailableMonths,
  getMonthDateRange,
  parseContentDispositionFileName,
  validateCustomDateRange,
} from "./export-form";

describe("lib/finance/export-form.ts", () => {
  describe("getAvailableYears", () => {
    it("menghasilkan 6 tahun berurutan mundur dari tahun berjalan", () => {
      const years = getAvailableYears(2026);
      expect(years).toEqual([2026, 2025, 2024, 2023, 2022, 2021]);
      expect(years.length).toBe(6);
    });
  });

  describe("getAvailableMonths", () => {
    it("membatasi bulan hanya sampai bulan berjalan pada tahun ini", () => {
      // Tahun 2026, bulan 11 (November)
      const months = getAvailableMonths(2026, 2026, 11);
      expect(months.length).toBe(11);
      expect(months[months.length - 1].value).toBe(11);
      expect(months.find((m) => m.value === 12)).toBeUndefined();
    });

    it("menyediakan semua 12 bulan untuk tahun sebelum tahun ini", () => {
      const months = getAvailableMonths(2025, 2026, 11);
      expect(months.length).toBe(12);
      expect(months[0].value).toBe(1);
      expect(months[11].value).toBe(12);
    });
  });

  describe("getMonthDateRange", () => {
    it("menghitung rentang tanggal bulan biasa (November = 30 hari)", () => {
      const range = getMonthDateRange(2026, 11);
      expect(range).toEqual({
        from: "2026-11-01",
        to: "2026-11-30",
      });
    });

    it("menghitung rentang bulan Desember (31 hari)", () => {
      const range = getMonthDateRange(2026, 12);
      expect(range).toEqual({
        from: "2026-12-01",
        to: "2026-12-31",
      });
    });

    it("menghitung Februari pada tahun non-kabisat (28 hari)", () => {
      const range = getMonthDateRange(2026, 2);
      expect(range).toEqual({
        from: "2026-02-01",
        to: "2026-02-28",
      });
    });

    it("menghitung Februari pada tahun kabisat (2028 = 29 hari)", () => {
      const range = getMonthDateRange(2028, 2);
      expect(range).toEqual({
        from: "2028-02-01",
        to: "2028-02-29",
      });
    });
  });

  describe("parseContentDispositionFileName", () => {
    it("mengekstrak nama file bertanda petik ganda", () => {
      const header = 'attachment; filename="smart-finance-semua-2026-11-01_2026-11-30.xlsx"';
      const name = parseContentDispositionFileName(header, "fallback.xlsx");
      expect(name).toBe("smart-finance-semua-2026-11-01_2026-11-30.xlsx");
    });

    it("mengekstrak nama file tanpa tanda petik", () => {
      const header = "attachment; filename=smart-finance-pengeluaran.pdf";
      const name = parseContentDispositionFileName(header, "fallback.pdf");
      expect(name).toBe("smart-finance-pengeluaran.pdf");
    });

    it("mengembalikan nama cadangan jika header kosong atau null", () => {
      expect(parseContentDispositionFileName(null, "cadangan.xlsx")).toBe("cadangan.xlsx");
      expect(parseContentDispositionFileName(undefined, "cadangan.xlsx")).toBe("cadangan.xlsx");
      expect(parseContentDispositionFileName("", "cadangan.xlsx")).toBe("cadangan.xlsx");
    });

    it("mengembalikan nama cadangan jika format header tidak memuat filename", () => {
      const header = "attachment; inline";
      expect(parseContentDispositionFileName(header, "cadangan.pdf")).toBe("cadangan.pdf");
    });
  });

  describe("validateCustomDateRange", () => {
    it("valid untuk rentang yang benar", () => {
      const res = validateCustomDateRange("2026-11-01", "2026-11-30");
      expect(res.valid).toBe(true);
      expect(res.error).toBeUndefined();
    });

    it("tidak valid jika dari atau sampai kosong", () => {
      expect(validateCustomDateRange("", "2026-11-30")).toEqual({
        valid: false,
        error: "Isi kedua tanggal.",
      });
      expect(validateCustomDateRange("2026-11-01", "")).toEqual({
        valid: false,
        error: "Isi kedua tanggal.",
      });
    });

    it("tidak valid jika dari lebih besar dari sampai", () => {
      const res = validateCustomDateRange("2026-11-30", "2026-11-01");
      expect(res.valid).toBe(false);
      expect(res.error).toBe("Tanggal Dari tidak boleh setelah Sampai.");
    });

    it("valid untuk rentang persis 366 hari", () => {
      const res = validateCustomDateRange("2028-01-01", "2028-12-31");
      expect(res.valid).toBe(true);
    });

    it("tidak valid untuk rentang lebih dari 366 hari (367 hari)", () => {
      const res = validateCustomDateRange("2026-01-01", "2027-01-02");
      expect(res.valid).toBe(false);
      expect(res.error).toBe("Rentang tanggal maksimal 366 hari.");
    });
  });
});
