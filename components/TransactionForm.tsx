"use client";

import { useState, useLayoutEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { todayWIB } from "@/lib/finance/date";
import { formatRupiah } from "@/lib/format";
import { parseNominal, mapApiResponseError } from "@/lib/format-input";
import { transactionInputSchema } from "@/lib/finance/schemas";
import {
  getChangedTransactionFields,
  mapEditTransactionError,
  type InitialTransactionData,
} from "@/lib/finance/transaction-form";

interface TransactionFormProps {
  initialData?: InitialTransactionData;
  isEditMode?: boolean;
}

export function TransactionForm({
  initialData,
  isEditMode = false,
}: TransactionFormProps) {
  const router = useRouter();

  const [type, setType] = useState<"income" | "expense">(() => initialData?.type ?? "expense");
  const [rawAmount, setRawAmount] = useState(() => (initialData ? String(initialData.amount) : ""));
  const [description, setDescription] = useState(() => initialData?.description ?? "");
  const [transactionDate, setTransactionDate] = useState(() => initialData?.transaction_date ?? todayWIB());

  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const maxDate = todayWIB();
  const parsedAmount = parseNominal(rawAmount);

  // Fungsi reset state form
  const resetForm = () => {
    if (initialData) {
      setType(initialData.type);
      setRawAmount(String(initialData.amount));
      setDescription(initialData.description);
      setTransactionDate(initialData.transaction_date);
    } else {
      setType("expense");
      setRawAmount("");
      setDescription("");
      setTransactionDate(todayWIB());
    }
    setGeneralError(null);
    setFieldErrors({});
    setIsSessionExpired(false);
    setIsLoading(false);
  };

  // Reset form saat komponen di-unmount / disembunyikan (React Activity / Cache Components)
  useLayoutEffect(() => {
    return () => {
      if (initialData) {
        setType(initialData.type);
        setRawAmount(String(initialData.amount));
        setDescription(initialData.description);
        setTransactionDate(initialData.transaction_date);
      } else {
        setType("expense");
        setRawAmount("");
        setDescription("");
        setTransactionDate(todayWIB());
      }
      setGeneralError(null);
      setFieldErrors({});
      setIsSessionExpired(false);
      setIsLoading(false);
    };
  }, [initialData]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^\d.]/g, "");
    setRawAmount(val);
  };

  // Hitung perbedaan jika dalam mode edit
  const changedFields = isEditMode && initialData
    ? getChangedTransactionFields(initialData, {
        type,
        amount: parsedAmount ?? 0,
        description,
        transaction_date: transactionDate,
      })
    : null;

  const hasNoChangesInEdit = isEditMode && changedFields === null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setFieldErrors({});
    setIsSessionExpired(false);

    if (isEditMode) {
      if (!initialData) return;
      if (hasNoChangesInEdit) {
        setGeneralError("Tidak ada perubahan");
        return;
      }

      // Validasi parsial field yang berubah
      setIsLoading(true);

      try {
        const response = await fetch(`/api/transactions/${initialData.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(changedFields),
        });

        if (response.redirected) {
          setIsSessionExpired(true);
          setGeneralError("Sesi berakhir. Silakan masuk lagi.");
          return;
        }

        let resJson: { data?: unknown; error?: { code?: string; message?: string; fields?: Record<string, string> } } | null = null;
        try {
          resJson = await response.json();
        } catch {
          setIsSessionExpired(true);
          setGeneralError("Sesi berakhir. Silakan masuk lagi.");
          return;
        }

        if (!response.ok) {
          const mapped = mapEditTransactionError(response.status, resJson?.error);
          if (mapped.isSessionExpired) {
            setIsSessionExpired(true);
          }
          if (mapped.fields) {
            setFieldErrors(mapped.fields);
          }
          setGeneralError(mapped.message);
          return;
        }

        // Jalur sukses edit
        router.push("/transaksi");
        router.refresh();
      } catch {
        setGeneralError("Terjadi kesalahan koneksi. Coba lagi.");
      } finally {
        setIsLoading(false);
      }
    } else {
      // Mode Tambah Transaksi
      const payload = {
        type,
        amount: parsedAmount ?? 0,
        description,
        transaction_date: transactionDate,
      };

      const validation = transactionInputSchema.safeParse(payload);
      if (!validation.success) {
        const errMap: Record<string, string> = {};
        for (const issue of validation.error.issues) {
          const path = issue.path.join(".") || "root";
          errMap[path] = issue.message;
        }
        setFieldErrors(errMap);
        return;
      }

      setIsLoading(true);

      try {
        const response = await fetch("/api/transactions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(validation.data),
        });

        if (response.redirected) {
          setIsSessionExpired(true);
          setGeneralError("Sesi berakhir. Silakan masuk lagi.");
          return;
        }

        let resJson: { data?: unknown; error?: { code?: string; message?: string; fields?: Record<string, string> } } | null = null;
        try {
          resJson = await response.json();
        } catch {
          setIsSessionExpired(true);
          setGeneralError("Sesi berakhir. Silakan masuk lagi.");
          return;
        }

        if (!response.ok) {
          const mapped = mapApiResponseError(response.status, resJson?.error);
          if (mapped.isSessionExpired) {
            setIsSessionExpired(true);
          }
          if (mapped.fields) {
            setFieldErrors(mapped.fields);
          }
          setGeneralError(mapped.message);
          return;
        }

        // Jalur sukses tambah: kosongkan form dan navigasikan
        resetForm();
        router.push("/transaksi");
        router.refresh();
      } catch {
        setGeneralError("Terjadi kesalahan koneksi. Coba lagi.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const isIncome = type === "income";

  return (
    <div className="flex flex-col gap-6 w-full max-w-xl mx-auto">
      <div className="pb-2 border-b border-line flex items-center justify-between">
        <h1 className="text-xl lg:text-2xl font-bold text-text-main">
          {isEditMode ? "Edit transaksi" : "Tambah transaksi"}
        </h1>
        <Link
          href="/transaksi"
          className="text-xs text-text-secondary hover:text-text-main px-3 py-2 rounded-lg border border-line"
        >
          Kembali
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-2xl bg-surface p-6 border border-line">
        {/* Toggle Jenis Transaksi */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-text-secondary">Jenis Transaksi</label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-bg-main rounded-xl border border-line">
            <button
              type="button"
              onClick={() => {
                setType("expense");
                setFieldErrors({});
              }}
              disabled={isLoading}
              className={`min-h-[44px] rounded-lg text-sm font-semibold transition-colors ${
                !isIncome
                  ? "bg-expense text-bg-main"
                  : "text-text-secondary hover:text-text-main"
              }`}
            >
              Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => {
                setType("income");
                setFieldErrors({});
              }}
              disabled={isLoading}
              className={`min-h-[44px] rounded-lg text-sm font-semibold transition-colors ${
                isIncome
                  ? "bg-income text-bg-main"
                  : "text-text-secondary hover:text-text-main"
              }`}
            >
              Pemasukan
            </button>
          </div>
        </div>

        {/* Input Nominal */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="amount" className="text-xs font-semibold text-text-secondary">
            Nominal (Rupiah)
          </label>
          <input
            id="amount"
            name="amount"
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={rawAmount}
            onChange={handleAmountChange}
            disabled={isLoading}
            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-line text-text-main text-lg font-mono focus:outline-none focus:border-accent transition-colors"
          />
          {parsedAmount !== null && (
            <p className="text-xs text-text-secondary">
              Pratinjau: <span className="text-text-main font-semibold">{formatRupiah(parsedAmount)}</span>
            </p>
          )}
          {fieldErrors.amount && (
            <p className="text-xs text-warning" role="alert">{fieldErrors.amount}</p>
          )}
        </div>

        {/* Input Keterangan / Sumber */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="description" className="text-xs font-semibold text-text-secondary">
            {isIncome ? "Sumber" : "Keterangan"}
          </label>
          <input
            id="description"
            name="description"
            type="text"
            maxLength={100}
            placeholder={isIncome ? "Dari mana? misal gaji, bonus" : "Untuk apa? misal makan siang, bensin"}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-line text-text-main text-sm focus:outline-none focus:border-accent transition-colors"
          />
          <div className="flex justify-between items-center text-[11px] text-text-muted">
            <span>{description.trim().length} / 100 karakter</span>
            {fieldErrors.description && (
              <span className="text-warning" role="alert">{fieldErrors.description}</span>
            )}
          </div>
        </div>

        {/* Input Tanggal */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="transaction_date" className="text-xs font-semibold text-text-secondary">
            Tanggal Transaksi (Maksimal Hari Ini)
          </label>
          <input
            id="transaction_date"
            name="transaction_date"
            type="date"
            max={maxDate}
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            disabled={isLoading}
            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-line text-text-main text-sm focus:outline-none focus:border-accent transition-colors"
          />
          {fieldErrors.transaction_date && (
            <p className="text-xs text-warning" role="alert">{fieldErrors.transaction_date}</p>
          )}
        </div>

        {/* Pesan Error Global / Status Response */}
        <div aria-live="polite" className="min-h-[24px]">
          {generalError && (
            <div className="p-3 rounded-xl bg-bg-main border border-line flex flex-col gap-1">
              <p className="text-xs text-warning font-medium">{generalError}</p>
              {isSessionExpired && (
                <Link href="/login" className="text-xs text-accent underline mt-1">
                  Menuju Halaman Masuk
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Tombol Simpan */}
        <button
          type="submit"
          disabled={isLoading || (isEditMode && hasNoChangesInEdit)}
          className="w-full min-h-[44px] rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-bg-main hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2 mt-2"
        >
          {isLoading
            ? "Menyimpan..."
            : isEditMode
            ? hasNoChangesInEdit
              ? "Tidak ada perubahan"
              : "Simpan Perubahan"
            : "Simpan Transaksi"}
        </button>
      </form>
    </div>
  );
}
