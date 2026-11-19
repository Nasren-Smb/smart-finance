"use client";

import { useEffect, useState, useRef } from "react";
import { type TransactionFilters } from "@/lib/finance/filters";
import {
  monthRange,
  weekRange,
  derivePeriodMode,
  type PeriodMode,
} from "@/lib/finance/period";
import { todayWIB } from "@/lib/finance/date";

interface TransactionFilterBarProps {
  filters: TransactionFilters;
  onFilterChange: (newFilters: TransactionFilters) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;
}

export function TransactionFilterBar({
  filters,
  onFilterChange,
  onReset,
  hasActiveFilters,
  activeFilterCount,
}: TransactionFilterBarProps) {
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [prevFilterQ, setPrevFilterQ] = useState(filters.q ?? "");
  const [searchInput, setSearchInput] = useState(filters.q ?? "");
  const [mountedToday, setMountedToday] = useState("");

  const effectiveToday = mountedToday || todayWIB();

  // State eksplisit untuk mode periode: "semua" | "bulan" | "minggu" | "kustom"
  const [periodMode, setPeriodMode] = useState<PeriodMode>(() =>
    derivePeriodMode(filters, todayWIB())
  );

  // Lacak perubahan from/to dari luar (URL muat ulang, Back/Forward)
  const prevDateFiltersRef = useRef({ from: filters.from, to: filters.to });

  useEffect(() => {
    const prev = prevDateFiltersRef.current;
    if (prev.from !== filters.from || prev.to !== filters.to) {
      prevDateFiltersRef.current = { from: filters.from, to: filters.to };
      // Turunkan mode hanya saat from/to dari luar berubah
      setPeriodMode(
        derivePeriodMode({ from: filters.from, to: filters.to }, effectiveToday)
      );
    }
  }, [filters.from, filters.to, effectiveToday]);

  // Inisialisasi tanggal hari ini setelah mount via subscriber callback
  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) {
        setMountedToday(todayWIB());
      }
    });
    return () => {
      active = false;
    };
  }, []);

  // Sync search input saat filter.q dari luar berubah tanpa memicu render cascade
  if ((filters.q ?? "") !== prevFilterQ) {
    setPrevFilterQ(filters.q ?? "");
    setSearchInput(filters.q ?? "");
  }

  // Debounce search input sekitar 400 ms
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchInput.trim();
      const currentQ = filters.q ?? "";
      if (trimmed !== currentQ) {
        onFilterChange({
          ...filters,
          q: trimmed.length > 0 ? trimmed : undefined,
        });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput, filters, onFilterChange]);

  const currentMonth = monthRange(effectiveToday);
  const currentWeek = weekRange(effectiveToday);

  const handleTypeChange = (newType?: "income" | "expense") => {
    onFilterChange({
      ...filters,
      type: newType,
    });
  };

  const handlePeriodChange = (mode: PeriodMode) => {
    setPeriodMode(mode);

    if (mode === "semua") {
      const nextFilters = { ...filters };
      delete nextFilters.from;
      delete nextFilters.to;
      prevDateFiltersRef.current = { from: undefined, to: undefined };
      onFilterChange(nextFilters);
    } else if (mode === "bulan") {
      prevDateFiltersRef.current = {
        from: currentMonth.from,
        to: currentMonth.to,
      };
      onFilterChange({
        ...filters,
        from: currentMonth.from,
        to: currentMonth.to,
      });
    } else if (mode === "minggu") {
      prevDateFiltersRef.current = {
        from: currentWeek.from,
        to: currentWeek.to,
      };
      onFilterChange({
        ...filters,
        from: currentWeek.from,
        to: currentWeek.to,
      });
    } else if (mode === "kustom") {
      // Klik "Pilih tanggal": mode = "kustom", input Dari dan Sampai TAMPIL,
      // dan from/to TIDAK diisi otomatis.
    }
  };

  const handleCustomDateChange = (key: "from" | "to", value: string) => {
    setPeriodMode("kustom");

    if (key === "from") {
      const currentTo = filters.to;
      let newTo = currentTo;
      // Jika to sudah ada dan nilai baru > to, sesuaikan to agar sama dengan from
      if (currentTo && value > currentTo) {
        newTo = value;
      }
      prevDateFiltersRef.current = {
        from: value || undefined,
        to: newTo,
      };
      onFilterChange({
        ...filters,
        from: value || undefined,
        to: newTo,
      });
    } else {
      const currentFrom = filters.from;
      let newFrom = currentFrom;
      // to tidak boleh sebelum from
      if (currentFrom && value < currentFrom) {
        newFrom = value;
      }
      prevDateFiltersRef.current = {
        from: newFrom,
        to: value || undefined,
      };
      onFilterChange({
        ...filters,
        from: newFrom,
        to: value || undefined,
      });
    }
  };

  // Cek apakah hanya salah satu tanggal yang terisi pada mode kustom
  const isSingleCustomDateFilled =
    periodMode === "kustom" &&
    ((Boolean(filters.from) && !filters.to) ||
      (!filters.from && Boolean(filters.to)));

  return (
    <div className="flex flex-col gap-3">
      {/* Baris Pencarian dan Tombol Buka Filter Mobile */}
      <div className="flex items-center gap-2">
        {/* Kotak Pencarian */}
        <div className="relative flex-1">
          <label htmlFor="search-input" className="sr-only">
            Cari transaksi
          </label>
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </div>
          <input
            id="search-input"
            type="text"
            maxLength={100}
            placeholder="Cari transaksi..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full min-h-[44px] pl-10 pr-10 py-2.5 rounded-xl bg-surface border border-line text-text-main text-sm focus:outline-none focus:border-accent transition-colors"
          />
          {searchInput.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                if (filters.q) {
                  const nextFilters = { ...filters };
                  delete nextFilters.q;
                  onFilterChange(nextFilters);
                }
              }}
              aria-label="Hapus teks pencarian"
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-muted hover:text-text-main transition-colors min-w-[44px] min-h-[44px] justify-center"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Tombol Toggle Filter Mobile (hanya tampil di bawah lg) */}
        <button
          type="button"
          onClick={() => setIsOpenMobile((prev) => !prev)}
          aria-expanded={isOpenMobile}
          aria-label="Buka filter transaksi"
          className="lg:hidden min-h-[44px] min-w-[44px] px-3.5 py-2.5 rounded-xl bg-surface border border-line text-sm font-semibold text-text-main hover:bg-surface-elevated transition-colors flex items-center justify-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
          </svg>
          <span className="text-xs">Filter</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-accent text-bg-main text-[11px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Tombol Reset Filter jika aktif (di samping baris pencarian desktop) */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="hidden lg:flex min-h-[44px] px-3.5 py-2.5 rounded-xl border border-line bg-surface text-xs font-semibold text-text-secondary hover:text-text-main hover:bg-surface-elevated transition-colors items-center justify-center whitespace-nowrap"
          >
            Reset filter
          </button>
        )}
      </div>

      {/* Panel Kontrol Filter (Bisa dilipat di Mobile, Terbuka Permanen di Desktop lg) */}
      <div
        className={`${
          isOpenMobile ? "flex" : "hidden"
        } lg:flex flex-col gap-4 p-4 rounded-2xl bg-surface border border-line`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Kontrol Segmen: Jenis Transaksi */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary">Jenis Transaksi</label>
            <div className="inline-flex p-1 bg-bg-main rounded-xl border border-line">
              <button
                type="button"
                onClick={() => handleTypeChange(undefined)}
                className={`min-h-[44px] px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  !filters.type
                    ? "bg-surface-elevated text-text-main shadow-sm"
                    : "text-text-secondary hover:text-text-main"
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange("income")}
                className={`min-h-[44px] px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filters.type === "income"
                    ? "bg-income text-bg-main shadow-sm"
                    : "text-text-secondary hover:text-text-main"
                }`}
              >
                Pemasukan
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange("expense")}
                className={`min-h-[44px] px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filters.type === "expense"
                    ? "bg-expense text-bg-main shadow-sm"
                    : "text-text-secondary hover:text-text-main"
                }`}
              >
                Pengeluaran
              </button>
            </div>
          </div>

          {/* Kontrol Segmen: Periode */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary">Periode</label>
            <div className="inline-flex p-1 bg-bg-main rounded-xl border border-line flex-wrap sm:flex-nowrap">
              <button
                type="button"
                onClick={() => handlePeriodChange("semua")}
                className={`min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  periodMode === "semua"
                    ? "bg-surface-elevated text-text-main shadow-sm"
                    : "text-text-secondary hover:text-text-main"
                }`}
              >
                Semua waktu
              </button>
              <button
                type="button"
                onClick={() => handlePeriodChange("bulan")}
                className={`min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  periodMode === "bulan"
                    ? "bg-surface-elevated text-text-main shadow-sm"
                    : "text-text-secondary hover:text-text-main"
                }`}
              >
                Bulan ini
              </button>
              <button
                type="button"
                onClick={() => handlePeriodChange("minggu")}
                className={`min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  periodMode === "minggu"
                    ? "bg-surface-elevated text-text-main shadow-sm"
                    : "text-text-secondary hover:text-text-main"
                }`}
              >
                Minggu ini
              </button>
              <button
                type="button"
                onClick={() => handlePeriodChange("kustom")}
                className={`min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  periodMode === "kustom"
                    ? "bg-surface-elevated text-text-main shadow-sm"
                    : "text-text-secondary hover:text-text-main"
                }`}
              >
                Pilih tanggal
              </button>
            </div>
          </div>
        </div>

        {/* Input Tanggal Kustom (hanya tampil jika periodMode === 'kustom') */}
        {periodMode === "kustom" && (
          <div className="pt-3 border-t border-line/60 flex flex-col gap-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 flex flex-col gap-1">
                <label htmlFor="filter-from-date" className="text-xs font-medium text-text-secondary">
                  Dari
                </label>
                <input
                  id="filter-from-date"
                  type="date"
                  max={effectiveToday}
                  value={filters.from ?? ""}
                  onChange={(e) => handleCustomDateChange("from", e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-surface-elevated border border-line text-text-main text-xs focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <label htmlFor="filter-to-date" className="text-xs font-medium text-text-secondary">
                  Sampai
                </label>
                <input
                  id="filter-to-date"
                  type="date"
                  min={filters.from}
                  max={effectiveToday}
                  value={filters.to ?? ""}
                  onChange={(e) => handleCustomDateChange("to", e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-surface-elevated border border-line text-text-main text-xs focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>

            {/* Peringatan jika hanya salah satu tanggal yang diisi */}
            {isSingleCustomDateFilled && (
              <p className="text-xs text-warning font-medium" role="alert">
                Isi kedua tanggal
              </p>
            )}
          </div>
        )}

        {/* Tombol Reset Filter Mobile */}
        {hasActiveFilters && (
          <div className="pt-2 border-t border-line/60 flex justify-end lg:hidden">
            <button
              type="button"
              onClick={onReset}
              className="min-h-[44px] px-4 py-2 rounded-xl border border-line bg-surface-elevated text-xs font-semibold text-text-secondary hover:text-text-main transition-colors"
            >
              Reset filter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
