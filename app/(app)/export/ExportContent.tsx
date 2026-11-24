"use client";

import { useState, useSyncExternalStore, useEffect, useRef } from "react";
import Link from "next/link";
import { todayWIB } from "@/lib/finance/date";
import type { ExportContent, ExportFormat } from "@/lib/finance/export";
import {
  getAvailableYears,
  getAvailableMonths,
  getMonthDateRange,
  parseContentDispositionFileName,
  validateCustomDateRange,
} from "@/lib/finance/export-form";

type PeriodSelectionMode = "bulan" | "kustom";

const emptySubscribe = () => () => {};

export function ExportContentSection() {
  // Ambil tanggal hari ini WIB via useSyncExternalStore (aman dari unstable Date.now() saat SSR/prerender)
  const today = useSyncExternalStore(
    emptySubscribe,
    () => todayWIB(),
    () => ""
  );

  // Parse tahun dan bulan dari today WIB (default 2026 dan 11 jika belum mount di client)
  const [currentYear, currentMonth] = today
    ? today.split("-").slice(0, 2).map(Number)
    : [2026, 11];

  // State Form (undefined menandakan belum diubah secara manual oleh pengguna, fallback ke currentYear/currentMonth)
  const [content, setContent] = useState<ExportContent>("all");
  const [periodMode, setPeriodMode] = useState<PeriodSelectionMode>("bulan");
  const [userSelectedYear, setUserSelectedYear] = useState<number | null>(null);
  const [userSelectedMonth, setUserSelectedMonth] = useState<number | null>(null);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [format, setFormat] = useState<ExportFormat>("xlsx");

  // Nilai efektif tahun dan bulan yang dipilih
  const effectiveYear = userSelectedYear ?? currentYear;
  const effectiveMonth = userSelectedMonth ?? currentMonth;

  // State Status / Notifikasi
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAuthError, setIsAuthError] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // AbortController ref untuk membatalkan unduhan jika komponen dilepas
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup abort controller saat unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Reset status pesan saat pengguna mengubah nilai form apa pun
  const clearMessages = () => {
    if (successMessage) setSuccessMessage(null);
    if (errorMessage) setErrorMessage(null);
    if (isAuthError) setIsAuthError(false);
    if (validationError) setValidationError(null);
  };

  const handleContentChange = (val: ExportContent) => {
    clearMessages();
    setContent(val);
  };

  const handlePeriodModeChange = (val: PeriodSelectionMode) => {
    clearMessages();
    setPeriodMode(val);
  };

  const handleYearChange = (yearVal: number) => {
    clearMessages();
    setUserSelectedYear(yearVal);
    // Jika tahun yang dipilih adalah tahun berjalan dan bulan yang dipilih sebelumnya > bulan berjalan, sesuaikan
    if (yearVal === currentYear && effectiveMonth > currentMonth) {
      setUserSelectedMonth(currentMonth);
    }
  };

  const handleMonthChange = (monthVal: number) => {
    clearMessages();
    setUserSelectedMonth(monthVal);
  };

  const handleCustomFromChange = (val: string) => {
    clearMessages();
    setCustomFrom(val);
  };

  const handleCustomToChange = (val: string) => {
    clearMessages();
    setCustomTo(val);
  };

  const handleFormatChange = (val: ExportFormat) => {
    clearMessages();
    setFormat(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    // Tentukan parameter from dan to
    let fromDate = "";
    let toDate = "";

    if (periodMode === "bulan") {
      const range = getMonthDateRange(effectiveYear, effectiveMonth);
      fromDate = range.from;
      toDate = range.to;
    } else {
      const valRes = validateCustomDateRange(customFrom, customTo);
      if (!valRes.valid) {
        setValidationError(valRes.error ?? "Rentang tanggal tidak valid.");
        return;
      }
      fromDate = customFrom;
      toDate = customTo;
    }

    // Buat AbortController baru
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsLoading(true);

    try {
      const params = new URLSearchParams({
        content,
        from: fromDate,
        to: toDate,
        format,
      });

      const res = await fetch(`/api/export?${params.toString()}`, {
        method: "GET",
        signal: controller.signal,
      });

      if (!res.ok) {
        if (res.status === 401) {
          setIsAuthError(true);
          setErrorMessage("Sesi berakhir. Silakan masuk lagi.");
          return;
        }

        // Coba parse pesan error dari JSON
        try {
          const errorJson = await res.json();
          if (errorJson?.error?.message) {
            setErrorMessage(errorJson.error.message);
          } else {
            setErrorMessage("Gagal mengunduh laporan. Coba lagi.");
          }
        } catch {
          setErrorMessage("Gagal mengunduh laporan. Coba lagi.");
        }
        return;
      }

      // Berhasil: ambil blob dan Content-Disposition
      const blob = await res.blob();
      const contentDisposition = res.headers.get("Content-Disposition");
      const fallbackName = `smart-finance-laporan.${format}`;
      const fileName = parseContentDispositionFileName(contentDisposition, fallbackName);

      // Trigger download via object URL
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);

      setSuccessMessage("Laporan diunduh.");
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }
      setErrorMessage("Gagal mengunduh laporan. Coba lagi.");
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const availableYears = getAvailableYears(currentYear);
  const availableMonths = getAvailableMonths(effectiveYear, currentYear, currentMonth);

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl">
      {/* Header Halaman */}
      <div className="pb-2 border-b border-line">
        <h1 className="text-xl lg:text-2xl font-bold text-text-main">
          Export Laporan
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Unduh data transaksi keuangan Anda dalam format Excel atau PDF.
        </p>
      </div>

      {/* Kartu Form Tunggal */}
      <div className="rounded-2xl bg-surface p-6 border border-line">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* 1. Isi Laporan */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-text-secondary">
              Isi Laporan
            </label>
            <div
              role="radiogroup"
              aria-label="Pilihan isi laporan"
              className="inline-flex p-1 bg-bg-main rounded-xl border border-line flex-wrap sm:flex-nowrap"
            >
              <button
                type="button"
                role="radio"
                aria-checked={content === "all"}
                onClick={() => handleContentChange("all")}
                className={`min-h-[44px] px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex-1 text-center ${
                  content === "all"
                    ? "bg-surface-elevated text-text-main shadow-sm"
                    : "text-text-secondary hover:text-text-main"
                }`}
              >
                Semua transaksi
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={content === "income"}
                onClick={() => handleContentChange("income")}
                className={`min-h-[44px] px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex-1 text-center ${
                  content === "income"
                    ? "bg-income text-bg-main shadow-sm"
                    : "text-text-secondary hover:text-text-main"
                }`}
              >
                Pemasukan
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={content === "expense"}
                onClick={() => handleContentChange("expense")}
                className={`min-h-[44px] px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex-1 text-center ${
                  content === "expense"
                    ? "bg-expense text-bg-main shadow-sm"
                    : "text-text-secondary hover:text-text-main"
                }`}
              >
                Pengeluaran
              </button>
            </div>
          </div>

          {/* 2. Periode */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-semibold text-text-secondary">
              Periode
            </label>
            <div
              role="radiogroup"
              aria-label="Mode pilihan periode"
              className="inline-flex p-1 bg-bg-main rounded-xl border border-line max-w-xs"
            >
              <button
                type="button"
                role="radio"
                aria-checked={periodMode === "bulan"}
                onClick={() => handlePeriodModeChange("bulan")}
                className={`min-h-[44px] px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex-1 text-center ${
                  periodMode === "bulan"
                    ? "bg-surface-elevated text-text-main shadow-sm"
                    : "text-text-secondary hover:text-text-main"
                }`}
              >
                Per bulan
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={periodMode === "kustom"}
                onClick={() => handlePeriodModeChange("kustom")}
                className={`min-h-[44px] px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex-1 text-center ${
                  periodMode === "kustom"
                    ? "bg-surface-elevated text-text-main shadow-sm"
                    : "text-text-secondary hover:text-text-main"
                }`}
              >
                Pilih tanggal
              </button>
            </div>

            {/* Kontrol Periode: Per Bulan */}
            {periodMode === "bulan" && (
              <div className="flex flex-col sm:flex-row gap-3 p-3 rounded-xl bg-surface-elevated border border-line">
                <div className="flex-1 flex flex-col gap-1">
                  <label htmlFor="export-month" className="text-xs text-text-secondary">
                    Bulan
                  </label>
                  <select
                    id="export-month"
                    value={effectiveMonth}
                    onChange={(e) => handleMonthChange(Number(e.target.value))}
                    className="w-full min-h-[44px] px-3 py-2 rounded-lg bg-surface border border-line text-text-main text-xs focus:outline-none focus:border-accent"
                  >
                    {availableMonths.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <label htmlFor="export-year" className="text-xs text-text-secondary">
                    Tahun
                  </label>
                  <select
                    id="export-year"
                    value={effectiveYear}
                    onChange={(e) => handleYearChange(Number(e.target.value))}
                    className="w-full min-h-[44px] px-3 py-2 rounded-lg bg-surface border border-line text-text-main text-xs focus:outline-none focus:border-accent"
                  >
                    {availableYears.map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Kontrol Periode: Pilih Tanggal (menggunakan pola input TransactionFilterBar) */}
            {periodMode === "kustom" && (
              <div className="flex flex-col gap-2 p-3 rounded-xl bg-surface-elevated border border-line">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 flex flex-col gap-1">
                    <label htmlFor="export-custom-from" className="text-xs text-text-secondary">
                      Dari
                    </label>
                    <input
                      id="export-custom-from"
                      type="date"
                      value={customFrom}
                      onChange={(e) => handleCustomFromChange(e.target.value)}
                      className="w-full min-h-[44px] px-3 py-2 rounded-lg bg-surface border border-line text-text-main text-xs focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <label htmlFor="export-custom-to" className="text-xs text-text-secondary">
                      Sampai
                    </label>
                    <input
                      id="export-custom-to"
                      type="date"
                      value={customTo}
                      onChange={(e) => handleCustomToChange(e.target.value)}
                      className="w-full min-h-[44px] px-3 py-2 rounded-lg bg-surface border border-line text-text-main text-xs focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
                {validationError && (
                  <p className="text-xs text-warning font-medium mt-1" role="alert">
                    {validationError}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 3. Format Berkas */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-text-secondary">
              Format Berkas
            </label>
            <div
              role="radiogroup"
              aria-label="Pilihan format berkas"
              className="inline-flex p-1 bg-bg-main rounded-xl border border-line max-w-xs"
            >
              <button
                type="button"
                role="radio"
                aria-checked={format === "xlsx"}
                onClick={() => handleFormatChange("xlsx")}
                className={`min-h-[44px] px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex-1 text-center ${
                  format === "xlsx"
                    ? "bg-surface-elevated text-text-main shadow-sm"
                    : "text-text-secondary hover:text-text-main"
                }`}
              >
                Excel (.xlsx)
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={format === "pdf"}
                onClick={() => handleFormatChange("pdf")}
                className={`min-h-[44px] px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex-1 text-center ${
                  format === "pdf"
                    ? "bg-surface-elevated text-text-main shadow-sm"
                    : "text-text-secondary hover:text-text-main"
                }`}
              >
                PDF (.pdf)
              </button>
            </div>
          </div>

          {/* Notifikasi Status Pesan */}
          {successMessage && (
            <div
              role="status"
              aria-live="polite"
              className="p-3 rounded-xl bg-income/10 border border-income/30 text-xs text-income font-medium"
            >
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div
              role="alert"
              aria-live="assertive"
              className="p-3 rounded-xl bg-expense/10 border border-expense/30 text-xs text-expense font-medium flex flex-col gap-1.5"
            >
              <span>{errorMessage}</span>
              {isAuthError && (
                <Link
                  href="/login"
                  className="text-accent underline font-semibold self-start"
                >
                  Buka halaman Masuk
                </Link>
              )}
            </div>
          )}

          {/* Tombol Unduh Laporan */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl bg-accent text-bg-main font-semibold text-sm hover:opacity-90 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? "Menyiapkan..." : "Unduh laporan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
