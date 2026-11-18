import {
  pgTable,
  uuid,
  pgEnum,
  bigint,
  text,
  date,
  timestamp,
  index,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const transactionTypeEnum = pgEnum("transaction_type", [
  "income",
  "expense",
]);

export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id").notNull(),
    type: transactionTypeEnum("type").notNull(),
    amount: bigint("amount", { mode: "number" }).notNull(),
    description: text("description").notNull(),
    transaction_date: date("transaction_date").notNull(),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("transactions_user_date_idx").on(table.user_id, table.transaction_date),
    index("transactions_user_type_idx").on(table.user_id, table.type),
    check("transactions_amount_positive_check", sql`${table.amount} > 0`),
    check(
      "transactions_description_not_empty_check",
      sql`trim(${table.description}) <> ''`
    ),
  ]
);

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
