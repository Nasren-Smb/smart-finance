export class InsufficientBalanceError extends Error {
  constructor(message = "Saldo tidak cukup") {
    super(message);
    this.name = "InsufficientBalanceError";
  }
}

export type TransactionType = "income" | "expense";

export interface TransactionEffectInput {
  type: TransactionType;
  amount: number;
}

/**
 * Menghitung efek bersih suatu transaksi terhadap saldo.
 * income = +amount, expense = -amount
 */
export function getTransactionEffect(input: TransactionEffectInput): number {
  if (input.type === "income") {
    return input.amount;
  }
  return -input.amount;
}

/**
 * Menghitung total saldo dari daftar seluruh riwayat transaksi.
 * Saldo = total pemasukan dikurangi total pengeluaran.
 */
export function calculateBalance(transactions: TransactionEffectInput[]): number {
  return transactions.reduce((acc, curr) => acc + getTransactionEffect(curr), 0);
}

/**
 * Memvalidasi penambahan transaksi baru.
 * Saldo baru = saldo saat ini + efek transaksi baru.
 * Jika saldo baru < 0, lempar InsufficientBalanceError("Saldo tidak cukup").
 */
export function validateAddTransaction(
  currentBalance: number,
  newTx: TransactionEffectInput
): number {
  const newBalance = currentBalance + getTransactionEffect(newTx);
  if (newBalance < 0) {
    throw new InsufficientBalanceError();
  }
  return newBalance;
}

/**
 * Memvalidasi pembaruan/edit transaksi (ubah nominal, ubah jenis, dsb).
 * Saldo baru = saldo saat ini - efek transaksi lama + efek transaksi baru.
 * Jika saldo baru < 0, lempar InsufficientBalanceError("Saldo tidak cukup").
 */
export function validateUpdateTransaction(
  currentBalance: number,
  oldTx: TransactionEffectInput,
  updatedTx: TransactionEffectInput
): number {
  const newBalance =
    currentBalance - getTransactionEffect(oldTx) + getTransactionEffect(updatedTx);
  if (newBalance < 0) {
    throw new InsufficientBalanceError();
  }
  return newBalance;
}

/**
 * Memvalidasi penghapusan transaksi.
 * Saldo baru = saldo saat ini - efek transaksi yang dihapus.
 * Jika saldo baru < 0, lempar InsufficientBalanceError("Saldo tidak cukup").
 */
export function validateDeleteTransaction(
  currentBalance: number,
  deletedTx: TransactionEffectInput
): number {
  const newBalance = currentBalance - getTransactionEffect(deletedTx);
  if (newBalance < 0) {
    throw new InsufficientBalanceError();
  }
  return newBalance;
}
