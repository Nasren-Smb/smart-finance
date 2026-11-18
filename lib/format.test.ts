import { describe, it, expect } from "vitest";
import { formatRupiah, formatTanggal } from "./format";

describe("lib/format.ts", () => {
  describe("formatRupiah", () => {
    it("memformat angka 0 dengan benar", () => {
      expect(formatRupiah(0)).toBe("Rp 0");
    });

    it("memformat ratusan rupiah", () => {
      expect(formatRupiah(500)).toBe("Rp 500");
    });

    it("memformat jutaan rupiah dengan titik pemisah ribuan", () => {
      expect(formatRupiah(1250000)).toBe("Rp 1.250.000");
    });

    it("memformat miliaran rupiah dengan titik pemisah ribuan", () => {
      expect(formatRupiah(1000000000)).toBe("Rp 1.000.000.000");
    });
  });

  describe("formatTanggal", () => {
    it("memformat tanggal dengan singkatan bulan Indonesia yang tepat", () => {
      expect(formatTanggal("2026-01-15")).toBe("15 Jan 2026");
      expect(formatTanggal("2026-02-28")).toBe("28 Feb 2026");
      expect(formatTanggal("2026-03-01")).toBe("1 Mar 2026");
      expect(formatTanggal("2026-04-10")).toBe("10 Apr 2026");
      expect(formatTanggal("2026-05-20")).toBe("20 Mei 2026");
      expect(formatTanggal("2026-06-05")).toBe("5 Jun 2026");
      expect(formatTanggal("2026-07-17")).toBe("17 Jul 2026");
      expect(formatTanggal("2026-08-17")).toBe("17 Agu 2026");
      expect(formatTanggal("2026-09-30")).toBe("30 Sep 2026");
      expect(formatTanggal("2026-10-28")).toBe("28 Okt 2026");
      expect(formatTanggal("2026-11-18")).toBe("18 Nov 2026");
      expect(formatTanggal("2026-12-31")).toBe("31 Des 2026");
    });
  });
});
