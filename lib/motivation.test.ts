import { describe, it, expect } from "vitest";
import { MOTIVATION_QUOTES, getMotivationIndex } from "./motivation";

describe("MOTIVATION_QUOTES", () => {
  it("memiliki tepat 30 kalimat motivasi statis", () => {
    expect(MOTIVATION_QUOTES).toHaveLength(30);
  });

  it("semua kalimat berupa string non-kosong dan unik", () => {
    for (const quote of MOTIVATION_QUOTES) {
      expect(typeof quote).toBe("string");
      expect(quote.trim().length).toBeGreaterThan(0);
    }

    const uniqueSet = new Set(MOTIVATION_QUOTES);
    expect(uniqueSet.size).toBe(30);
  });

  it("kalimat pertama dan terakhir sesuai spesifikasi", () => {
    expect(MOTIVATION_QUOTES[0]).toBe(
      "Langkah kecil yang kamu ambil hari ini tetap berarti, sekecil apa pun kelihatannya."
    );
    expect(MOTIVATION_QUOTES[29]).toBe(
      "Teruslah bertumbuh dengan lembut, dunia punya tempat untuk setiap langkahmu."
    );
  });
});

describe("getMotivationIndex", () => {
  it("menghasilkan indeks dalam rentang 0 hingga 29", () => {
    const idx = getMotivationIndex("2026-11-25");
    expect(idx).toBeGreaterThanOrEqual(0);
    expect(idx).toBeLessThan(30);
  });

  it("deterministik: tanggal yang sama selalu menghasilkan indeks yang sama", () => {
    const idx1 = getMotivationIndex("2026-11-25");
    const idx2 = getMotivationIndex("2026-11-25");
    expect(idx1).toBe(idx2);
  });

  it("hari berurutan menghasilkan indeks bertambah satu (modulo 30)", () => {
    const idx1 = getMotivationIndex("2026-11-25");
    const idx2 = getMotivationIndex("2026-11-26");
    expect(idx2).toBe((idx1 + 1) % 30);
  });

  it("berjalan benar pada pergantian bulan dan tahun", () => {
    const endOfYear = getMotivationIndex("2026-12-31");
    const newYear = getMotivationIndex("2027-01-01");
    expect(newYear).toBe((endOfYear + 1) % 30);

    const endOfNov = getMotivationIndex("2026-11-30");
    const startOfDec = getMotivationIndex("2026-12-01");
    expect(startOfDec).toBe((endOfNov + 1) % 30);
  });

  it("berjalan benar pada tahun kabisat (2028)", () => {
    const feb28 = getMotivationIndex("2028-02-28");
    const feb29 = getMotivationIndex("2028-02-29");
    const mar01 = getMotivationIndex("2028-03-01");

    expect(feb29).toBe((feb28 + 1) % 30);
    expect(mar01).toBe((feb29 + 1) % 30);
  });

  it("wrap around kembali ke 0 setelah mencapai indeks 29", () => {
    // 30 hari berturut-turut menghasilkan 30 indeks berurutan modulo 30
    const indices: number[] = [];
    const baseDate = new Date(Date.UTC(2026, 0, 1));
    for (let i = 0; i < 60; i++) {
      const d = new Date(baseDate.getTime() + i * 86_400_000);
      const iso = d.toISOString().slice(0, 10);
      indices.push(getMotivationIndex(iso));
    }

    for (let i = 0; i < 59; i++) {
      expect(indices[i + 1]).toBe((indices[i] + 1) % 30);
    }
  });

  it("melempar error jika tanggal tidak valid kalender", () => {
    expect(() => getMotivationIndex("")).toThrow();
    expect(() => getMotivationIndex("2026-02-30")).toThrow();
    expect(() => getMotivationIndex("invalid-date")).toThrow();
    expect(() => getMotivationIndex("2026-13-01")).toThrow();
  });

  it("melempar error jika totalQuotes tidak valid atau <= 0", () => {
    expect(() => getMotivationIndex("2026-11-25", 0)).toThrow();
    expect(() => getMotivationIndex("2026-11-25", -5)).toThrow();
    expect(() => getMotivationIndex("2026-11-25", 2.5)).toThrow();
  });
});
