import { z } from "zod";

export interface KeysetCursor {
  transaction_date: string;
  created_at: string;
  id: string;
}

const cursorPayloadSchema = z.object({
  transaction_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  created_at: z.string().datetime(),
  id: z.string().uuid(),
});

/**
 * Meng-encode tuple keyset menjadi string base64url buram.
 */
export function encodeCursor(cursor: KeysetCursor): string {
  const jsonStr = JSON.stringify(cursor);
  return Buffer.from(jsonStr, "utf-8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Men-decode dan memvalidasi string base64url cursor.
 * Mengembalikan KeysetCursor jika valid, atau null jika rusak / tidak valid.
 */
export function decodeCursor(cursorStr: string): KeysetCursor | null {
  try {
    let base64 = cursorStr.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4 !== 0) {
      base64 += "=";
    }
    const jsonStr = Buffer.from(base64, "base64").toString("utf-8");
    const parsed = JSON.parse(jsonStr);
    const validated = cursorPayloadSchema.safeParse(parsed);
    if (!validated.success) {
      return null;
    }
    return validated.data;
  } catch {
    return null;
  }
}
