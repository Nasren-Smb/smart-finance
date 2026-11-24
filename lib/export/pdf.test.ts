import { describe, it, expect } from "vitest";
import { generatePdf } from "./pdf";
import { prepareExportData } from "@/lib/finance/export";

describe("lib/export/pdf.ts", () => {
  const sampleTransactions = [
    {
      transaction_date: "2026-11-01",
      description: "Gaji bulanan",
      type: "income" as const,
      amount: 5000000,
    },
    {
      transaction_date: "2026-11-02",
      description: "Belanja dapur",
      type: "expense" as const,
      amount: 300000,
    },
  ];

  it("berhasil membuat PDF untuk jenis isi 'expense'", async () => {
    const prepared = prepareExportData(
      sampleTransactions.filter((t) => t.type === "expense"),
      "expense",
      "2026-11-01",
      "2026-11-30"
    );
    const buffer = await generatePdf(prepared);
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(0);
    // Header file PDF diawali dengan "%PDF"
    expect(buffer.subarray(0, 4).toString("ascii")).toBe("%PDF");
  });

  it("berhasil membuat PDF untuk jenis isi 'income'", async () => {
    const prepared = prepareExportData(
      sampleTransactions.filter((t) => t.type === "income"),
      "income",
      "2026-11-01",
      "2026-11-30"
    );
    const buffer = await generatePdf(prepared);
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(0);
    expect(buffer.subarray(0, 4).toString("ascii")).toBe("%PDF");
  });

  it("berhasil membuat PDF untuk jenis isi 'all' dengan selisih positif", async () => {
    const prepared = prepareExportData(
      sampleTransactions,
      "all",
      "2026-11-01",
      "2026-11-30"
    );
    const buffer = await generatePdf(prepared);
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(0);
    expect(buffer.subarray(0, 4).toString("ascii")).toBe("%PDF");
  });

  it("berhasil membuat PDF untuk jenis isi 'all' dengan selisih negatif", async () => {
    const deficitTransactions = [
      {
        transaction_date: "2026-11-01",
        description: "Honor kecil",
        type: "income" as const,
        amount: 200000,
      },
      {
        transaction_date: "2026-11-02",
        description: "Servis laptop",
        type: "expense" as const,
        amount: 800000,
      },
    ];
    const prepared = prepareExportData(
      deficitTransactions,
      "all",
      "2026-11-01",
      "2026-11-30"
    );
    const buffer = await generatePdf(prepared);
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(0);
    expect(buffer.subarray(0, 4).toString("ascii")).toBe("%PDF");
  });
});
