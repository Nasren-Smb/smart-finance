import { describe, it, expect } from "vitest";
import { monthRange, weekRange, derivePeriodMode } from "./period";

describe("lib/finance/period.ts", () => {
  describe("monthRange", () => {
    it("monthRange('2026-11-18') menghasilkan 2026-11-01 sampai 2026-11-30", () => {
      expect(monthRange("2026-11-18")).toEqual({
        from: "2026-11-01",
        to: "2026-11-30",
      });
    });

    it("monthRange('2028-02-10') menghasilkan 2028-02-01 sampai 2028-02-29 (tahun kabisat)", () => {
      expect(monthRange("2028-02-10")).toEqual({
        from: "2028-02-01",
        to: "2028-02-29",
      });
    });

    it("monthRange('2026-12-31') menghasilkan 2026-12-01 sampai 2026-12-31", () => {
      expect(monthRange("2026-12-31")).toEqual({
        from: "2026-12-01",
        to: "2026-12-31",
      });
    });
  });

  describe("weekRange", () => {
    it("weekRange('2026-11-18') (Rabu) menghasilkan 2026-11-16 sampai 2026-11-22", () => {
      expect(weekRange("2026-11-18")).toEqual({
        from: "2026-11-16",
        to: "2026-11-22",
      });
    });

    it("weekRange('2026-11-16') (Senin) menghasilkan 2026-11-16 sampai 2026-11-22", () => {
      expect(weekRange("2026-11-16")).toEqual({
        from: "2026-11-16",
        to: "2026-11-22",
      });
    });

    it("weekRange('2026-11-22') (Minggu) menghasilkan 2026-11-16 sampai 2026-11-22", () => {
      expect(weekRange("2026-11-22")).toEqual({
        from: "2026-11-16",
        to: "2026-11-22",
      });
    });

    it("weekRange('2026-11-30') (Senin) menghasilkan 2026-11-30 sampai 2026-12-06", () => {
      expect(weekRange("2026-11-30")).toEqual({
        from: "2026-11-30",
        to: "2026-12-06",
      });
    });

    it("weekRange('2026-12-31') (Kamis) menghasilkan 2026-12-28 sampai 2027-01-03", () => {
      expect(weekRange("2026-12-31")).toEqual({
        from: "2026-12-28",
        to: "2027-01-03",
      });
    });
  });

  describe("derivePeriodMode", () => {
    const today = "2026-11-19";
    // month: 2026-11-01 s.d. 2026-11-30
    // week: 2026-11-16 s.d. 2026-11-22 (Senin s.d. Minggu)

    it("tanpa from dan to menghasilkan 'semua'", () => {
      expect(derivePeriodMode({}, today)).toBe("semua");
    });

    it("sama persis dengan monthRange(today) menghasilkan 'bulan'", () => {
      expect(
        derivePeriodMode({ from: "2026-11-01", to: "2026-11-30" }, today)
      ).toBe("bulan");
    });

    it("sama persis dengan weekRange(today) menghasilkan 'minggu'", () => {
      expect(
        derivePeriodMode({ from: "2026-11-16", to: "2026-11-22" }, today)
      ).toBe("minggu");
    });

    it("rentang tanggal acak menghasilkan 'kustom'", () => {
      expect(
        derivePeriodMode({ from: "2026-11-05", to: "2026-11-12" }, today)
      ).toBe("kustom");
    });

    it("hanya from terisi menghasilkan 'kustom'", () => {
      expect(derivePeriodMode({ from: "2026-11-01" }, today)).toBe("kustom");
    });

    it("hanya to terisi menghasilkan 'kustom'", () => {
      expect(derivePeriodMode({ to: "2026-11-30" }, today)).toBe("kustom");
    });
  });
});
