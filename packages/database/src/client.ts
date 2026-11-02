import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema/index.js";

dotenv.config({
    path:"./../../.env"
});

const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB,DATABASE_PORT } = process.env;

if (!POSTGRES_USER || !POSTGRES_PASSWORD || !POSTGRES_DB || !DATABASE_PORT) {
  throw new Error(
    "POSTGRES_USER, POSTGRES_PASSWORD, and POSTGRES_DB must be defined in .env"
  );
}

const DATABASE_URL = `postgresql://${encodeURIComponent(POSTGRES_USER)}:${encodeURIComponent(POSTGRES_PASSWORD)}@localhost:${DATABASE_PORT}/${encodeURIComponent(POSTGRES_DB)}`;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

export const pool = new Pool({
  connectionString:DATABASE_URL,
  max: 10,
});

export const db = drizzle(pool, {
  schema,
});