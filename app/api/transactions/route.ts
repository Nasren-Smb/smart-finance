import { type NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/api/auth";
import {
  apiError,
  apiSuccess,
  handleApiError,
} from "@/lib/api/response";
import { transactionInputSchema } from "@/lib/finance/schemas";
import { transactionQuerySchema } from "@/lib/api/query";
import {
  createTransactionRecord,
  listTransactionsRecord,
} from "@/lib/finance/transaction-service";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return apiError(401, "UNAUTHORIZED", "Anda belum terotentikasi");
    }

    const { searchParams } = request.nextUrl;
    const queryObj = {
      type: searchParams.get("type") ?? undefined,
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,
      q: searchParams.get("q") ?? undefined,
      cursor: searchParams.get("cursor") ?? undefined,
    };

    const parsedQuery = transactionQuerySchema.safeParse(queryObj);
    if (!parsedQuery.success) {
      return handleApiError(parsedQuery.error);
    }

    const result = await listTransactionsRecord(user.id, parsedQuery.data);
    return apiSuccess(result, 200);
  } catch (err) {
    if (err instanceof Error && err.message === "INVALID_CURSOR") {
      return apiError(400, "INVALID_CURSOR", "Cursor yang diberikan tidak valid");
    }
    return handleApiError(err, "GET", "/api/transactions");
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return apiError(401, "UNAUTHORIZED", "Anda belum terotentikasi");
    }

    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      return apiError(
        415,
        "UNSUPPORTED_MEDIA_TYPE",
        "Header Content-Type harus berupa application/json"
      );
    }

    let bodyJson: unknown;
    try {
      bodyJson = await request.json();
    } catch {
      return apiError(400, "INVALID_JSON", "Format JSON dalam request body tidak valid");
    }

    const parsed = transactionInputSchema.safeParse(bodyJson);
    if (!parsed.success) {
      return handleApiError(parsed.error);
    }

    const created = await createTransactionRecord(user.id, parsed.data);
    return apiSuccess(created, 201);
  } catch (err) {
    return handleApiError(err, "POST", "/api/transactions");
  }
}
