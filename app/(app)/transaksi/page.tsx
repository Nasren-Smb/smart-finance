"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { mapApiResponseError } from "@/lib/format-input";
import { mapDeleteTransactionError } from "@/lib/finance/transaction-form";
import { DeleteTransactionDialog } from "@/components/DeleteTransactionDialog";

interface TransactionItem {
  id: string;
  user_id: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  transaction_date: string;
  created_at: string;
  updated_at: string;
}

export default function TransaksiPage() {
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  const [reloadKey, setReloadKey] = useState(0);

  // State untuk dialog hapus transaksi
  const [deletingTx, setDeletingTx] = useState<TransactionItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadInitial() {
      setIsLoading(true);
      setErrorMsg(null);
      setIsSessionExpired(false);

      try {
        const balancePromise = fetch("/api/balance");
        const transactionsPromise = fetch("/api/transactions");

        const [resBalance, resTx] = await Promise.all([balancePromise, transactionsPromise]);

        if (ignore) return;

        if (resBalance.redirected || resTx.redirected) {
          setIsSessionExpired(true);
          setErrorMsg("Sesi berakhir. Silakan masuk lagi.");
          setIsLoading(false);
          return;
        }

        if (!resBalance.ok) {
          const errJson = await resBalance.json().catch(() => null);
          const mapped = mapApiResponseError(resBalance.status, errJson?.error);
          if (mapped.isSessionExpired) setIsSessionExpired(true);
          setErrorMsg(mapped.message);
          setIsLoading(false);
          return;
        }

        if (!resTx.ok) {
          const errJson = await resTx.json().catch(() => null);
          const mapped = mapApiResponseError(resTx.status, errJson?.error);
          if (mapped.isSessionExpired) setIsSessionExpired(true);
          setErrorMsg(mapped.message);
          setIsLoading(false);
          return;
        }

        const balanceData = await resBalance.json();
        const txData = await resTx.json();

        if (ignore) return;

        setBalance(balanceData.data.balance);
        setTransactions(txData.data.items);
        setNextCursor(txData.data.nextCursor);
      } catch {
        if (!ignore) {
          setErrorMsg("Gagal memuat data transaksi. Periksa koneksi Anda.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadInitial();

    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  // Load more pagination
  const handleLoadMore = async () => {
    if (!nextCursor || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const response = await fetch(`/api/transactions?cursor=${encodeURIComponent(nextCursor)}`);

      if (response.redirected) {
        setIsSessionExpired(true);
        setErrorMsg("Sesi berakhir. Silakan masuk lagi.");
        setIsLoadingMore(false);
        return;
      }

      if (!response.ok) {
        const errJson = await response.json().catch(() => null);
        const mapped = mapApiResponseError(response.status, errJson?.error);
        if (mapped.isSessionExpired) setIsSessionExpired(true);
        setErrorMsg(mapped.message);
        setIsLoadingMore(false);
        return;
      }

      const txData = await response.json();
      setTransactions((prev) => [...prev, ...txData.data.items]);
      setNextCursor(txData.data.nextCursor);
    } catch {
      setErrorMsg("Gagal memuat transaksi berikutnya.");
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Handler Hapus Transaksi
  const handleOpenDelete = (tx: TransactionItem) => {
    setDeletingTx(tx);
    setDeleteError(null);
  };

  const handleCloseDelete = () => {
    if (isDeleting) return;
    setDeletingTx(null);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingTx || isDeleting) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/transactions/${deletingTx.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.redirected) {
        setDeleteError("Sesi berakhir. Silakan masuk lagi.");
        setIsDeleting(false);
        return;
      }

      let resJson: { data?: unknown; error?: { code?: string; message?: string } } | null = null;
      try {
        resJson = await response.json();
      } catch {
        // jika 404 tanpa body json atau sejenisnya
      }

      if (!response.ok) {
        if (response.status !== 401 && response.status !== 404 && response.status !== 422) {
          console.error("[hapus] status", response.status);
        }
        const mapped = mapDeleteTransactionError(response.status, resJson?.error);
        setDeleteError(mapped.message);
        setIsDeleting(false);
        return;
      }

      // Sukses: hapus item dari list lokal dan refresh saldo
      const deletedId = deletingTx.id;
      setTransactions((prev) => prev.filter((t) => t.id !== deletedId));
      setDeletingTx(null);
      setIsDeleting(false);

      // Refresh saldo di latar belakang
      fetch("/api/balance")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.data?.balance !== undefined) {
            setBalance(data.data.balance);
          }
        })
        .catch(() => {});
    } catch {
      setDeleteError("Terjadi kesalahan koneksi. Coba lagi.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-line">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-text-main">Transaksi</h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Daftar seluruh riwayat pemasukan dan pengeluaran Anda.
          </p>
        </div>
        <Link
          href="/transaksi/baru"
          className="min-h-[44px] px-4 py-2.5 rounded-xl bg-accent text-bg-main text-xs font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <span>+</span>
          <span>Catat Transaksi</span>
        </Link>
      </div>

      {/* Ringkasan Saldo Saat Ini */}
      <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-line flex flex-col gap-1">
        <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
          Saldo Saat Ini
        </span>
        <div className="text-2xl sm:text-3xl font-bold font-mono text-text-main">
          {balance !== null ? formatRupiah(balance) : "Memuat..."}
        </div>
      </div>

      {/* Alert Error / Sesi Berakhir */}
      <div aria-live="polite">
        {errorMsg && (
          <div className="p-4 rounded-xl bg-surface border border-line flex flex-col gap-2">
            <p className="text-xs text-warning font-medium">{errorMsg}</p>
            {isSessionExpired ? (
              <Link
                href="/login"
                className="self-start text-xs font-semibold px-3 py-2 rounded-lg bg-accent text-bg-main hover:opacity-90 transition-opacity"
              >
                Masuk Sekarang
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setReloadKey((k) => k + 1)}
                className="self-start text-xs font-semibold px-3 py-2 rounded-lg bg-surface-elevated border border-line text-text-main hover:bg-line transition-colors"
              >
                Coba lagi
              </button>
            )}
          </div>
        )}
      </div>

      {/* Daftar Transaksi */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          <div className="h-16 rounded-2xl bg-surface border border-line animate-pulse" />
          <div className="h-16 rounded-2xl bg-surface border border-line animate-pulse" />
          <div className="h-16 rounded-2xl bg-surface border border-line animate-pulse" />
        </div>
      ) : transactions.length === 0 ? (
        /* Keadaan Kosong */
        <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-surface border border-line text-center gap-3">
          <p className="text-base font-semibold text-text-main">Belum ada transaksi</p>
          <p className="text-sm text-text-secondary max-w-xs">
            Mulai catat pemasukan atau pengeluaran pertamamu untuk melacak arus kas.
          </p>
          <Link
            href="/transaksi/baru"
            className="mt-2 min-h-[44px] px-5 py-2.5 rounded-xl bg-accent text-bg-main text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center"
          >
            Catat Transaksi Sekarang
          </Link>
        </div>
      ) : (
        /* Daftar Transaksi: Kartu di HP/Tablet, Tabel di Laptop (lg) */
        <div className="flex flex-col gap-4">
          {/* Tampilan HP / Tablet (< lg) berupa Kartu */}
          <div className="flex flex-col gap-3 lg:hidden">
            {transactions.map((tx) => {
              const isIncome = tx.type === "income";
              return (
                <div
                  key={tx.id}
                  className="flex flex-col gap-3 p-4 rounded-2xl bg-surface border border-line"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1 pr-2">
                      <span className="text-sm font-medium text-text-main line-clamp-1">
                        {tx.description}
                      </span>
                      <span className="text-xs text-text-secondary">
                        {formatTanggal(tx.transaction_date)}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`text-sm font-bold font-mono ${
                          isIncome ? "text-income" : "text-expense"
                        }`}
                      >
                        {isIncome ? "+" : "−"} {formatRupiah(tx.amount)}
                      </span>
                    </div>
                  </div>

                  {/* Aksi Baris Mobile */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-line/50">
                    <Link
                      href={`/transaksi/${tx.id}/edit`}
                      aria-label={`Edit transaksi: ${tx.description}`}
                      className="min-h-[44px] px-3.5 py-2 rounded-lg bg-surface-elevated border border-line text-xs font-semibold text-text-main hover:bg-line transition-colors flex items-center justify-center"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleOpenDelete(tx)}
                      aria-label={`Hapus transaksi: ${tx.description}`}
                      className="min-h-[44px] px-3.5 py-2 rounded-lg bg-surface-elevated border border-line text-xs font-semibold text-expense hover:bg-line transition-colors flex items-center justify-center"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tampilan Laptop (lg ke atas) berupa Tabel */}
          <div className="hidden lg:block overflow-hidden rounded-2xl bg-surface border border-line">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-surface-elevated text-xs font-semibold text-text-secondary">
                <tr>
                  <th scope="col" className="px-5 py-3.5">Tanggal</th>
                  <th scope="col" className="px-5 py-3.5">Keterangan / Sumber</th>
                  <th scope="col" className="px-5 py-3.5 text-right">Nominal</th>
                  <th scope="col" className="px-5 py-3.5 text-right">Aksi</th>
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
                      <td className="px-5 py-4 text-right whitespace-nowrap font-mono font-bold">
                        <span className={isIncome ? "text-income" : "text-expense"}>
                          {isIncome ? "+" : "−"} {formatRupiah(tx.amount)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/transaksi/${tx.id}/edit`}
                            aria-label={`Edit transaksi: ${tx.description}`}
                            className="min-h-[44px] px-3 py-2 rounded-lg bg-surface-elevated border border-line text-xs font-semibold text-text-main hover:bg-line transition-colors inline-flex items-center justify-center"
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleOpenDelete(tx)}
                            aria-label={`Hapus transaksi: ${tx.description}`}
                            className="min-h-[44px] px-3 py-2 rounded-lg bg-surface-elevated border border-line text-xs font-semibold text-expense hover:bg-line transition-colors inline-flex items-center justify-center"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Tombol Muat Lebih Banyak */}
          {nextCursor && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="min-h-[44px] px-6 py-2.5 rounded-xl bg-surface-elevated border border-line text-sm font-medium text-text-main hover:bg-line disabled:opacity-50 transition-colors"
              >
                {isLoadingMore ? "Memuat..." : "Muat lebih banyak"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Dialog Konfirmasi Hapus Transaksi */}
      <DeleteTransactionDialog
        isOpen={deletingTx !== null}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        error={deleteError}
        transaction={
          deletingTx
            ? {
                id: deletingTx.id,
                description: deletingTx.description,
                amount: formatRupiah(deletingTx.amount),
                date: formatTanggal(deletingTx.transaction_date),
                type: deletingTx.type,
              }
            : null
        }
      />
    </div>
  );
}
