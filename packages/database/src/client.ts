import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load root .env reliably regardless of current working directory
dotenv.config({
  path: path.resolve(__dirname, "../../../.env"),
});

export function resolveDatabaseUrl(): string {
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0) {
    return process.env.DATABASE_URL;
  }

  const {
    POSTGRES_USER,
    POSTGRES_PASSWORD,
    POSTGRES_DB,
    DATABASE_PORT,
    DATABASE_HOST = "localhost",
  } = process.env;

  if (!POSTGRES_USER || !POSTGRES_PASSWORD || !POSTGRES_DB || !DATABASE_PORT) {
    throw new Error(
      "Database configuration missing: set DATABASE_URL or POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, and DATABASE_PORT in .env"
    );
  }

  return `postgresql://${encodeURIComponent(POSTGRES_USER)}:${encodeURIComponent(POSTGRES_PASSWORD)}@${DATABASE_HOST}:${DATABASE_PORT}/${encodeURIComponent(POSTGRES_DB)}`;
}

const DATABASE_URL = resolveDatabaseUrl();

export const pool = new Pool({
  connectionString: DATABASE_URL,
  max: Number(process.env.DATABASE_POOL_MAX ?? 20),
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

export const db = drizzle(pool, {
  schema,
});

export type Database = typeof db;

export async function closePool(): Promise<void> {
  await pool.end();
}
