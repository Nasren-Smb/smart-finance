import pdfMake from "pdfmake";
import type { TDocumentDefinitions, TableCell } from "pdfmake/interfaces";
import type { PreparedExportData } from "@/lib/finance/export";
import { formatRupiah } from "@/lib/format";

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

function formatSignedRupiah(amount: number, sign: "+" | "-"): string {
  const base = formatRupiah(amount);
  return `${sign} ${base}`;
}

/**
 * Menghasilkan Buffer PDF dari PreparedExportData menggunakan pdfmake 0.3.15.
 */
export async function generatePdf(data: PreparedExportData): Promise<Buffer> {
  const isAll = data.content === "all";
  const isExpense = data.content === "expense";

  // Header tabel
  const tableHeaders: TableCell[] = isAll
    ? [
        { text: "Tanggal", bold: true },
        { text: "Jenis", bold: true },
        { text: "Keterangan/Sumber", bold: true },
        { text: "Nominal", bold: true, alignment: "right" },
      ]
    : isExpense
    ? [
        { text: "Tanggal", bold: true },
        { text: "Keterangan", bold: true },
        { text: "Nominal", bold: true, alignment: "right" },
      ]
    : [
        { text: "Tanggal", bold: true },
        { text: "Sumber", bold: true },
        { text: "Nominal", bold: true, alignment: "right" },
      ];

  // Lebar kolom
  const widths = isAll ? [70, 75, "*", 100] : [75, "*", 110];

  // Baris-baris tabel
  const tableBody: TableCell[][] = [tableHeaders];

  for (const row of data.rows) {
    if (isAll) {
      tableBody.push([
        { text: row.date },
        { text: row.typeLabel },
        { text: row.description },
        {
          text: formatSignedRupiah(row.amount, row.sign),
          alignment: "right",
        },
      ]);
    } else {
      tableBody.push([
        { text: row.date },
        { text: row.description },
        {
          text: formatSignedRupiah(row.amount, row.sign),
          alignment: "right",
        },
      ]);
    }
  }

  // Ringkasan
  const summaryBody: TableCell[][] = [];
  if (isExpense) {
    summaryBody.push([
      { text: "Total Pengeluaran", bold: true },
      {
        text: formatRupiah(data.summary.totalExpense ?? 0),
        bold: true,
        alignment: "right",
      },
    ]);
  } else if (data.content === "income") {
    summaryBody.push([
      { text: "Total Pemasukan", bold: true },
      {
        text: formatRupiah(data.summary.totalIncome ?? 0),
        bold: true,
        alignment: "right",
      },
    ]);
  } else {
    // all
    summaryBody.push([
      { text: "Total Pemasukan", bold: true },
      {
        text: formatRupiah(data.summary.totalIncome ?? 0),
        bold: true,
        alignment: "right",
      },
    ]);
    summaryBody.push([
      { text: "Total Pengeluaran", bold: true },
      {
        text: formatRupiah(data.summary.totalExpense ?? 0),
        bold: true,
        alignment: "right",
      },
    ]);
    const diff = data.summary.difference ?? 0;
    const diffSign = diff < 0 ? "- " : "";
    summaryBody.push([
      { text: "Selisih", bold: true },
      {
        text: `${diffSign}${formatRupiah(Math.abs(diff))}`,
        bold: true,
        alignment: "right",
      },
    ]);
  }

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
        text: data.title,
        fontSize: 16,
        bold: true,
        margin: [0, 0, 0, 4],
      },
      {
        text: `Periode: ${data.periodLabel}`,
        fontSize: 10,
        italics: true,
        margin: [0, 0, 0, 2],
      },
      {
        text: `Jenis: ${data.contentLabel}`,
        fontSize: 10,
        italics: true,
        margin: [0, 0, 0, 15],
      },
      {
        table: {
          headerRows: 1,
          widths,
          body: tableBody,
        },
        layout: "lightHorizontalLines",
      },
      {
        text: "",
        margin: [0, 15, 0, 0],
      },
      {
        table: {
          widths: ["*", 130],
          body: summaryBody,
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
