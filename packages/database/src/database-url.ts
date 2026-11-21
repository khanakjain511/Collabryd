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
