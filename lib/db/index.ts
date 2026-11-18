import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let _db: PostgresJsDatabase<typeof schema> | null = null;

export function getDb(): PostgresJsDatabase<typeof schema> {
  if (typeof window !== "undefined") {
    throw new Error("lib/db hanya boleh diimpor dari kode server, bukan komponen client.");
  }

  if (!_db) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL belum dikonfigurasi di environment variable.");
    }

    // Supabase transaction pooler tidak mendukung prepared statement
    const client = postgres(connectionString, { prepare: false });
    _db = drizzle(client, { schema });
  }

  return _db;
}

export type Database = PostgresJsDatabase<typeof schema>;
