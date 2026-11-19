import { describe, it, expect } from "vitest";
import { summaryQuerySchema } from "./summary";

describe("lib/finance/summary.ts (summaryQuerySchema)", () => {
  it("menerima parameter from dan to yang valid", () => {
    const valid = summaryQuerySchema.safeParse({
      from: "2026-11-01",
      to: "2026-11-30",
    });
    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data.from).toBe("2026-11-01");
      expect(valid.data.to).toBe("2026-11-30");
    }
  });

  it("menerima tanggal di masa depan untuk from dan to", () => {
    const future = summaryQuerySchema.safeParse({
      from: "2027-01-01",
      to: "2027-01-31",
    });
    expect(future.success).toBe(true);
  });

  it("menerima from dan to pada hari yang sama (rentang satu hari)", () => {
    const singleDay = summaryQuerySchema.safeParse({
      from: "2026-11-19",
      to: "2026-11-19",
    });
    expect(singleDay.success).toBe(true);
  });

  it("menolak jika from setelah to", () => {
    const invalid = summaryQuerySchema.safeParse({
      from: "2026-11-30",
      to: "2026-11-01",
    });
    expect(invalid.success).toBe(false);
    if (!invalid.success) {
      expect(invalid.error.issues[0]?.message).toContain(
        "Tanggal 'from' tidak boleh setelah tanggal 'to'"
      );
    }
  });

  it("menolak jika parameter from hilang", () => {
    const missingFrom = summaryQuerySchema.safeParse({
      to: "2026-11-30",
    });
    expect(missingFrom.success).toBe(false);
  });

  it("menolak jika parameter to hilang", () => {
    const missingTo = summaryQuerySchema.safeParse({
      from: "2026-11-01",
    });
    expect(missingTo.success).toBe(false);
  });

  it("menolak jika format tanggal bukan YYYY-MM-DD", () => {
    const invalidFormat = summaryQuerySchema.safeParse({
      from: "19-11-2026",
      to: "2026-11-30",
    });
    expect(invalidFormat.success).toBe(false);
    if (!invalidFormat.success) {
      expect(invalidFormat.error.issues[0]?.message).toContain(
        "Format tanggal 'from' harus YYYY-MM-DD yang valid"
      );
    }
  });

  it("menolak jika tanggal tidak valid secara kalender (misal 31 Februari)", () => {
    const invalidCalendar = summaryQuerySchema.safeParse({
      from: "2026-02-31",
      to: "2026-03-01",
    });
    expect(invalidCalendar.success).toBe(false);
  });
});
