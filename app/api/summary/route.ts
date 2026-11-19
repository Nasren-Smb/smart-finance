import { type NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/api/auth";
import {
  apiError,
  apiSuccess,
  handleApiError,
} from "@/lib/api/response";
import { summaryQuerySchema, getPeriodSummary } from "@/lib/finance/summary";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return apiError(401, "UNAUTHORIZED", "Anda belum terotentikasi");
    }

    const { searchParams } = request.nextUrl;
    const queryObj = {
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,
    };

    const parsedQuery = summaryQuerySchema.safeParse(queryObj);
    if (!parsedQuery.success) {
      return handleApiError(parsedQuery.error);
    }

    const summary = await getPeriodSummary(user.id, parsedQuery.data);
    return apiSuccess(summary, 200);
  } catch (err) {
    return handleApiError(err, "GET", "/api/summary");
  }
}
