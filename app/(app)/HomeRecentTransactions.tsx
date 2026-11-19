"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { formatRupiah, formatTanggal } from "@/lib/format";

interface TransactionItem {
  id: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  transaction_date: string;
}

export function HomeRecentTransactions() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Muat transaksi saat mount dan saat reloadKey berubah
  useEffect(() => {
    let ignore = false;

    async function loadRecentTransactions() {
      try {
        const res = await fetch("/api/transactions");
        if (ignore) return;
        if (!res.ok) {
          if (res.status === 401) {
            setErrorMsg("Sesi telah berakhir. Silakan muat ulang halaman.");
          } else {
            setErrorMsg("Gagal memuat transaksi terbaru.");
          }
          return;
        }

        const json = await res.json();
        if (ignore) return;
        if (json && json.data && Array.isArray(json.data.items)) {
          // Ambil maksimal 5 transaksi pertama
          setTransactions(json.data.items.slice(0, 5));
        } else {
          setErrorMsg("Format data transaksi tidak valid.");
        }
      } catch {
        if (!ignore) {
          setErrorMsg("Gagal terhubung ke server. Periksa koneksi internet Anda.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadRecentTransactions();
    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  // Handle focus window untuk memuat ulang data terbaru saat kembali ke Beranda di bawah Cache Components Next.js 16
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

  return (
    <section aria-labelledby="transaksi-terbaru-heading" className="flex flex-col gap-4 w-full">
      {/* Header Bagian Transaksi Terbaru */}
      <div className="flex items-center justify-between pb-1">
        <h2 id="transaksi-terbaru-heading" className="text-base font-bold text-text-main">
          Transaksi terbaru
        </h2>
        <Link
          href="/transaksi"
          className="text-xs font-semibold text-accent hover:underline min-h-[44px] flex items-center px-1"
        >
          Lihat semua
        </Link>
      </div>

      {/* Konten Transaksi Terbaru */}
      <div aria-live="polite">
        {isLoading ? (
          <div className="rounded-2xl bg-surface p-6 border border-line flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <span className="text-text-secondary text-sm">Memuat transaksi terbaru...</span>
          </div>
        ) : errorMsg ? (
          <div className="rounded-2xl bg-surface p-6 border border-line flex flex-col gap-3">
            <p className="text-sm text-expense">{errorMsg}</p>
            <button
              type="button"
              onClick={handleRetry}
              className="self-start text-xs text-accent hover:underline min-h-[44px] flex items-center"
            >
              Coba lagi
            </button>
          </div>
        ) : transactions.length === 0 ? (
          /* Kondisi Pengguna Baru / Data Kosong */
          <div className="rounded-2xl bg-surface p-6 sm:p-8 border border-line flex flex-col items-center justify-center text-center gap-4">
            <div className="flex flex-col gap-1 max-w-sm">
              <p className="text-base font-semibold text-text-main">
                Belum ada transaksi
              </p>
              <p className="text-sm text-text-secondary">
                Catat pemasukan pertamamu untuk mulai memantau keuanganmu.
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
          <div className="flex flex-col gap-3">
            {/* Tampilan Mobile: Kartu Ringkas */}
            <div className="flex flex-col gap-2.5 lg:hidden">
              {transactions.map((tx) => {
                const isIncome = tx.type === "income";
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-surface border border-line"
                  >
                    <div className="flex flex-col gap-1 pr-3 min-w-0">
                      <span className="text-sm font-medium text-text-main truncate">
                        {tx.description}
                      </span>
                      <span className="text-xs text-text-secondary">
                        {formatTanggal(tx.transaction_date)}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`text-sm font-bold tabular-nums ${
                          isIncome ? "text-income" : "text-expense"
                        }`}
                      >
                        {isIncome ? "+" : "−"} {formatRupiah(tx.amount)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tampilan Laptop (lg ke atas): Tabel Ringkas */}
            <div className="hidden lg:block overflow-hidden rounded-2xl bg-surface border border-line">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-line bg-surface-elevated text-xs font-semibold text-text-secondary">
                  <tr>
                    <th scope="col" className="px-5 py-3.5">Tanggal</th>
                    <th scope="col" className="px-5 py-3.5">Keterangan / Sumber</th>
                    <th scope="col" className="px-5 py-3.5 text-right">Nominal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {transactions.map((tx) => {
                    const isIncome = tx.type === "income";
                    return (
                      <tr key={tx.id} className="hover:bg-surface-elevated/50 transition-colors">
                        <td className="px-5 py-4 text-text-secondary whitespace-nowrap">
                          {formatTanggal(tx.transaction_date)}
                        </td>
                        <td className="px-5 py-4 text-text-main font-medium break-all">
                          {tx.description}
                        </td>
                        <td className="px-5 py-4 text-right whitespace-nowrap font-bold tabular-nums">
                          <span className={isIncome ? "text-income" : "text-expense"}>
                            {isIncome ? "+" : "−"} {formatRupiah(tx.amount)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
