import { eq, and, sql } from "drizzle-orm";
import { getDb, type Database } from "@/lib/db";
import { transactions, type Transaction } from "@/lib/db/schema";
import {
  getBalance,
  runWithUserLock,
} from "@/lib/finance/balance-db";
import {
  validateAddTransaction,
  validateUpdateTransaction,
  validateDeleteTransaction,
} from "@/lib/finance/balance";
import type {
  TransactionInput,
  UpdateTransactionInput,
} from "@/lib/finance/schemas";
import { PAGE_SIZE } from "@/lib/finance/constants";
import {
  decodeCursor,
  encodeCursor,
  type KeysetCursor,
} from "@/lib/api/cursor";
import {
  escapeLikeWildcards,
  type TransactionQueryParams,
} from "@/lib/api/query";

export interface TransactionListResult {
  items: Transaction[];
  nextCursor: string | null;
}

/**
 * Membuat transaksi baru dalam transaksi database dengan advisory lock.
 * Saldo diperiksa di server; jika membuat saldo < 0, InsufficientBalanceError dilempar.
 */
export async function createTransactionRecord(
  userId: string,
  input: TransactionInput
): Promise<Transaction> {
  return await runWithUserLock(userId, async (tx: Database) => {
    // 1. Ambil saldo saat ini
    const currentBalance = await getBalance(userId, tx);

    // 2. Validasi penambahan transaksi
    validateAddTransaction(currentBalance, {
      type: input.type,
      amount: input.amount,
    });

    // 3. Simpan transaksi baru
    const [inserted] = await tx
      .insert(transactions)
      .values({
        user_id: userId,
        type: input.type,
        amount: input.amount,
        description: input.description,
        transaction_date: input.transaction_date,
      })
      .returning();

    return inserted;
  });
}

/**
 * Mengambil daftar transaksi milik pengguna dengan filter dan keyset pagination.
 */
export async function listTransactionsRecord(
  userId: string,
  query: TransactionQueryParams
): Promise<TransactionListResult> {
  const db = getDb();
  const conditions = [eq(transactions.user_id, userId)];

  if (query.type) {
    conditions.push(eq(transactions.type, query.type));
  }

  if (query.from) {
    conditions.push(sql`${transactions.transaction_date} >= ${query.from}`);
  }

  if (query.to) {
    conditions.push(sql`${transactions.transaction_date} <= ${query.to}`);
  }

  if (query.q && query.q.length > 0) {
    const escaped = escapeLikeWildcards(query.q);
    conditions.push(sql`${transactions.description} ilike ${`%${escaped}%`}`);
  }

  if (query.cursor) {
    const cursorObj = decodeCursor(query.cursor);
    if (!cursorObj) {
      throw new Error("INVALID_CURSOR");
    }

    // Keyset condition: (transaction_date, created_at, id) < (c.date, c.created_at, c.id)
    conditions.push(
      sql`(${transactions.transaction_date}, ${transactions.created_at}, ${transactions.id}) < (${cursorObj.transaction_date}, ${cursorObj.created_at}::timestamptz, ${cursorObj.id}::uuid)`
    );
  }

  // Ambil PAGE_SIZE + 1 untuk menentukan apakah ada halaman berikutnya
  const rows = await db
    .select()
    .from(transactions)
    .where(and(...conditions))
    .orderBy(
      sql`${transactions.transaction_date} desc`,
      sql`${transactions.created_at} desc`,
      sql`${transactions.id} desc`
    )
    .limit(PAGE_SIZE + 1);

  let nextCursor: string | null = null;
  const items = rows.slice(0, PAGE_SIZE);

  if (rows.length > PAGE_SIZE) {
    const lastItem = items[items.length - 1];
    const cursorData: KeysetCursor = {
      transaction_date: lastItem.transaction_date,
      created_at: lastItem.created_at.toISOString(),
      id: lastItem.id,
    };
    nextCursor = encodeCursor(cursorData);
  }

  return { items, nextCursor };
}

/**
 * Mengambil transaksi tunggal berdasarkan ID dan memastikan milik user_id.
 */
export async function getTransactionRecord(
  userId: string,
  id: string,
  txClient?: Database
): Promise<Transaction | null> {
  const db = txClient ?? getDb();
  const [row] = await db
    .select()
    .from(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.user_id, userId)));

  return row ?? null;
}

/**
 * Memperbarui transaksi yang ada di dalam transaksi database dengan advisory lock.
 * Mengembalikan null jika transaksi tidak ditemukan atau bukan milik pengguna.
 */
export async function updateTransactionRecord(
  userId: string,
  id: string,
  input: UpdateTransactionInput
): Promise<Transaction | null> {
  return await runWithUserLock(userId, async (tx: Database) => {
    // 1. Ambil transaksi lama
    const existing = await getTransactionRecord(userId, id, tx);
    if (!existing) {
      return null;
    }

    const newType = input.type ?? existing.type;
    const newAmount = input.amount ?? existing.amount;

    // Jika terjadi perubahan type atau amount, jalankan validasi saldo
    if (newType !== existing.type || newAmount !== existing.amount) {
      const currentBalance = await getBalance(userId, tx);
      validateUpdateTransaction(
        currentBalance,
        { type: existing.type, amount: existing.amount },
        { type: newType, amount: newAmount }
      );
    }

    // 2. Jalankan update
    const [updated] = await tx
      .update(transactions)
      .set({
        ...(input.type !== undefined ? { type: input.type } : {}),
        ...(input.amount !== undefined ? { amount: input.amount } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.transaction_date !== undefined ? { transaction_date: input.transaction_date } : {}),
        updated_at: sql`now()`,
      })
      .where(and(eq(transactions.id, id), eq(transactions.user_id, userId)))
      .returning();

    return updated;
  });
}

/**
 * Menghapus transaksi di dalam transaksi database dengan advisory lock.
 * Mengembalikan null jika tidak ditemukan atau bukan milik pengguna.
 */
export async function deleteTransactionRecord(
  userId: string,
  id: string
): Promise<{ id: string } | null> {
  return await runWithUserLock(userId, async (tx: Database) => {
    const existing = await getTransactionRecord(userId, id, tx);
    if (!existing) {
      return null;
    }

    const currentBalance = await getBalance(userId, tx);
    validateDeleteTransaction(currentBalance, {
      type: existing.type,
      amount: existing.amount,
    });

    const [deleted] = await tx
      .delete(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.user_id, userId)))
      .returning({ id: transactions.id });

    return deleted ?? null;
  });
}
