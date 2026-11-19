import { describe, it, expect } from "vitest";
import {
  formatRupiahRingkas,
  shiftAnchor,
  canGoNext,
  formatBucketLabel,
  formatPeriodTitle,
} from "./chart-nav";

describe("lib/finance/chart-nav.ts", () => {
  describe("formatRupiahRingkas", () => {
    it("memformat 0 dan berbagai rentang angka", () => {
      expect(formatRupiahRingkas(0)).toBe("0");
      expect(formatRupiahRingkas(500)).toBe("500");
      expect(formatRupiahRingkas(500_000)).toBe("500 rb");
      expect(formatRupiahRingkas(1_000_000)).toBe("1 jt");
      expect(formatRupiahRingkas(1_500_000)).toBe("1,5 jt");
      expect(formatRupiahRingkas(10_000_000)).toBe("10 jt");
      expect(formatRupiahRingkas(1_000_000_000)).toBe("1 M");
      expect(formatRupiahRingkas(2_500_000_000)).toBe("2,5 M");
    });
  });

  describe("shiftAnchor", () => {
    describe("day: geser 7 hari", () => {
      it("maju dan mundur 7 hari", () => {
        expect(shiftAnchor("2026-11-19", "day", "next")).toBe("2026-11-26");
        expect(shiftAnchor("2026-11-19", "day", "prev")).toBe("2026-11-12");
      });

      it("geser melewati batas bulan dan tahun", () => {
        expect(shiftAnchor("2026-11-28", "day", "next")).toBe("2026-12-05");
        expect(shiftAnchor("2026-12-30", "day", "next")).toBe("2027-01-06");
        expect(shiftAnchor("2027-01-03", "day", "prev")).toBe("2026-12-27");
      });
    });

    describe("week: geser 1 bulan (jika hari tidak ada di bulan tujuan, pakai hari terakhir)", () => {
      it("geser 1 bulan normal", () => {
        expect(shiftAnchor("2026-05-15", "week", "next")).toBe("2026-06-15");
        expect(shiftAnchor("2026-05-15", "week", "prev")).toBe("2026-04-15");
      });

      it("geser dari 31 Januari ke Februari non-kabisat (2026) -> 28 Feb", () => {
        expect(shiftAnchor("2026-01-31", "week", "next")).toBe("2026-02-28");
      });

      it("geser dari 31 Januari ke Februari kabisat (2028) -> 29 Feb", () => {
        expect(shiftAnchor("2028-01-31", "week", "next")).toBe("2028-02-29");
      });

      it("geser dari 31 Maret mundur ke Februari non-kabisat -> 28 Feb", () => {
        expect(shiftAnchor("2026-03-31", "week", "prev")).toBe("2026-02-28");
      });

      it("geser melewati pergantian tahun", () => {
        expect(shiftAnchor("2026-12-15", "week", "next")).toBe("2027-01-15");
        expect(shiftAnchor("2027-01-15", "week", "prev")).toBe("2026-12-15");
      });
    });

    describe("month: geser 1 tahun", () => {
      it("geser 1 tahun normal", () => {
        expect(shiftAnchor("2026-05-15", "month", "next")).toBe("2027-05-15");
        expect(shiftAnchor("2026-05-15", "month", "prev")).toBe("2025-05-15");
      });

      it("geser dari 29 Feb 2028 (kabisat) ke 2029 (non-kabisat) -> 28 Feb 2029", () => {
        expect(shiftAnchor("2028-02-29", "month", "next")).toBe("2029-02-28");
        expect(shiftAnchor("2028-02-29", "month", "prev")).toBe("2027-02-28");
      });
    });

    describe("year: tidak bergeser", () => {
      it("mengembalikan anchor persis", () => {
        expect(shiftAnchor("2026-11-19", "year", "next")).toBe("2026-11-19");
        expect(shiftAnchor("2026-11-19", "year", "prev")).toBe("2026-11-19");
      });
    });
  });

  describe("canGoNext", () => {
    const today = "2026-11-19";

    it("day: false jika minggu berikutnya dimulai setelah today", () => {
      // Anchor 2026-11-19: minggu ini 2026-11-16 s.d. 2026-11-22
      // nextAnchor = 2026-11-26, minggu berikutnya mulai 2026-11-23.
      // 2026-11-23 > 2026-11-19 -> false
      expect(canGoNext("2026-11-19", "day", today)).toBe(false);
      // Anchor minggu lalu: 2026-11-12 (minggu 2026-11-09 s.d. 2026-11-15)
      // nextAnchor = 2026-11-19, minggu berikutnya mulai 2026-11-16.
      // 2026-11-16 <= 2026-11-19 -> true
      expect(canGoNext("2026-11-12", "day", today)).toBe(true);
    });

    it("week: false jika bulan berikutnya dimulai setelah today", () => {
      // Anchor 2026-11-19 (Nov 2026) -> nextAnchor Des 2026 (mulai 2026-12-01 > 2026-11-19) -> false
      expect(canGoNext("2026-11-19", "week", today)).toBe(false);
      // Anchor Okt 2026 -> nextAnchor Nov 2026 (mulai 2026-11-01 <= 2026-11-19) -> true
      expect(canGoNext("2026-10-15", "week", today)).toBe(true);
    });

    it("month: false jika tahun berikutnya dimulai setelah today", () => {
      // Anchor 2026-05-15 -> nextAnchor 2027 (mulai 2027-01-01 > 2026-11-19) -> false
      expect(canGoNext("2026-05-15", "month", today)).toBe(false);
      // Anchor 2025-05-15 -> nextAnchor 2026 (mulai 2026-01-01 <= 2026-11-19) -> true
      expect(canGoNext("2025-05-15", "month", today)).toBe(true);
    });

    it("year: selalu false", () => {
      expect(canGoNext("2026-11-19", "year", today)).toBe(false);
    });
  });

  describe("formatBucketLabel", () => {
    it("day: singkatan hari dan tanggal (Sen 16, Rab 18, Min 22)", () => {
      expect(formatBucketLabel("2026-11-16", "2026-11-16", "day")).toBe("Sen 16");
      expect(formatBucketLabel("2026-11-18", "2026-11-18", "day")).toBe("Rab 18");
      expect(formatBucketLabel("2026-11-22", "2026-11-22", "day")).toBe("Min 22");
    });

    it("week: rentang tanggal dalam bulan atau 1 hari", () => {
      expect(formatBucketLabel("2026-11-01", "2026-11-01", "week")).toBe("1 Nov");
      expect(formatBucketLabel("2026-11-02", "2026-11-08", "week")).toBe("2–8 Nov");
      expect(formatBucketLabel("2026-11-23", "2026-11-29", "week")).toBe("23–29 Nov");
      expect(formatBucketLabel("2026-11-30", "2026-11-30", "week")).toBe("30 Nov");
    });

    it("month: singkatan bulan (Jan s.d. Des)", () => {
      expect(formatBucketLabel("2026-01-01", "2026-01-31", "month")).toBe("Jan");
      expect(formatBucketLabel("2026-08-01", "2026-08-31", "month")).toBe("Agu");
      expect(formatBucketLabel("2026-12-01", "2026-12-31", "month")).toBe("Des");
    });

    it("year: tahun saja (2026)", () => {
      expect(formatBucketLabel("2026-01-01", "2026-12-31", "year")).toBe("2026");
    });
  });

  describe("formatPeriodTitle", () => {
    it("day: dalam satu bulan ('16–22 Nov 2026')", () => {
      expect(formatPeriodTitle("2026-11-18", "day")).toBe("16–22 Nov 2026");
    });

    it("day: melewati batas bulan ('30 Nov – 6 Des 2026')", () => {
      expect(formatPeriodTitle("2026-11-30", "day")).toBe("30 Nov – 6 Des 2026");
    });

    it("day: melewati batas tahun ('28 Des 2026 – 3 Jan 2027')", () => {
      expect(formatPeriodTitle("2026-12-31", "day")).toBe("28 Des 2026 – 3 Jan 2027");
    });

    it("week: nama bulan penuh dan tahun ('November 2026')", () => {
      expect(formatPeriodTitle("2026-11-19", "week")).toBe("November 2026");
      expect(formatPeriodTitle("2028-02-15", "week")).toBe("Februari 2028");
    });

    it("month: tahun ('2026')", () => {
      expect(formatPeriodTitle("2026-11-19", "month")).toBe("2026");
    });

    it("year: 'Semua tahun'", () => {
      expect(formatPeriodTitle("2026-11-19", "year")).toBe("Semua tahun");
    });
  });
});
