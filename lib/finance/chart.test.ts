import { describe, it, expect } from "vitest";
import {
  generateDayBuckets,
  generateWeekBuckets,
  generateMonthBuckets,
  chartQuerySchema,
} from "./chart";

describe("lib/finance/chart.ts", () => {
  describe("generateDayBuckets", () => {
    it("menghasilkan 7 hari Senin s.d. Minggu yang memuat anchor", () => {
      // 2026-11-18 (Rabu) -> Senin 2026-11-16 s.d. Minggu 2026-11-22
      const buckets = generateDayBuckets("2026-11-18");
      expect(buckets).toHaveLength(7);
      expect(buckets[0]).toEqual({ from: "2026-11-16", to: "2026-11-16" });
      expect(buckets[1]).toEqual({ from: "2026-11-17", to: "2026-11-17" });
      expect(buckets[2]).toEqual({ from: "2026-11-18", to: "2026-11-18" });
      expect(buckets[3]).toEqual({ from: "2026-11-19", to: "2026-11-19" });
      expect(buckets[4]).toEqual({ from: "2026-11-20", to: "2026-11-20" });
      expect(buckets[5]).toEqual({ from: "2026-11-21", to: "2026-11-21" });
      expect(buckets[6]).toEqual({ from: "2026-11-22", to: "2026-11-22" });
    });

    it("menghasilkan 7 hari saat anchor adalah hari Senin", () => {
      const buckets = generateDayBuckets("2026-11-16");
      expect(buckets).toHaveLength(7);
      expect(buckets[0].from).toBe("2026-11-16");
      expect(buckets[6].to).toBe("2026-11-22");
    });

    it("menghasilkan 7 hari saat anchor adalah hari Minggu", () => {
      const buckets = generateDayBuckets("2026-11-22");
      expect(buckets).toHaveLength(7);
      expect(buckets[0].from).toBe("2026-11-16");
      expect(buckets[6].to).toBe("2026-11-22");
    });
  });

  describe("generateWeekBuckets (pemotongan di batas bulan & invarian total hari)", () => {
    // Helper untuk menghitung total hari dari kumpulan bucket inklusif
    function countTotalDays(buckets: Array<{ from: string; to: string }>): number {
      let count = 0;
      for (const b of buckets) {
        const fromDate = new Date(b.from + "T00:00:00Z");
        const toDate = new Date(b.to + "T00:00:00Z");
        const diffMs = toDate.getTime() - fromDate.getTime();
        const days = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
        count += days;
      }
      return count;
    }

    it("November 2026 (30 hari, tanggal 1 adalah Minggu, tanggal 30 adalah Senin)", () => {
      const buckets = generateWeekBuckets("2026-11-19");
      // Tanggal 1 Nov 2026: Minggu -> bucket 1: 1 hari (2026-11-01 s.d. 2026-11-01)
      // Bucket 2: 2026-11-02 (Senin) s.d. 2026-11-08 (Minggu)
      // Bucket 3: 2026-11-09 (Senin) s.d. 2026-11-15 (Minggu)
      // Bucket 4: 2026-11-16 (Senin) s.d. 2026-11-22 (Minggu)
      // Bucket 5: 2026-11-23 (Senin) s.d. 2026-11-29 (Minggu)
      // Bucket 6: 2026-11-30 (Senin) s.d. 2026-11-30 (Senin)
      expect(buckets).toHaveLength(6);
      expect(buckets[0]).toEqual({ from: "2026-11-01", to: "2026-11-01" });
      expect(buckets[1]).toEqual({ from: "2026-11-02", to: "2026-11-08" });
      expect(buckets[2]).toEqual({ from: "2026-11-09", to: "2026-11-15" });
      expect(buckets[3]).toEqual({ from: "2026-11-16", to: "2026-11-22" });
      expect(buckets[4]).toEqual({ from: "2026-11-23", to: "2026-11-29" });
      expect(buckets[5]).toEqual({ from: "2026-11-30", to: "2026-11-30" });

      expect(countTotalDays(buckets)).toBe(30);
    });

    it("Februari 2028 (tahun kabisat, 29 hari, tanggal 1 adalah Selasa)", () => {
      const buckets = generateWeekBuckets("2028-02-15");
      // 1 Feb 2028: Selasa -> bucket 1: 1 s.d. 6 Feb (Selasa s.d. Minggu, 6 hari)
      // Bucket 2: 7 s.d. 13 Feb (7 hari)
      // Bucket 3: 14 s.d. 20 Feb (7 hari)
      // Bucket 4: 21 s.d. 27 Feb (7 hari)
      // Bucket 5: 28 s.d. 29 Feb (Senin s.d. Selasa, 2 hari)
      expect(buckets).toHaveLength(5);
      expect(buckets[0]).toEqual({ from: "2028-02-01", to: "2028-02-06" });
      expect(buckets[1]).toEqual({ from: "2028-02-07", to: "2028-02-13" });
      expect(buckets[2]).toEqual({ from: "2028-02-14", to: "2028-02-20" });
      expect(buckets[3]).toEqual({ from: "2028-02-21", to: "2028-02-27" });
      expect(buckets[4]).toEqual({ from: "2028-02-28", to: "2028-02-29" });

      expect(countTotalDays(buckets)).toBe(29);
    });

    it("Februari 2026 (non-kabisat, 28 hari, tanggal 1 adalah Minggu)", () => {
      const buckets = generateWeekBuckets("2026-02-10");
      // 1 Feb 2026: Minggu -> bucket 1: 1 s.d. 1 Feb (1 hari)
      // Bucket 2: 2 s.d. 8 Feb (7 hari)
      // Bucket 3: 9 s.d. 15 Feb (7 hari)
      // Bucket 4: 16 s.d. 22 Feb (7 hari)
      // Bucket 5: 23 s.d. 28 Feb (Senin s.d. Sabtu, 6 hari)
      expect(buckets).toHaveLength(5);
      expect(buckets[0]).toEqual({ from: "2026-02-01", to: "2026-02-01" });
      expect(buckets[4]).toEqual({ from: "2026-02-23", to: "2026-02-28" });
      expect(countTotalDays(buckets)).toBe(28);
    });

    it("Maret 2026 (31 hari, tanggal 1 adalah Minggu)", () => {
      const buckets = generateWeekBuckets("2026-03-01");
      expect(buckets[0]).toEqual({ from: "2026-03-01", to: "2026-03-01" });
      expect(buckets[buckets.length - 1].to).toBe("2026-03-31");
      expect(countTotalDays(buckets)).toBe(31);
    });

    it("Bulan yang tanggal 1-nya tepat hari Senin (Februari 2027, 28 hari)", () => {
      const buckets = generateWeekBuckets("2027-02-10");
      // 1 Feb 2027: Senin -> 4 minggu persis (4 x 7 hari)
      expect(buckets).toHaveLength(4);
      expect(buckets[0]).toEqual({ from: "2027-02-01", to: "2027-02-07" });
      expect(buckets[1]).toEqual({ from: "2027-02-08", to: "2027-02-14" });
      expect(buckets[2]).toEqual({ from: "2027-02-15", to: "2027-02-21" });
      expect(buckets[3]).toEqual({ from: "2027-02-22", to: "2027-02-28" });
      expect(countTotalDays(buckets)).toBe(28);
    });
  });

  describe("generateMonthBuckets", () => {
    it("menghasilkan 12 bucket Januari sampai Desember untuk tahun anchor", () => {
      const buckets = generateMonthBuckets("2026-07-15");
      expect(buckets).toHaveLength(12);
      expect(buckets[0]).toEqual({ from: "2026-01-01", to: "2026-01-31" });
      expect(buckets[1]).toEqual({ from: "2026-02-01", to: "2026-02-28" });
      expect(buckets[11]).toEqual({ from: "2026-12-01", to: "2026-12-31" });
    });

    it("menghasilkan 29 hari di Februari untuk tahun kabisat", () => {
      const buckets = generateMonthBuckets("2028-11-01");
      expect(buckets[1]).toEqual({ from: "2028-02-01", to: "2028-02-29" });
    });
  });

  describe("chartQuerySchema", () => {
    it("menerima query valid untuk level day dengan anchor", () => {
      const result = chartQuerySchema.safeParse({
        level: "day",
        anchor: "2026-11-19",
      });
      expect(result.success).toBe(true);
    });

    it("menerima query valid untuk level week dengan anchor", () => {
      const result = chartQuerySchema.safeParse({
        level: "week",
        anchor: "2026-11-19",
      });
      expect(result.success).toBe(true);
    });

    it("menerima query valid untuk level month dengan anchor masa depan", () => {
      const result = chartQuerySchema.safeParse({
        level: "month",
        anchor: "2030-05-20",
      });
      expect(result.success).toBe(true);
    });

    it("menerima query valid untuk level year tanpa anchor", () => {
      const result = chartQuerySchema.safeParse({
        level: "year",
      });
      expect(result.success).toBe(true);
    });

    it("menerima query level year dengan anchor (anchor diabaikan)", () => {
      const result = chartQuerySchema.safeParse({
        level: "year",
        anchor: "2026-11-19",
      });
      expect(result.success).toBe(true);
    });

    it("menolak jika level tidak valid", () => {
      const result = chartQuerySchema.safeParse({
        level: "decade",
        anchor: "2026-11-19",
      });
      expect(result.success).toBe(false);
    });

    it("menolak jika level bukan year tetapi anchor tidak ada", () => {
      const result = chartQuerySchema.safeParse({
        level: "day",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Parameter 'anchor' wajib diisi");
      }
    });

    it("menolak jika anchor bukan tanggal kalender valid", () => {
      const result = chartQuerySchema.safeParse({
        level: "week",
        anchor: "2026-02-30",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Format tanggal 'anchor' harus YYYY-MM-DD yang valid");
      }
    });
  });
});
