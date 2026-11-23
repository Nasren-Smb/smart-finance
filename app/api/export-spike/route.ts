import { type NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/api/auth";
import { apiError, handleApiError } from "@/lib/api/response";
import ExcelJS from "exceljs";
import pdfMake from "pdfmake";
import type { TDocumentDefinitions } from "pdfmake/interfaces";

// Konfigurasi font standar PDFMake (menggunakan standard 14 fonts bawaan PDF tanpa membaca file TTF lokal)
pdfMake.setFonts({
  Roboto: {
    normal: "Helvetica",
    bold: "Helvetica-Bold",
    italics: "Helvetica-Oblique",
    bolditalics: "Helvetica-BoldOblique",
  },
});
pdfMake.setUrlAccessPolicy(() => false);
pdfMake.setLocalAccessPolicy(() => false);

// Data statis 6 baris contoh (tanggal literal, tanpa Date.now())
const SAMPLE_TRANSACTIONS = [
  {
    date: "2026-11-01",
    description: "Gaji bulanan",
    type: "income" as const,
    amount: 8500000,
  },
  {
    date: "2026-11-02",
    description: "Belanja dapur dan makan",
    type: "expense" as const,
    amount: 450000,
  },
  {
    date: "2026-11-05",
    description: "Bensin motor",
    type: "expense" as const,
    amount: 50000,
  },
  {
    date: "2026-11-10",
    description: "Honor proyek sampingan",
    type: "income" as const,
    amount: 1200000,
  },
  {
    date: "2026-11-15",
    description: "Pulsa dan paket data",
    type: "expense" as const,
    amount: 100000,
  },
  {
    date: "2026-11-20",
    description: "Makan malam keluarga",
    type: "expense" as const,
    amount: 320000,
  },
];

// Ringkasan
const TOTAL_INCOME = 8500000 + 1200000; // 9700000
const TOTAL_EXPENSE = 450000 + 50000 + 100000 + 320000; // 920000
const DIFFERENCE = TOTAL_INCOME - TOTAL_EXPENSE; // 8780000

function formatRupiahNumber(val: number): string {
  return "Rp " + val.toLocaleString("id-ID");
}

async function generateExcelBuffer(): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Smart Finance";
  const worksheet = workbook.addWorksheet("Laporan Transaksi", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  worksheet.columns = [
    { header: "Tanggal", key: "date", width: 14 },
    { header: "Keterangan / Sumber", key: "description", width: 30 },
    { header: "Jenis", key: "type", width: 14 },
    { header: "Nominal", key: "amount", width: 18 },
  ];

  // Header tebal
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.alignment = { vertical: "middle" };

  // Data baris
  for (const item of SAMPLE_TRANSACTIONS) {
    // Tanggal sungguhan (Date object UTC)
    const [y, m, d] = item.date.split("-").map(Number);
    const dateObj = new Date(Date.UTC(y, m - 1, d));

    const row = worksheet.addRow({
      date: dateObj,
      description: item.description,
      type: item.type === "income" ? "Pemasukan" : "Pengeluaran",
      amount: item.amount,
    });

    // Format tanggal sungguhan & format nominal Rupiah
    row.getCell(1).numFmt = "yyyy-mm-dd";
    row.getCell(4).numFmt = '"Rp "#,##0';
    row.getCell(4).alignment = { horizontal: "right" };
  }

  // Baris kosong
  worksheet.addRow([]);

  // Ringkasan
  const incomeRow = worksheet.addRow(["", "Total Pemasukan", "", TOTAL_INCOME]);
  incomeRow.font = { bold: true };
  incomeRow.getCell(4).numFmt = '"Rp "#,##0';
  incomeRow.getCell(4).alignment = { horizontal: "right" };

  const expenseRow = worksheet.addRow(["", "Total Pengeluaran", "", TOTAL_EXPENSE]);
  expenseRow.font = { bold: true };
  expenseRow.getCell(4).numFmt = '"Rp "#,##0';
  expenseRow.getCell(4).alignment = { horizontal: "right" };

  const diffRow = worksheet.addRow(["", "Selisih", "", DIFFERENCE]);
  diffRow.font = { bold: true };
  diffRow.getCell(4).numFmt = '"Rp "#,##0';
  diffRow.getCell(4).alignment = { horizontal: "right" };

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

async function generatePdfBuffer(): Promise<Buffer> {
  const docDefinition: TDocumentDefinitions = {
    pageSize: "A4",
    pageOrientation: "portrait",
    pageMargins: [40, 40, 40, 40],
    footer: (currentPage, pageCount) => {
      return {
        text: `Halaman ${currentPage} dari ${pageCount}`,
        alignment: "center",
        fontSize: 9,
        color: "#666666",
        margin: [0, 15, 0, 0],
      };
    },
    content: [
      {
        text: "Laporan Transaksi Smart Finance",
        fontSize: 16,
        bold: true,
        margin: [0, 0, 0, 15],
      },
      {
        table: {
          headerRows: 1,
          widths: [75, "*", 85, 100],
          body: [
            [
              { text: "Tanggal", bold: true },
              { text: "Keterangan / Sumber", bold: true },
              { text: "Jenis", bold: true },
              { text: "Nominal", bold: true, alignment: "right" },
            ],
            ...SAMPLE_TRANSACTIONS.map((item) => [
              item.date,
              item.description,
              item.type === "income" ? "Pemasukan" : "Pengeluaran",
              {
                text: formatRupiahNumber(item.amount),
                alignment: "right" as const,
              },
            ]),
          ],
        },
        layout: "lightHorizontalLines",
      },
      {
        text: "",
        margin: [0, 15, 0, 0],
      },
      {
        table: {
          widths: ["*", 120],
          body: [
            [
              { text: "Total Pemasukan", bold: true },
              {
                text: formatRupiahNumber(TOTAL_INCOME),
                bold: true,
                alignment: "right",
              },
            ],
            [
              { text: "Total Pengeluaran", bold: true },
              {
                text: formatRupiahNumber(TOTAL_EXPENSE),
                bold: true,
                alignment: "right",
              },
            ],
            [
              { text: "Selisih", bold: true },
              {
                text: formatRupiahNumber(DIFFERENCE),
                bold: true,
                alignment: "right",
              },
            ],
          ],
        },
        layout: "noBorders",
      },
    ],
    defaultStyle: {
      fontSize: 10,
    },
  };

  const pdfDoc = pdfMake.createPdf(docDefinition);
  return await pdfDoc.getBuffer();
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return apiError(401, "UNAUTHORIZED", "Anda belum terotentikasi");
    }

    const format = request.nextUrl.searchParams.get("format");
    if (format !== "xlsx" && format !== "pdf") {
      return apiError(
        400,
        "VALIDATION_ERROR",
        "Parameter format tidak valid. Gunakan 'xlsx' atau 'pdf'."
      );
    }

    if (format === "xlsx") {
      const fileBuffer = await generateExcelBuffer();
      return new Response(new Uint8Array(fileBuffer), {
        status: 200,
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition":
            'attachment; filename="smart-finance-laporan.xlsx"',
          "Cache-Control": "no-store",
        },
      });
    }

    const fileBuffer = await generatePdfBuffer();
    return new Response(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          'attachment; filename="smart-finance-laporan.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
