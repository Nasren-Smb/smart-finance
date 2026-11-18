import { type UpdateTransactionInput } from "./schemas";
import { type ApiClientErrorResult } from "@/lib/format-input";

export interface InitialTransactionData {
  id: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  transaction_date: string;
}

export interface TransactionFormState {
  type: "income" | "expense";
  amount: number;
  description: string;
  transaction_date: string;
}

/**
 * Menghitung perbedaan nilai antara initial data dan current form state.
 * Hanya mengembalikan field yang nilainya benar-benar berubah (setelah description di-trim).
 * Jika tidak ada perubahan sama sekali, mengembalikan null.
 */
export function getChangedTransactionFields(
  initial: InitialTransactionData,
  current: TransactionFormState
): UpdateTransactionInput | null {
  const diff: UpdateTransactionInput = {};
  let hasChanges = false;

  if (current.type !== initial.type) {
    diff.type = current.type;
    hasChanges = true;
  }

  if (current.amount !== initial.amount) {
    diff.amount = current.amount;
    hasChanges = true;
  }

  const trimmedDesc = current.description.trim();
  const initialTrimmedDesc = initial.description.trim();
  if (trimmedDesc !== initialTrimmedDesc) {
    diff.description = trimmedDesc;
    hasChanges = true;
  }

  if (current.transaction_date !== initial.transaction_date) {
    diff.transaction_date = current.transaction_date;
    hasChanges = true;
  }

  return hasChanges ? diff : null;
}

/**
 * Memetakan respons error dari panggilan DELETE /api/transactions/[id]
 */
export function mapDeleteTransactionError(
  status: number,
  errorData?: { code?: string; message?: string },
  isRedirected?: boolean
): ApiClientErrorResult {
  if (isRedirected || status === 401) {
    return {
      message: "Sesi berakhir. Silakan masuk lagi.",
      isSessionExpired: true,
    };
  }

  if (status === 422 && errorData?.code === "INSUFFICIENT_BALANCE") {
    return {
      message: "Transaksi ini tidak bisa dihapus karena saldo akan menjadi minus.",
    };
  }

  if (status === 404) {
    return {
      message: "Transaksi tidak ditemukan atau sudah dihapus.",
    };
  }

  return {
    message: "Terjadi kesalahan. Coba lagi.",
  };
}

/**
 * Memetakan respons error dari panggilan PATCH /api/transactions/[id]
 */
export function mapEditTransactionError(
  status: number,
  errorData?: { code?: string; message?: string; fields?: Record<string, string> },
  isRedirected?: boolean
): ApiClientErrorResult {
  if (isRedirected || status === 401) {
    return {
      message: "Sesi berakhir. Silakan masuk lagi.",
      isSessionExpired: true,
    };
  }

  if (status === 404) {
    return {
      message: "Transaksi tidak ditemukan.",
    };
  }

  if (status === 422 && errorData?.code === "INSUFFICIENT_BALANCE") {
    return {
      message: "Saldo tidak cukup. Perubahan ini akan membuat saldo menjadi minus.",
    };
  }

  if (status === 400 && errorData?.fields) {
    return {
      message: errorData.message || "Data yang dikirim tidak valid",
      fields: errorData.fields,
    };
  }

  return {
    message: "Terjadi kesalahan. Coba lagi.",
  };
}
