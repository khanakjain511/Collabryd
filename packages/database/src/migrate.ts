import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { closePool, pool } from "./client.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MIGRATIONS_DIR = path.resolve(__dirname, "../drizzle");

export async function runMigrations(): Promise<string[]> {
  const client = await pool.connect();
  const appliedNow: string[] = [];

  try {
    await client.query(`CREATE SCHEMA IF NOT EXISTS collabryd;`);
    await client.query(`
      CREATE TABLE IF NOT EXISTS collabryd._schema_migrations (
        filename VARCHAR(255) PRIMARY KEY,
        checksum VARCHAR(64) NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const entries = await fs.readdir(MIGRATIONS_DIR);
    const sqlFiles = entries.filter((f) => f.endsWith(".sql")).sort();

    for (const filename of sqlFiles) {
      const fullPath = path.join(MIGRATIONS_DIR, filename);
      const sqlContent = await fs.readFile(fullPath, "utf8");
      const checksum = crypto
        .createHash("sha256")
        .update(sqlContent)
        .digest("hex");

      const existing = await client.query<{ checksum: string }>(
        `SELECT checksum FROM collabryd._schema_migrations WHERE filename = $1`,
        [filename]
      );

      if (existing.rowCount && existing.rowCount > 0) {
        if (existing.rows[0]?.checksum !== checksum) {
          throw new Error(
            `Migration checksum mismatch for ${filename}. Do not edit already-applied migrations.`
          );
        }
        continue;
      }

      await client.query("BEGIN");
      try {
        await client.query(sqlContent);
        await client.query(
          `INSERT INTO collabryd._schema_migrations (filename, checksum) VALUES ($1, $2)`,
          [filename, checksum]
        );
        await client.query("COMMIT");
        appliedNow.push(filename);
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      }
    }

    return appliedNow;
  } finally {
    client.release();
  }
}

const isDirectExecution =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(__filename);

if (isDirectExecution) {
  runMigrations()
    .then((applied) => {
      if (applied.length === 0) {
        console.log("Database schema is already up to date.");
      } else {
        console.log("Applied migrations:", applied.join(", "));
      }
    })
    .catch((err) => {
      console.error("Migration failed:", err);
      process.exitCode = 1;
    })
    .finally(() => closePool());
}
