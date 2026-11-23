import ExcelJS from "exceljs";
import type { PreparedExportData } from "@/lib/finance/export";

/**
 * Menghasilkan Buffer XLSX dari PreparedExportData menggunakan exceljs.
 */
export async function generateXlsx(data: PreparedExportData): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Smart Finance";

  const worksheet = workbook.addWorksheet("Laporan Keuangan", {
    views: [
      {
        state: "frozen",
        ySplit: 5, // Beku di bawah header tabel (baris 5)
      },
    ],
  });

  // Baris 1: Judul Laporan
  const titleRow = worksheet.getRow(1);
  titleRow.getCell(1).value = data.title;
  titleRow.font = { bold: true, size: 14 };

  // Baris 2: Periode
  const periodRow = worksheet.getRow(2);
  periodRow.getCell(1).value = `Periode: ${data.periodLabel}`;
  periodRow.font = { size: 10, italic: true };

  // Baris 3: Jenis Isi
  const contentRow = worksheet.getRow(3);
  contentRow.getCell(1).value = `Jenis: ${data.contentLabel}`;
  contentRow.font = { size: 10, italic: true };

  // Baris 4: Kosong pemisah
  // Baris 5: Header Kolom
  const isAll = data.content === "all";
  const isExpense = data.content === "expense";

  // Definisi kolom
  if (isAll) {
    worksheet.columns = [
      { key: "date", width: 14 },
      { key: "type", width: 16 },
      { key: "description", width: 35 },
      { key: "amount", width: 22 },
    ];
  } else if (isExpense) {
    worksheet.columns = [
      { key: "date", width: 14 },
      { key: "description", width: 35 },
      { key: "amount", width: 22 },
    ];
  } else {
    // income
    worksheet.columns = [
      { key: "date", width: 14 },
      { key: "description", width: 35 },
      { key: "amount", width: 22 },
    ];
  }

  const tableHeaderRow = worksheet.getRow(5);
  tableHeaderRow.font = { bold: true };
  tableHeaderRow.alignment = { vertical: "middle" };

  if (isAll) {
    tableHeaderRow.getCell(1).value = "Tanggal";
    tableHeaderRow.getCell(2).value = "Jenis";
    tableHeaderRow.getCell(3).value = "Keterangan/Sumber";
    tableHeaderRow.getCell(4).value = "Nominal";
    tableHeaderRow.getCell(4).alignment = { horizontal: "right" };
  } else if (isExpense) {
    tableHeaderRow.getCell(1).value = "Tanggal";
    tableHeaderRow.getCell(2).value = "Keterangan";
    tableHeaderRow.getCell(3).value = "Nominal";
    tableHeaderRow.getCell(3).alignment = { horizontal: "right" };
  } else {
    tableHeaderRow.getCell(1).value = "Tanggal";
    tableHeaderRow.getCell(2).value = "Sumber";
    tableHeaderRow.getCell(3).value = "Nominal";
    tableHeaderRow.getCell(3).alignment = { horizontal: "right" };
  }

  // Data Baris (Mulai baris 6)
  let currentRowIdx = 6;
  for (const row of data.rows) {
    const tableRow = worksheet.getRow(currentRowIdx);
    const [y, m, d] = row.date.split("-").map(Number);
    const dateObj = new Date(Date.UTC(y, m - 1, d));

    if (isAll) {
      tableRow.getCell(1).value = dateObj;
      tableRow.getCell(1).numFmt = "yyyy-mm-dd";

      tableRow.getCell(2).value = row.typeLabel;

      tableRow.getCell(3).value = row.description;

      tableRow.getCell(4).value = row.amount;
      tableRow.getCell(4).alignment = { horizontal: "right" };
      // Format nominal Rupiah bertanda: jika pemasukan +, jika pengeluaran -
      if (row.type === "income") {
        tableRow.getCell(4).numFmt = '"+"\\Rp\\ #,##0';
      } else {
        tableRow.getCell(4).numFmt = '"-"\\Rp\\ #,##0';
      }
    } else {
      tableRow.getCell(1).value = dateObj;
      tableRow.getCell(1).numFmt = "yyyy-mm-dd";

      tableRow.getCell(2).value = row.description;

      tableRow.getCell(3).value = row.amount;
      tableRow.getCell(3).alignment = { horizontal: "right" };
      if (row.type === "income") {
        tableRow.getCell(3).numFmt = '"+"\\Rp\\ #,##0';
      } else {
        tableRow.getCell(3).numFmt = '"-"\\Rp\\ #,##0';
      }
    }
    currentRowIdx++;
  }

  // Baris kosong
  currentRowIdx++;

  // Ringkasan
  const nominalColIdx = isAll ? 4 : 3;
  const labelColIdx = isAll ? 3 : 2;

  if (isExpense) {
    const r = worksheet.getRow(currentRowIdx);
    r.font = { bold: true };
    r.getCell(labelColIdx).value = "Total Pengeluaran";
    r.getCell(nominalColIdx).value = data.summary.totalExpense ?? 0;
    r.getCell(nominalColIdx).numFmt = '"Rp "#,##0';
    r.getCell(nominalColIdx).alignment = { horizontal: "right" };
    currentRowIdx++;
  } else if (data.content === "income") {
    const r = worksheet.getRow(currentRowIdx);
    r.font = { bold: true };
    r.getCell(labelColIdx).value = "Total Pemasukan";
    r.getCell(nominalColIdx).value = data.summary.totalIncome ?? 0;
    r.getCell(nominalColIdx).numFmt = '"Rp "#,##0';
    r.getCell(nominalColIdx).alignment = { horizontal: "right" };
    currentRowIdx++;
  } else {
    // all
    const r1 = worksheet.getRow(currentRowIdx);
    r1.font = { bold: true };
    r1.getCell(labelColIdx).value = "Total Pemasukan";
    r1.getCell(nominalColIdx).value = data.summary.totalIncome ?? 0;
    r1.getCell(nominalColIdx).numFmt = '"Rp "#,##0';
    r1.getCell(nominalColIdx).alignment = { horizontal: "right" };
    currentRowIdx++;

    const r2 = worksheet.getRow(currentRowIdx);
    r2.font = { bold: true };
    r2.getCell(labelColIdx).value = "Total Pengeluaran";
    r2.getCell(nominalColIdx).value = data.summary.totalExpense ?? 0;
    r2.getCell(nominalColIdx).numFmt = '"Rp "#,##0';
    r2.getCell(nominalColIdx).alignment = { horizontal: "right" };
    currentRowIdx++;

    const r3 = worksheet.getRow(currentRowIdx);
    r3.font = { bold: true };
    r3.getCell(labelColIdx).value = "Selisih";
    const diff = data.summary.difference ?? 0;
    r3.getCell(nominalColIdx).value = diff;
    // Format selisih boleh negatif: jika negatif format otomatis menampilkan minus
    r3.getCell(nominalColIdx).numFmt = '"Rp "#,##0;[Red]"-"\\Rp\\ #,##0;"Rp "0';
    r3.getCell(nominalColIdx).alignment = { horizontal: "right" };
    currentRowIdx++;
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
