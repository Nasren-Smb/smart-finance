import { describe, it, expect } from "vitest";
import { parseNominal, mapApiResponseError } from "./format-input";

describe("lib/format-input.ts", () => {
  describe("parseNominal", () => {
    it("mem-parsing nominal dengan format titik ribuan", () => {
      expect(parseNominal("1.250.000")).toBe(1250000);
      expect(parseNominal("50.000")).toBe(50000);
    });

    it("mem-parsing nominal angka polos", () => {
      expect(parseNominal("1250000")).toBe(1250000);
      expect(parseNominal("500")).toBe(500);
    });

    it("mengabaikan karakter non-digit selain titik", () => {
      expect(parseNominal("12a3")).toBe(123);
      expect(parseNominal("Rp 10.000")).toBe(10000);
    });

    it("mengembalikan null untuk input kosong atau hanya spasi", () => {
      expect(parseNominal("")).toBeNull();
      expect(parseNominal("   ")).toBeNull();
    });

    it("mengembalikan null untuk input bernilai 0", () => {
      expect(parseNominal("0")).toBeNull();
      expect(parseNominal("000")).toBeNull();
    });

    it("mengembalikan null jika nilai melebihi MAX_SAFE_INTEGER", () => {
      expect(parseNominal("999999999999999999999999")).toBeNull();
    });
  });

  describe("mapApiResponseError", () => {
    it("menangani pengalihan atau status 401 sebagai sesi berakhir", () => {
      const res1 = mapApiResponseError(401);
      expect(res1.isSessionExpired).toBe(true);
      expect(res1.message).toBe("Sesi berakhir. Silakan masuk lagi.");

      const res2 = mapApiResponseError(200, undefined, true);
      expect(res2.isSessionExpired).toBe(true);
      expect(res2.message).toBe("Sesi berakhir. Silakan masuk lagi.");
    });

    it("menangani 422 INSUFFICIENT_BALANCE", () => {
      const res = mapApiResponseError(422, {
        code: "INSUFFICIENT_BALANCE",
        message: "Saldo tidak cukup",
      });
      expect(res.message).toBe("Saldo tidak cukup. Catat pemasukan terlebih dulu.");
    });

    it("menangani 400 dengan rincian fields", () => {
      const res = mapApiResponseError(400, {
        code: "VALIDATION_ERROR",
        message: "Data tidak valid",
        fields: { description: "Keterangan wajib diisi" },
      });
      expect(res.fields).toEqual({ description: "Keterangan wajib diisi" });
    });

    it("menangani error generik lainnya", () => {
      const res = mapApiResponseError(500);
      expect(res.message).toBe("Terjadi kesalahan. Coba lagi.");
    });
  });
});
