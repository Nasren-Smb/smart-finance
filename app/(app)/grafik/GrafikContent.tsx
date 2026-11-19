"use client";

import { useEffect, useState, useRef, useCallback, useSyncExternalStore } from "react";
import { todayWIB } from "@/lib/finance/date";
import { type ChartLevel, type ChartBucket } from "@/lib/finance/chart";
import {
  shiftAnchor,
  canGoNext,
  formatPeriodTitle,
} from "@/lib/finance/chart-nav";
import { TransactionBarChart } from "@/components/TransactionBarChart";

const emptySubscribe = () => () => {};

export function GrafikContent() {
  // Ambil tanggal hari ini via useSyncExternalStore untuk kepatuhan SSR prerender Next.js 16
  const clientToday = useSyncExternalStore(
    emptySubscribe,
    () => todayWIB(),
    () => ""
  );

  // State tingkat tampilan: day | week | month | year (DEFAULT: day)
  const [level, setLevel] = useState<ChartLevel>("day");
  // State pergeseran anchor dari clientToday (offset)
  const [customAnchor, setCustomAnchor] = useState<string | null>(null);

  const [buckets, setBuckets] = useState<ChartBucket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Anchor aktif: customAnchor jika pengguna sudah navigasi, atau clientToday
  const effectiveAnchor = customAnchor || clientToday;

  // Fetch chart data
  useEffect(() => {
    if (!effectiveAnchor) {
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    let ignore = false;

    async function loadChart() {
      try {
        const params = new URLSearchParams({ level });
        if (level !== "year") {
          params.set("anchor", effectiveAnchor);
        }

        const res = await fetch(`/api/chart?${params.toString()}`, {
          signal: controller.signal,
        });

        if (ignore) return;

        if (!res.ok) {
          if (res.status === 401) {
            setErrorMsg("Sesi telah berakhir. Silakan muat ulang halaman.");
          } else {
            setErrorMsg("Gagal memuat data grafik.");
          }
          return;
        }

        const json = await res.json();
        if (ignore) return;

        if (json && json.data && Array.isArray(json.data.buckets)) {
          setBuckets(json.data.buckets);
        } else {
          setErrorMsg("Format data grafik tidak valid.");
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        if (!ignore) {
          setErrorMsg("Gagal terhubung ke server. Periksa koneksi internet Anda.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadChart();

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [level, effectiveAnchor, reloadKey]);

  // Handle focus window untuk memuat ulang data saat kembali ke halaman di bawah Cache Components Next.js 16
  useEffect(() => {
    const onFocus = () => {
      setIsLoading(true);
      setErrorMsg(null);
      setReloadKey((k) => k + 1);
    };
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const handleLevelChange = (newLevel: ChartLevel) => {
    setIsLoading(true);
    setErrorMsg(null);
    setLevel(newLevel);
    // Reset anchor ke clientToday saat berpindah tingkat tampilan
    setCustomAnchor(null);
  };

  const handlePrev = useCallback(() => {
    if (level === "year" || !effectiveAnchor) return;
    setIsLoading(true);
    setErrorMsg(null);
    setCustomAnchor(shiftAnchor(effectiveAnchor, level, "prev"));
  }, [level, effectiveAnchor]);

  const handleNext = useCallback(() => {
    if (level === "year" || !effectiveAnchor || !clientToday) return;
    if (!canGoNext(effectiveAnchor, level, clientToday)) return;
    setIsLoading(true);
    setErrorMsg(null);
    setCustomAnchor(shiftAnchor(effectiveAnchor, level, "next"));
  }, [level, effectiveAnchor, clientToday]);

  const handleRetry = useCallback(() => {
    setIsLoading(true);
    setErrorMsg(null);
    setReloadKey((k) => k + 1);
  }, []);

  const periodTitle = effectiveAnchor
    ? formatPeriodTitle(effectiveAnchor, level)
    : "...";

  const isNextDisabled =
    level === "year" ||
    !clientToday ||
    !canGoNext(effectiveAnchor, level, clientToday);

  // Periksa apakah semua bucket bernilai 0 atau kosong
  const hasTransactions =
    buckets.length > 0 &&
    buckets.some((b) => b.income > 0 || b.expense > 0);

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl">
      {/* Header Halaman */}
      <div className="pb-2 border-b border-line">
        <h1 className="text-xl lg:text-2xl font-bold text-text-main">Grafik</h1>
      </div>

      {/* Kontrol Tab Tingkat Tampilan */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div
          role="tablist"
          aria-label="Tingkat tampilan grafik"
          className="inline-flex rounded-xl bg-surface-elevated p-1 border border-line self-start"
        >
          <button
            type="button"
            role="tab"
            aria-selected={level === "day"}
            onClick={() => handleLevelChange("day")}
            className={`min-h-[44px] px-4 py-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-center ${
              level === "day"
                ? "bg-surface border border-line text-accent font-semibold"
                : "text-text-secondary hover:text-text-main"
            }`}
          >
            Harian
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={level === "week"}
            onClick={() => handleLevelChange("week")}
            className={`min-h-[44px] px-4 py-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-center ${
              level === "week"
                ? "bg-surface border border-line text-accent font-semibold"
                : "text-text-secondary hover:text-text-main"
            }`}
          >
            Mingguan
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={level === "month"}
            onClick={() => handleLevelChange("month")}
            className={`min-h-[44px] px-4 py-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-center ${
              level === "month"
                ? "bg-surface border border-line text-accent font-semibold"
                : "text-text-secondary hover:text-text-main"
            }`}
          >
            Bulanan
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={level === "year"}
            onClick={() => handleLevelChange("year")}
            className={`min-h-[44px] px-4 py-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-center ${
              level === "year"
                ? "bg-surface border border-line text-accent font-semibold"
                : "text-text-secondary hover:text-text-main"
            }`}
          >
            Tahunan
          </button>
        </div>

        {/* Kontrol Navigasi Periode (day, week, month) */}
        {level !== "year" && (
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Periode sebelumnya"
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-surface-elevated border border-line text-xs font-medium text-text-secondary hover:text-text-main hover:bg-line transition-colors flex items-center justify-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              <span>Sebelumnya</span>
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={isNextDisabled}
              aria-label="Periode berikutnya"
              className={`min-h-[44px] px-3.5 py-2 rounded-xl border text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                isNextDisabled
                  ? "bg-surface/50 border-line/50 text-text-muted cursor-not-allowed"
                  : "bg-surface-elevated border border-line text-text-secondary hover:text-text-main hover:bg-line"
              }`}
            >
              <span>Berikutnya</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Kartu Utama Grafik */}
      <section
        aria-labelledby="grafik-heading"
        className="rounded-2xl bg-surface p-6 border border-line flex flex-col gap-6"
      >
        {/* Judul Periode Aktif */}
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div>
            <h2 id="grafik-heading" className="text-base font-bold text-text-main">
              {periodTitle}
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Grafik perbandingan pemasukan dan pengeluaran.
            </p>
          </div>
        </div>

        {/* Status Memuat / Error / Data Kosong / Grafik */}
        <div aria-live="polite" className="min-h-[260px] flex flex-col justify-center">
          {isLoading ? (
            <div className="flex items-center justify-center gap-3 py-16">
              <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <span className="text-text-secondary text-sm">Memuat data grafik...</span>
            </div>
          ) : errorMsg ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <p className="text-sm text-expense">{errorMsg}</p>
              <button
                type="button"
                onClick={handleRetry}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-surface-elevated border border-line text-xs font-semibold text-accent hover:underline flex items-center justify-center"
              >
                Coba lagi
              </button>
            </div>
          ) : !hasTransactions ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
              <p className="text-sm font-semibold text-text-main">
                Belum ada transaksi di periode ini
              </p>
              <p className="text-xs text-text-secondary max-w-sm">
                Transaksi yang Anda catat pada rentang waktu ini akan ditampilkan sebagai grafik batang di sini.
              </p>
            </div>
          ) : (
            <TransactionBarChart level={level} buckets={buckets} />
          )}
        </div>
      </section>
    </div>
  );
}
