"use client";

import { useEffect, useRef } from "react";

interface DeleteTransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  error: string | null;
  transaction: {
    id: string;
    description: string;
    amount: string; // Formatted Rupiah string
    date: string; // Formatted date string
    type: "income" | "expense";
  } | null;
}

export function DeleteTransactionDialog({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  error,
  transaction,
}: DeleteTransactionDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Focus tombol Batal secara default agar tidak sengaja menghapus
      cancelBtnRef.current?.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && !isDeleting) {
          onClose();
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen || !transaction) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-desc"
    >
      <div
        ref={dialogRef}
        className="w-full max-w-md rounded-2xl bg-surface p-6 border border-line shadow-xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex flex-col gap-1">
          <h2 id="dialog-title" className="text-lg font-bold text-text-main">
            Hapus Transaksi?
          </h2>
          <p id="dialog-desc" className="text-sm text-text-secondary">
            Tindakan ini tidak dapat dibatalkan. Data transaksi berikut akan dihapus secara permanen:
          </p>
        </div>

        {/* Info Transaksi yang akan dihapus */}
        <div className="p-3.5 rounded-xl bg-surface-elevated border border-line flex flex-col gap-1.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Tanggal</span>
            <span className="text-text-main font-medium">{transaction.date}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">
              {transaction.type === "income" ? "Sumber" : "Keterangan"}
            </span>
            <span className="text-text-main font-medium truncate max-w-[200px]">
              {transaction.description}
            </span>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-line/60">
            <span className="text-text-secondary">Nominal</span>
            <span
              className={`font-mono font-bold ${
                transaction.type === "income" ? "text-income" : "text-expense"
              }`}
            >
              {transaction.type === "income" ? "+" : "−"} {transaction.amount}
            </span>
          </div>
        </div>

        {/* Error inline */}
        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="p-3 rounded-xl bg-bg-main border border-line text-xs text-warning font-medium"
          >
            {error}
          </div>
        )}

        {/* Aksi tombol */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="min-h-[44px] px-4 py-2.5 rounded-xl border border-line bg-surface-elevated text-xs font-semibold text-text-main hover:bg-line disabled:opacity-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-expense text-bg-main text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
          >
            {isDeleting ? "Menghapus..." : "Ya, Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}
