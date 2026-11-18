import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { InsufficientBalanceError } from "@/lib/finance/balance";

export interface ApiSuccessResponse<T> {
  data: T;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
}

export function apiSuccess<T>(data: T, status = 200): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({ data }, { status });
}

export function apiError(
  status: number,
  code: string,
  message: string,
  fields?: Record<string, string>
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...(fields ? { fields } : {}),
      },
    },
    { status }
  );
}

/**
 * Memetakan error umum dan ZodError menjadi respons API terstandarisasi.
 */
export function handleApiError(err: unknown): NextResponse<ApiErrorResponse> {
  if (err instanceof InsufficientBalanceError) {
    return apiError(422, "INSUFFICIENT_BALANCE", "Saldo tidak cukup");
  }

  if (err instanceof ZodError) {
    const fields: Record<string, string> = {};
    for (const issue of err.issues) {
      const path = issue.path.join(".") || "root";
      fields[path] = issue.message;
    }
    return apiError(400, "VALIDATION_ERROR", "Data yang dikirim tidak valid", fields);
  }

  // Log pesan internal secara ringkas tanpa data pengguna
  console.error("Internal API error:", err instanceof Error ? err.message : String(err));
  return apiError(500, "INTERNAL_SERVER_ERROR", "Terjadi kesalahan internal pada server");
}
