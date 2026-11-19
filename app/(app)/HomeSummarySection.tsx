"use client";

import { useEffect, useState, useCallback, useMemo, useSyncExternalStore } from "react";
import { formatRupiah } from "@/lib/format";
import { monthRange, weekRange, type DateRange } from "@/lib/finance/period";
import { todayWIB } from "@/lib/finance/date";

export type HomePeriodMode = "bulan" | "minggu" | "kustom";

interface SummaryData {
  totalIncome: number;
  totalExpense: number;
  difference: number;
}

// Subscription kosong untuk client snapshot
const emptySubscribe = () => () => {};

export function HomeSummarySection() {
  // 1. State Kartu Saldo
  const [balance, setBalance] = useState<number | null>(null);
  const [isBalanceLoading, setIsBalanceLoading] = useState(true);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [balanceReloadKey, setBalanceReloadKey] = useState(0);

  // 2. State Pemilih Periode & Ringkasan
  const [periodMode, setPeriodMode] = useState<HomePeriodMode>("bulan");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [summaryReloadKey, setSummaryReloadKey] = useState(0);

  // useSyncExternalStore mengembalikan "" saat SSR/prerender dan todayWIB() hanya di client browser.
  // Ini mencegah pembacaan unstable Date.now() selama SSR/prerendering Next.js tanpa trigger cascading render warning.
  const today = useSyncExternalStore(
    emptySubscribe,
    () => todayWIB(),
    () => ""
  );

  // Fetch Saldo
  useEffect(() => {
    let ignore = false;

    async function loadBalance() {
      try {
        const res = await fetch("/api/balance");
        if (ignore) return;
        if (!res.ok) {
          if (res.status === 401) {
            setBalanceError("Sesi telah berakhir. Silakan muat ulang halaman.");
          } else {
            setBalanceError("Gagal memuat saldo.");
          }
          return;
        }
        const json = await res.json();
        if (ignore) return;
        if (json && json.data && typeof json.data.balance === "number") {
          setBalance(json.data.balance);
        } else {
          setBalanceError("Format data saldo tidak valid.");
        }
      } catch {
        if (!ignore) {
          setBalanceError("Gagal terhubung ke server. Periksa koneksi internet Anda.");
        }
      } finally {
        if (!ignore) {
          setIsBalanceLoading(false);
        }
      }
    }

    loadBalance();
    return () => {
      ignore = true;
    };
  }, [balanceReloadKey]);

  // Validasi dan penentuan rentang tanggal kustom (dihitung langsung / derived)
  const { activeRange, validationError } = useMemo<{
    activeRange: DateRange | null;
    validationError: string | null;
  }>(() => {
    if (!today) {
      return { activeRange: null, validationError: null };
    }
    if (periodMode === "bulan") {
      return { activeRange: monthRange(today), validationError: null };
    }
    if (periodMode === "minggu") {
      return { activeRange: weekRange(today), validationError: null };
    }
    // mode === "kustom"
    if (!customFrom || !customTo) {
      return { activeRange: null, validationError: "Isi kedua tanggal." };
    }
    if (customFrom > customTo) {
      return {
        activeRange: null,
        validationError: "Tanggal Dari tidak boleh setelah Sampai.",
      };
    }
    return {
      activeRange: { from: customFrom, to: customTo },
      validationError: null,
    };
  }, [periodMode, today, customFrom, customTo]);

  // Fetch Ringkasan Periode saat activeRange atau summaryReloadKey berubah
  const activeFrom = activeRange?.from;
  const activeTo = activeRange?.to;

  useEffect(() => {
    if (!activeFrom || !activeTo) {
      return;
    }

    const fromDate = activeFrom;
    const toDate = activeTo;
    let ignore = false;

    async function loadSummary() {
      try {
        const query = new URLSearchParams({
          from: fromDate,
          to: toDate,
        }).toString();
        const res = await fetch(`/api/summary?${query}`);
        if (ignore) return;
        if (!res.ok) {
          if (res.status === 401) {
            setSummaryError("Sesi telah berakhir. Silakan muat ulang halaman.");
          } else {
            setSummaryError("Gagal memuat ringkasan periode.");
          }
          return;
        }
        const json = await res.json();
        if (ignore) return;
        if (json && json.data) {
          setSummary(json.data);
        } else {
          setSummaryError("Format data ringkasan tidak valid.");
        }
      } catch {
        if (!ignore) {
          setSummaryError("Gagal terhubung ke server. Periksa koneksi internet Anda.");
        }
      } finally {
        if (!ignore) {
          setIsSummaryLoading(false);
        }
      }
    }

    loadSummary();
    return () => {
      ignore = true;
    };
  }, [activeFrom, activeTo, summaryReloadKey]);

  const handlePeriodModeChange = (mode: HomePeriodMode) => {
    setPeriodMode(mode);
    setSummaryError(null);
    if (mode === "bulan" || mode === "minggu") {
      setIsSummaryLoading(true);
    } else {
      // mode kustom: jika input belum lengkap, jangan set loading
      if (!customFrom || !customTo || customFrom > customTo) {
        setIsSummaryLoading(false);
      } else {
        setIsSummaryLoading(true);
      }
    }
  };

  const handleCustomDateChange = (type: "from" | "to", value: string) => {
    setSummaryError(null);
    const nextFrom = type === "from" ? value : customFrom;
    const nextTo = type === "to" ? value : customTo;

    if (type === "from") setCustomFrom(value);
    if (type === "to") setCustomTo(value);

    if (nextFrom && nextTo && nextFrom <= nextTo) {
      setIsSummaryLoading(true);
    } else {
      setIsSummaryLoading(false);
    }
  };

  const handleRetryBalance = useCallback(() => {
    setIsBalanceLoading(true);
    setBalanceError(null);
    setBalanceReloadKey((k) => k + 1);
  }, []);

  const handleRetrySummary = useCallback(() => {
    if (activeRange) {
      setIsSummaryLoading(true);
      setSummaryError(null);
      setSummaryReloadKey((k) => k + 1);
    }
  }, [activeRange]);

  // Label selisih dinamis
  let differenceLabel = "Selisih periode";
  if (periodMode === "bulan") {
    differenceLabel = "Selisih bulan ini";
  } else if (periodMode === "minggu") {
    differenceLabel = "Selisih minggu ini";
  }

  // Apakah ringkasan sedang memuat (termasuk saat menunggu client snapshot tanggal hari ini)
  const isSummaryWaiting = isSummaryLoading || !today;

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Grid 2 kolom di lg ke atas untuk Kartu Saldo dan Kartu Ringkasan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* KARTU 1: SALDO */}
        <section
          aria-labelledby="saldo-heading"
          className="rounded-2xl bg-surface p-6 border border-line flex flex-col justify-between min-h-[160px]"
        >
          <div>
            <h2
              id="saldo-heading"
              className="text-sm font-medium text-text-secondary"
            >
              Saldo
            </h2>
            <div className="mt-2" aria-live="polite">
              {isBalanceLoading ? (
                <div className="flex items-center gap-2 py-2">
                  <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  <span className="text-text-secondary text-sm">Memuat saldo...</span>
                </div>
              ) : balanceError ? (
                <div className="flex flex-col gap-2 py-1">
                  <p className="text-sm text-expense">{balanceError}</p>
                  <button
                    type="button"
                    onClick={handleRetryBalance}
                    className="self-start text-xs text-accent hover:underline min-h-[44px] flex items-center"
                  >
                    Coba lagi
                  </button>
                </div>
              ) : (
                <p className="text-3xl font-bold text-text-main tabular-nums tracking-tight">
                  {formatRupiah(balance ?? 0)}
                </p>
              )}
            </div>
          </div>
          <p className="text-xs text-text-muted mt-4">
            Total saldo dari seluruh riwayat keuangan Anda.
          </p>
        </section>

        {/* KARTU 2: RINGKASAN PERIODE & PEMILIH PERIODE */}
        <section
          aria-labelledby="ringkasan-heading"
          className="rounded-2xl bg-surface p-6 border border-line flex flex-col gap-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2
              id="ringkasan-heading"
              className="text-sm font-medium text-text-secondary"
            >
              Ringkasan Periode
            </h2>

            {/* Pemilih Periode */}
            <div
              role="group"
              aria-label="Pilih periode ringkasan"
              className="inline-flex rounded-xl bg-surface-elevated p-1 border border-line self-start sm:self-auto"
            >
              <button
                type="button"
                onClick={() => handlePeriodModeChange("bulan")}
                aria-pressed={periodMode === "bulan"}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg min-h-[44px] flex items-center justify-center transition-colors ${
                  periodMode === "bulan"
                    ? "bg-surface border border-line text-accent font-semibold"
                    : "text-text-secondary hover:text-text-main"
                }`}
              >
                Bulan ini
              </button>
              <button
                type="button"
                onClick={() => handlePeriodModeChange("minggu")}
                aria-pressed={periodMode === "minggu"}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg min-h-[44px] flex items-center justify-center transition-colors ${
                  periodMode === "minggu"
                    ? "bg-surface border border-line text-accent font-semibold"
                    : "text-text-secondary hover:text-text-main"
                }`}
              >
                Minggu ini
              </button>
              <button
                type="button"
                onClick={() => handlePeriodModeChange("kustom")}
                aria-pressed={periodMode === "kustom"}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg min-h-[44px] flex items-center justify-center transition-colors ${
                  periodMode === "kustom"
                    ? "bg-surface border border-line text-accent font-semibold"
                    : "text-text-secondary hover:text-text-main"
                }`}
              >
                Pilih tanggal
              </button>
            </div>
          </div>

          {/* Form Input Tanggal Kustom */}
          {periodMode === "kustom" && (
            <div className="flex flex-col sm:flex-row sm:items-end gap-3 p-3 rounded-xl bg-surface-elevated border border-line">
              <div className="flex-1 flex flex-col gap-1">
                <label
                  htmlFor="home-custom-from"
                  className="text-xs text-text-secondary"
                >
                  Dari
                </label>
                <input
                  id="home-custom-from"
                  type="date"
                  value={customFrom}
                  onChange={(e) => handleCustomDateChange("from", e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-surface border border-line text-text-main focus:outline-none focus:border-accent min-h-[44px]"
                />
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <label
                  htmlFor="home-custom-to"
                  className="text-xs text-text-secondary"
                >
                  Sampai
                </label>
                <input
                  id="home-custom-to"
                  type="date"
                  value={customTo}
                  onChange={(e) => handleCustomDateChange("to", e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-surface border border-line text-text-main focus:outline-none focus:border-accent min-h-[44px]"
                />
              </div>
            </div>
          )}

          {/* Pesan Validasi Kustom */}
          {periodMode === "kustom" && validationError && (
            <p className="text-xs text-warning" aria-live="polite">
              {validationError}
            </p>
          )}

          {/* Isi Ringkasan */}
          <div aria-live="polite">
            {isSummaryWaiting ? (
              <div className="flex items-center gap-2 py-4">
                <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                <span className="text-text-secondary text-sm">
                  Memuat ringkasan...
                </span>
              </div>
            ) : summaryError ? (
              <div className="flex flex-col gap-2 py-2">
                <p className="text-sm text-expense">{summaryError}</p>
                <button
                  type="button"
                  onClick={handleRetrySummary}
                  className="self-start text-xs text-accent hover:underline min-h-[44px] flex items-center"
                >
                  Coba lagi
                </button>
              </div>
            ) : summary && activeRange ? (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Pemasukan */}
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-text-secondary">Pemasukan</span>
                    <span className="text-lg font-semibold text-income tabular-nums">
                      +{formatRupiah(summary.totalIncome)}
                    </span>
                  </div>

                  {/* Pengeluaran */}
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-text-secondary">Pengeluaran</span>
                    <span className="text-lg font-semibold text-expense tabular-nums">
                      −{formatRupiah(summary.totalExpense)}
                    </span>
                  </div>
                </div>

                {/* Selisih */}
                <div className="pt-3 border-t border-line flex items-center justify-between">
                  <span className="text-xs text-text-secondary">
                    {differenceLabel}
                  </span>
                  <span
                    className={`text-base font-semibold tabular-nums ${
                      summary.difference > 0
                        ? "text-income"
                        : summary.difference < 0
                        ? "text-expense"
                        : "text-text-main"
                    }`}
                  >
                    {summary.difference > 0
                      ? `+${formatRupiah(summary.difference)}`
                      : summary.difference < 0
                      ? `−${formatRupiah(Math.abs(summary.difference))}`
                      : formatRupiah(0)}
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
