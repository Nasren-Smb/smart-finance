import { describe, it, expect } from "vitest";
import { encodeCursor, decodeCursor, type KeysetCursor } from "./cursor";
import { escapeLikeWildcards, transactionQuerySchema } from "./query";
import { handleApiError, apiSuccess, apiError } from "./response";
import { InsufficientBalanceError } from "@/lib/finance/balance";
import { z } from "zod";

describe("lib/api/cursor.ts", () => {
  it("melakukan encode dan decode cursor secara round trip dengan presisi", () => {
    const original: KeysetCursor = {
      transaction_date: "2026-11-18",
      created_at: "2026-11-18T07:30:00.000Z",
      id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
    };

    const encoded = encodeCursor(original);
    expect(typeof encoded).toBe("string");
    expect(encoded).not.toContain("+");
    expect(encoded).not.toContain("/");
    expect(encoded).not.toContain("=");

    const decoded = decodeCursor(encoded);
    expect(decoded).toEqual(original);
  });

  it("menolak cursor yang rusak atau string acak", () => {
    expect(decodeCursor("invalid-cursor-string")).toBeNull();
    expect(decodeCursor("")).toBeNull();
    expect(decodeCursor("eyJhIjoxfQ")).toBeNull(); // JSON tidak sesuai skema
  });
});

describe("lib/api/query.ts", () => {
  describe("escapeLikeWildcards", () => {
    it("meng-escape karakter %, _, dan \\ dengan aman", () => {
      expect(escapeLikeWildcards("kopi 50%")).toBe("kopi 50\\%");
      expect(escapeLikeWildcards("gaji_bonus")).toBe("gaji\\_bonus");
      expect(escapeLikeWildcards("path\\test")).toBe("path\\\\test");
      expect(escapeLikeWildcards("normal text")).toBe("normal text");
    });
  });

  describe("transactionQuerySchema", () => {
    it("menerima parameter query yang valid", () => {
      const parsed = transactionQuerySchema.safeParse({
        type: "income",
        from: "2026-11-01",
        to: "2026-11-18",
        q: "gaji",
        cursor: "dummy-cursor",
      });
      expect(parsed.success).toBe(true);
    });

    it("menerima rentang tanggal bulan penuh (from=2026-11-01 dan to=2026-11-30) meskipun hari ini di tengah bulan", () => {
      const parsed = transactionQuerySchema.safeParse({
        from: "2026-11-01",
        to: "2026-11-30",
      });
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.from).toBe("2026-11-01");
        expect(parsed.data.to).toBe("2026-11-30");
      }
    });

    it("menolak jika from lebih besar daripada to", () => {
      const parsed = transactionQuerySchema.safeParse({
        from: "2026-11-20",
        to: "2026-11-10",
      });
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        expect(parsed.error.issues[0]?.message).toContain(
          "Tanggal 'from' tidak boleh setelah tanggal 'to'"
        );
      }
    });

    it("menolak type yang tidak valid", () => {
      const parsed = transactionQuerySchema.safeParse({
        type: "transfer",
      });
      expect(parsed.success).toBe(false);
    });

    it("menolak q yang melebihi 100 karakter", () => {
      const parsed = transactionQuerySchema.safeParse({
        q: "a".repeat(101),
      });
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        expect(parsed.error.issues[0]?.message).toContain("Pencarian maksimal 100 karakter");
      }
    });
  });
});

describe("lib/api/response.ts", () => {
  it("membentuk response sukses seragam", async () => {
    const res = apiSuccess({ hello: "world" }, 200);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ data: { hello: "world" } });
  });

  it("membentuk response error seragam", async () => {
    const res = apiError(404, "NOT_FOUND", "Item tidak ditemukan", { id: "tidak valid" });
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body).toEqual({
      error: {
        code: "NOT_FOUND",
        message: "Item tidak ditemukan",
        fields: { id: "tidak valid" },
      },
    });
  });

  it("memetakan InsufficientBalanceError ke status 422 dan code INSUFFICIENT_BALANCE", async () => {
    const err = new InsufficientBalanceError();
    const res = handleApiError(err);
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.error.code).toBe("INSUFFICIENT_BALANCE");
    expect(body.error.message).toBe("Saldo tidak cukup");
  });

  it("memetakan ZodError ke status 400 dan code VALIDATION_ERROR dengan daftar fields", async () => {
    const dummySchema = z.object({
      name: z.string().min(1, "Nama wajib diisi"),
    });
    const parsed = dummySchema.safeParse({});
    expect(parsed.success).toBe(false);

    if (!parsed.success) {
      const res = handleApiError(parsed.error);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error.code).toBe("VALIDATION_ERROR");
      expect(body.error.fields).toHaveProperty("name");
    }
  });

  it("memetakan error tidak dikenal ke status 500 generik tanpa membocorkan detail", async () => {
    const err = new Error("Database connection timeout at secret_host:5432");
    const res = handleApiError(err);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error.code).toBe("INTERNAL_SERVER_ERROR");
    expect(body.error.message).toBe("Terjadi kesalahan internal pada server");
  });
});
