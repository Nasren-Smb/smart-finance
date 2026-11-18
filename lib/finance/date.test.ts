import { describe, it, expect } from "vitest";
import { todayWIB } from "./date";

describe("todayWIB - lib/finance/date.ts", () => {
  it("menghasilkan YYYY-MM-DD sesuai zona waktu Asia/Jakarta (WIB = UTC+7)", () => {
    // 2026-11-18 10:00:00 UTC -> 2026-11-18 17:00:00 WIB
    const date1 = new Date("2026-11-18T10:00:00Z");
    expect(todayWIB(date1)).toBe("2026-11-18");
  });

  describe("Batas tengah malam WIB", () => {
    it("2026-11-18T16:59:59Z (23:59:59 WIB) menghasilkan 2026-11-18", () => {
      const midnightBefore = new Date("2026-11-18T16:59:59Z");
      expect(todayWIB(midnightBefore)).toBe("2026-11-18");
    });

    it("2026-11-18T17:00:00Z (00:00:00 WIB hari berikutnya) menghasilkan 2026-11-19", () => {
      const midnightExact = new Date("2026-11-18T17:00:00Z");
      expect(todayWIB(midnightExact)).toBe("2026-11-19");
    });

    it("2026-12-31T16:59:59Z menghasilkan 2026-12-31, dan 2026-12-31T17:00:00Z menghasilkan 2027-01-01 (pergantian tahun)", () => {
      expect(todayWIB(new Date("2026-12-31T16:59:59Z"))).toBe("2026-12-31");
      expect(todayWIB(new Date("2026-12-31T17:00:00Z"))).toBe("2027-01-01");
    });
  });
});
