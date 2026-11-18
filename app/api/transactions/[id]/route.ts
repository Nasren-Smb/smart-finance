import { type NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/api/auth";
import {
  apiError,
  apiSuccess,
  handleApiError,
} from "@/lib/api/response";
import { uuidParamSchema } from "@/lib/api/query";
import { updateTransactionInputSchema } from "@/lib/finance/schemas";
import {
  getTransactionRecord,
  updateTransactionRecord,
  deleteTransactionRecord,
} from "@/lib/finance/transaction-service";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return apiError(401, "UNAUTHORIZED", "Anda belum terotentikasi");
    }

    const { id } = await params;
    const parsedId = uuidParamSchema.safeParse(id);
    if (!parsedId.success) {
      return apiError(400, "INVALID_ID", "Format ID transaksi tidak valid");
    }

    const item = await getTransactionRecord(user.id, parsedId.data);
    if (!item) {
      return apiError(404, "NOT_FOUND", "Transaksi tidak ditemukan");
    }

    return apiSuccess(item, 200);
  } catch (err) {
    return handleApiError(err, "GET", "/api/transactions/[id]");
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
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

    const { id } = await params;
    const parsedId = uuidParamSchema.safeParse(id);
    if (!parsedId.success) {
      return apiError(400, "INVALID_ID", "Format ID transaksi tidak valid");
    }

    let bodyJson: unknown;
    try {
      bodyJson = await request.json();
    } catch {
      return apiError(400, "INVALID_JSON", "Format JSON dalam request body tidak valid");
    }

    const parsedBody = updateTransactionInputSchema.safeParse(bodyJson);
    if (!parsedBody.success) {
      return handleApiError(parsedBody.error);
    }

    const updated = await updateTransactionRecord(
      user.id,
      parsedId.data,
      parsedBody.data
    );

    if (!updated) {
      return apiError(404, "NOT_FOUND", "Transaksi tidak ditemukan");
    }

    return apiSuccess(updated, 200);
  } catch (err) {
    return handleApiError(err, "PATCH", "/api/transactions/[id]");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
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

    const { id } = await params;
    const parsedId = uuidParamSchema.safeParse(id);
    if (!parsedId.success) {
      return apiError(400, "INVALID_ID", "Format ID transaksi tidak valid");
    }

    const result = await deleteTransactionRecord(user.id, parsedId.data);
    if (!result) {
      return apiError(404, "NOT_FOUND", "Transaksi tidak ditemukan");
    }

    return apiSuccess(result, 200);
  } catch (err) {
    return handleApiError(err, "DELETE", "/api/transactions/[id]");
  }
}
