import { getAuthenticatedUser } from "@/lib/api/auth";
import {
  apiError,
  apiSuccess,
  handleApiError,
} from "@/lib/api/response";
import { getBalance } from "@/lib/finance/balance-db";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return apiError(401, "UNAUTHORIZED", "Anda belum terotentikasi");
    }

    const balance = await getBalance(user.id);
    return apiSuccess({ balance }, 200);
  } catch (err) {
    return handleApiError(err);
  }
}
