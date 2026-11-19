import { describe, it, expect } from "vitest";
import {
  parseFilters,
  buildSearchString,
  buildApiQuery,
  type TransactionFilters,
} from "./filters";

describe("lib/finance/filters.ts", () => {
  describe("parseFilters", () => {
    it("mem-parsing filter yang lengkap dan valid dari URLSearchParams", () => {
      const params = new URLSearchParams(
        "type=expense&from=2026-11-01&to=2026-11-30&q=makan%20siang"
      );
      const res = parseFilters(params);
      expect(res).toEqual({
        type: "expense",
        from: "2026-11-01",
        to: "2026-11-30",
        q: "makan siang",
      });
    });

    it("mem-parsing dari objek record biasa", () => {
      const res = parseFilters({
        type: "income",
        from: "2026-11-01",
        to: "2026-11-18",
        q: "gaji",
      });
      expect(res).toEqual({
        type: "income",
        from: "2026-11-01",
        to: "2026-11-18",
        q: "gaji",
      });
    });

    it("mengabaikan nilai rusak atau tidak dikenal (kembali ke undefined)", () => {
      const params = new URLSearchParams(
        "type=invalid_type&from=2026-99-99&to=bukan-tanggal&q="
      );
      const res = parseFilters(params);
      expect(res).toEqual({});
    });

    it("mengabaikan from dan to jika from setelah to", () => {
      const params = new URLSearchParams("from=2026-11-20&to=2026-11-10");
      const res = parseFilters(params);
      expect(res.from).toBeUndefined();
      expect(res.to).toBeUndefined();
    });

    it("mengizinkan from sama dengan to (rentang 1 hari)", () => {
      const params = new URLSearchParams("from=2026-11-18&to=2026-11-18");
      const res = parseFilters(params);
      expect(res.from).toBe("2026-11-18");
      expect(res.to).toBe("2026-11-18");
    });

    it("mengabaikan q yang kosong atau hanya spasi", () => {
      const params = new URLSearchParams("q=   ");
      const res = parseFilters(params);
      expect(res.q).toBeUndefined();
    });

    it("melakukan trim pada q dan mengabaikan q jika lebih dari 100 karakter", () => {
      const validQ = "a".repeat(100);
      const paramsValid = new URLSearchParams(`q=${validQ}`);
      expect(parseFilters(paramsValid).q).toBe(validQ);

      const invalidQ = "a".repeat(101);
      const paramsInvalid = new URLSearchParams(`q=${invalidQ}`);
      expect(parseFilters(paramsInvalid).q).toBeUndefined();

      const spacesWithQ = "   kopi pagi   ";
      const paramsSpaces = new URLSearchParams(`q=${encodeURIComponent(spacesWithQ)}`);
      expect(parseFilters(paramsSpaces).q).toBe("kopi pagi");
    });
  });

  describe("buildSearchString dan buildApiQuery", () => {
    it("menghasilkan string kosong jika filter kosong", () => {
      expect(buildSearchString({})).toBe("");
      expect(buildApiQuery({})).toBe("");
    });

    it("menghasilkan query string dengan urutan parameter stabil", () => {
      const filters: TransactionFilters = {
        q: "kopi",
        to: "2026-11-30",
        type: "expense",
        from: "2026-11-01",
      };

      const searchStr = buildSearchString(filters);
      expect(searchStr).toBe(
        "?type=expense&from=2026-11-01&to=2026-11-30&q=kopi"
      );

      const apiStr = buildApiQuery(filters, "dummy-cursor");
      expect(apiStr).toBe(
        "?type=expense&from=2026-11-01&to=2026-11-30&q=kopi&cursor=dummy-cursor"
      );
    });

    it("melakukan round-trip buildSearchString lalu parseFilters", () => {
      const initial: TransactionFilters = {
        type: "income",
        from: "2026-11-16",
        to: "2026-11-22",
        q: "bonus tahunan",
      };

      const qs = buildSearchString(initial);
      const parsed = parseFilters(new URLSearchParams(qs.replace("?", "")));
      expect(parsed).toEqual(initial);
    });
  });
});
