import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config({ path: "../../.env" });

const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB,DATABASE_PORT } = process.env;

if (!POSTGRES_USER || !POSTGRES_PASSWORD || !POSTGRES_DB||!DATABASE_PORT) {
  throw new Error(
    "POSTGRES_USER, POSTGRES_PASSWORD, and POSTGRES_DB must be defined in .env"
  );
}

const DATABASE_URL = `postgresql://${encodeURIComponent(POSTGRES_USER)}:${encodeURIComponent(POSTGRES_PASSWORD)}@localhost:${DATABASE_PORT}/${encodeURIComponent(POSTGRES_DB)}`;

export default defineConfig({
  schema: "./src/schema/**/*.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL,
  },
  strict: true,
  verbose: true,
});
