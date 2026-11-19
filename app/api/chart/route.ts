import { type NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/api/auth";
import {
  apiError,
  apiSuccess,
  handleApiError,
} from "@/lib/api/response";
import { chartQuerySchema } from "@/lib/finance/chart";
import { getChartData } from "@/lib/finance/chart-db";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return apiError(401, "UNAUTHORIZED", "Anda belum terotentikasi");
    }

    const { searchParams } = request.nextUrl;
    const queryObj = {
      level: searchParams.get("level") ?? undefined,
      anchor: searchParams.get("anchor") ?? undefined,
    };

    const parsedQuery = chartQuerySchema.safeParse(queryObj);
    if (!parsedQuery.success) {
      return handleApiError(parsedQuery.error);
    }

    const chartData = await getChartData(user.id, parsedQuery.data);
    return apiSuccess(chartData, 200);
  } catch (err) {
    return handleApiError(err, "GET", "/api/chart");
  }
}
