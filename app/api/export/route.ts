import { type NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/api/auth";
import { apiError, handleApiError } from "@/lib/api/response";
import {
  exportQuerySchema,
  buildExportFileName,
  prepareExportData,
} from "@/lib/finance/export";
import { getExportTransactions } from "@/lib/finance/export-db";
import { generateXlsx } from "@/lib/export/xlsx";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return apiError(401, "UNAUTHORIZED", "Anda belum terotentikasi");
    }

    const { searchParams } = request.nextUrl;
    const queryObj = {
      content: searchParams.get("content") ?? undefined,
      format: searchParams.get("format") ?? undefined,
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,
    };

    const parsedQuery = exportQuerySchema.safeParse(queryObj);
    if (!parsedQuery.success) {
      return handleApiError(parsedQuery.error);
    }

    const { content, format, from, to } = parsedQuery.data;

    // Ambil data transaksi dari database
    const transactionsList = await getExportTransactions(user.id, parsedQuery.data);

    if (transactionsList.length === 0) {
      return apiError(
        422,
        "NO_TRANSACTIONS",
        "Tidak ada transaksi pada periode ini"
      );
    }

    const preparedData = prepareExportData(transactionsList, content, from, to);
    const fileName = buildExportFileName(content, from, to, format);

    if (format === "xlsx") {
      const fileBuffer = await generateXlsx(preparedData);
      return new Response(new Uint8Array(fileBuffer), {
        status: 200,
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${fileName}"`,
          "Cache-Control": "no-store",
        },
      });
    }

    const { generatePdf } = await import("@/lib/export/pdf");
    const fileBuffer = await generatePdf(preparedData);
    return new Response(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
