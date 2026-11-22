import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client, Pool } from "pg";
import { resolveDatabaseUrl } from "./database-url.js";
import * as schema from "./schema/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load root .env reliably regardless of current working directory
dotenv.config({
  path: path.resolve(__dirname, "../../../.env"),
});

const DATABASE_URL = resolveDatabaseUrl();

export const pool = new Pool({
  connectionString: DATABASE_URL,
  max: Number(process.env.DATABASE_POOL_MAX ?? 20),
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on("error", () => console.error("Idle PostgreSQL connection lost"));

export const db = drizzle(pool, {
  schema,
});

export type Database = typeof db;

export async function closePool(): Promise<void> {
  await pool.end();
}

export function createNotificationListener() {
  return new Client({ connectionString: DATABASE_URL, connectionTimeoutMillis: 5000 });
}
