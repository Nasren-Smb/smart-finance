"use client";

import { useEffect, useState, useRef, useCallback, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { todayWIB } from "@/lib/finance/date";
import { type ChartBucket } from "@/lib/finance/chart";
import { buildBucketTransactionUrl } from "@/lib/finance/chart-nav";
import { TransactionBarChart } from "@/components/TransactionBarChart";

const emptySubscribe = () => () => {};

export function HomeChartSection() {
  const router = useRouter();

  // Tanggal hari ini di client via useSyncExternalStore tanpa memanggil Date.now() saat render
  const clientToday = useSyncExternalStore(
    emptySubscribe,
    () => todayWIB(),
    () => ""
  );

  const [buckets, setBuckets] = useState<ChartBucket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Ambil data chart ringkas (level day dengan anchor hari ini WIB)
  useEffect(() => {
    if (!clientToday) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    let ignore = false;

    async function loadHomeChart() {
      try {
        const params = new URLSearchParams({
          level: "day",
          anchor: clientToday,
        });

        const res = await fetch(`/api/chart?${params.toString()}`, {
          signal: controller.signal,
        });

        if (ignore) return;

        if (!res.ok) {
          if (res.status === 401) {
            setErrorMsg("Sesi telah berakhir. Silakan muat ulang halaman.");
          } else {
            setErrorMsg("Gagal memuat grafik ringkas.");
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

    loadHomeChart();

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [clientToday, reloadKey]);

  // Handle focus window untuk memuat ulang data saat kembali ke Beranda di bawah Cache Components Next.js 16
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

  const handleRetry = useCallback(() => {
    setIsLoading(true);
    setErrorMsg(null);
    setReloadKey((k) => k + 1);
  }, []);

  const handleBucketClick = useCallback(
    (bucket: ChartBucket) => {
      const url = buildBucketTransactionUrl(bucket);
      router.push(url);
    },
    [router]
  );

  const hasTransactions =
    buckets.length > 0 &&
    buckets.some((b) => b.income > 0 || b.expense > 0);

  return (
    <section
      aria-labelledby="home-chart-heading"
      className="rounded-2xl bg-surface p-6 border border-line flex flex-col gap-5 w-full"
    >
      {/* Header Grafik Ringkas */}
      <div className="flex items-center justify-between pb-1 border-b border-line">
        <h2 id="home-chart-heading" className="text-base font-bold text-text-main">
          Grafik minggu ini
        </h2>
        <Link
          href="/grafik"
          className="text-xs font-semibold text-accent hover:underline min-h-[44px] flex items-center px-1"
        >
          Lihat grafik lengkap
        </Link>
      </div>

      {/* Konten Grafik */}
      <div aria-live="polite" className="min-h-[220px] flex flex-col justify-center">
        {isLoading || !clientToday ? (
          <div className="flex items-center justify-center gap-3 py-12">
            <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <span className="text-text-secondary text-sm">Memuat grafik ringkas...</span>
          </div>
        ) : errorMsg ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
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
          <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
            <div className="flex flex-col gap-1 max-w-sm">
              <p className="text-sm font-semibold text-text-main">
                Belum ada transaksi minggu ini
              </p>
              <p className="text-xs text-text-secondary">
                Catat transaksi untuk melihat perbandingan pemasukan dan pengeluaran harian.
              </p>
            </div>
            <Link
              href="/transaksi/baru"
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-accent text-bg-main text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center"
            >
              Catat pemasukan pertamamu
            </Link>
          </div>
        ) : (
          <TransactionBarChart
            level="day"
            buckets={buckets}
            onBucketClick={handleBucketClick}
            height={220}
          />
        )}
      </div>
    </section>
  );
}
