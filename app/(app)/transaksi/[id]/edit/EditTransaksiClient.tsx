"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { TransactionForm } from "@/components/TransactionForm";
import { mapApiResponseError } from "@/lib/format-input";
import { type InitialTransactionData } from "@/lib/finance/transaction-form";

interface EditTransaksiClientProps {
  idPromise: Promise<{ id: string }>;
}

export function EditTransaksiClient({ idPromise }: EditTransaksiClientProps) {
  const { id } = use(idPromise);

  const [initialData, setInitialData] = useState<InitialTransactionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function fetchTransaction() {
      setIsLoading(true);
      setErrorMessage(null);
      setIsNotFound(false);
      setIsSessionExpired(false);

      try {
        const response = await fetch(`/api/transactions/${id}`);

        if (ignore) return;

        if (response.redirected) {
          setIsSessionExpired(true);
          setErrorMessage("Sesi berakhir. Silakan masuk lagi.");
          setIsLoading(false);
          return;
        }

        if (response.status === 404) {
          setIsNotFound(true);
          setErrorMessage("Transaksi tidak ditemukan.");
          setIsLoading(false);
          return;
        }

        let resJson: { data?: InitialTransactionData; error?: { code?: string; message?: string } } | null = null;
        try {
          resJson = await response.json();
        } catch {
          setIsSessionExpired(true);
          setErrorMessage("Sesi berakhir. Silakan masuk lagi.");
          setIsLoading(false);
          return;
        }

        if (!response.ok) {
          const mapped = mapApiResponseError(response.status, resJson?.error);
          if (mapped.isSessionExpired) setIsSessionExpired(true);
          setErrorMessage(mapped.message);
          setIsLoading(false);
          return;
        }

        if (resJson?.data) {
          setInitialData(resJson.data);
        }
      } catch {
        if (!ignore) {
          setErrorMessage("Gagal memuat transaksi. Periksa koneksi Anda.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    fetchTransaction();

    return () => {
      ignore = true;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 w-full max-w-xl mx-auto animate-pulse">
        <div className="h-8 w-48 bg-surface rounded-lg border border-line" />
        <div className="h-96 bg-surface rounded-2xl border border-line" />
      </div>
    );
  }

  if (isNotFound) {
    return (
      <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-surface border border-line text-center gap-3 w-full max-w-xl mx-auto">
        <p className="text-base font-semibold text-text-main">Transaksi tidak ditemukan</p>
        <p className="text-sm text-text-secondary max-w-xs">
          Transaksi ini mungkin telah dihapus atau ID yang dimasukkan tidak valid.
        </p>
        <Link
          href="/transaksi"
          className="mt-2 min-h-[44px] px-5 py-2.5 rounded-xl bg-accent text-bg-main text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center"
        >
          Kembali ke Daftar Transaksi
        </Link>
      </div>
    );
  }

  if (errorMessage && !initialData) {
    return (
      <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-surface border border-line text-center gap-3 w-full max-w-xl mx-auto">
        <p className="text-sm text-warning font-medium">{errorMessage}</p>
        {isSessionExpired ? (
          <Link
            href="/login"
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-accent text-bg-main text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center"
          >
            Masuk Sekarang
          </Link>
        ) : (
          <Link
            href="/transaksi"
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-surface-elevated border border-line text-text-main text-sm font-semibold hover:bg-line transition-colors flex items-center justify-center"
          >
            Kembali ke Daftar Transaksi
          </Link>
        )}
      </div>
    );
  }

  if (!initialData) return null;

  return <TransactionForm initialData={initialData} isEditMode={true} />;
}
