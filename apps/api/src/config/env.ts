import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../../../../.env"),
});

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).optional(),
  BACKEND_PORT: z.coerce.number().int().min(1).max(65535).optional(),
  TRUST_PROXY_HOPS: z.coerce.number().int().nonnegative().default(1),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .optional(),
  JWT_ACCESS_SECRET: z
    .string()
    .min(32)
    .default("dev_collabryd_access_secret_change_me_in_production_32chars"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32)
    .default("dev_collabryd_refresh_secret_change_me_in_production_32chars"),
  JWT_ACCESS_EXPIRES_IN: z.string().regex(/^[1-9]\d*[smhd]$/).default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().regex(/^[1-9]\d*[smhd]$/).default("7d"),
  ALLOWED_EMAIL_DOMAINS: z.string().default(""),
  EMAIL_PROVIDER: z.enum(["local", "resend"]).optional(),
  EMAIL_FROM: z
    .string()
    .transform((val) => val.trim())
    .pipe(z.string().email().optional().or(z.literal("")))
    .optional(),
  RESEND_API_KEY: z
    .string()
    .transform((val) => val.trim())
    .optional(),
  VERIFICATION_PAGE_URL: z
    .string()
    .transform((val) => val.trim())
    .pipe(z.string().url().optional().or(z.literal("")))
    .optional(),
  REDIS_URL: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  throw new Error(
    `Invalid environment configuration: ${parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ")}`
  );
}

if (
  parsed.data.NODE_ENV === "production" &&
  (parsed.data.JWT_ACCESS_SECRET.includes("dev_collabryd") ||
    parsed.data.JWT_REFRESH_SECRET.includes("dev_collabryd"))
) {
  throw new Error(
    "Production requires explicit, high-entropy JWT_ACCESS_SECRET and JWT_REFRESH_SECRET."
  );
}

// Default to local provider if resend credentials are not supplied, even in production
const rawEmailFrom = parsed.data.EMAIL_FROM || undefined;
const rawResendKey = parsed.data.RESEND_API_KEY || undefined;
const rawVerifUrl = parsed.data.VERIFICATION_PAGE_URL || undefined;

const provider =
  parsed.data.EMAIL_PROVIDER ??
  (rawResendKey && rawEmailFrom ? "resend" : "local");

if (provider === "resend" && (!rawResendKey || !rawEmailFrom || !rawVerifUrl?.startsWith("https://"))) {
  throw new Error("Resend requires RESEND_API_KEY, EMAIL_FROM and an HTTPS VERIFICATION_PAGE_URL.");
}

const effectivePort = parsed.data.PORT ?? parsed.data.BACKEND_PORT ?? 3000;

export const env = {
  ...parsed.data,
  EMAIL_PROVIDER: provider,
  PORT: effectivePort,
  LOG_LEVEL:
    parsed.data.LOG_LEVEL ??
    (parsed.data.NODE_ENV === "test" ? "silent" : "info"),
  ALLOWED_EMAIL_DOMAIN_LIST: parsed.data.ALLOWED_EMAIL_DOMAINS.split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean),
  CORS_ORIGINS: parsed.data.CORS_ORIGIN.split(",")
    .map((o) => o.trim())
    .filter(Boolean),
};

export const PORT = env.PORT;
