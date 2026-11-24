import { sql } from "drizzle-orm";
import {
  bigint,
  bigserial,
  boolean,
  check,
  index,
  integer,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import {
  collabrydSchema,
  type AccountStatus,
  type SystemRole,
} from "./constants.js";

export const users = collabrydSchema.table(
  "users",
  {
    userId: bigserial("user_id", { mode: "number" }).primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    accountStatus: varchar("account_status", { length: 30 })
      .$type<AccountStatus>()
      .notNull()
      .default("PENDING_VERIFICATION"),
    systemRole: varchar("system_role", { length: 20 })
      .$type<SystemRole>()
      .notNull()
      .default("STUDENT"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check(
      "users_account_status_check",
      sql`${table.accountStatus} IN ('PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'DEACTIVATED')`
    ),
    check(
      "users_system_role_check",
      sql`${table.systemRole} IN ('STUDENT', 'ADMIN')`
    ),
    index("idx_users_account_status").on(table.accountStatus),
    uniqueIndex("uq_users_email_lower").on(sql`LOWER(${table.email})`),
  ]
);

export const emailVerificationTokens = collabrydSchema.table(
  "email_verification_tokens",
  {
    tokenId: bigserial("token_id", { mode: "number" }).primaryKey(),
    userId: bigint("user_id", { mode: "number" })
      .notNull()
      .references(() => users.userId, { onDelete: "cascade" }),
    tokenHash: varchar("token_hash", { length: 255 }).notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    isUsed: boolean("is_used").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("idx_email_verification_tokens_user").on(table.userId)]
);

export const refreshSessions = collabrydSchema.table(
  "refresh_sessions",
  {
    sessionId: bigserial("session_id", { mode: "number" }).primaryKey(),
    userId: bigint("user_id", { mode: "number" })
      .notNull()
      .references(() => users.userId, { onDelete: "cascade" }),
    tokenHash: varchar("token_hash", { length: 255 }).notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("idx_refresh_sessions_user").on(table.userId)]
);

export const authOtps = collabrydSchema.table(
  "auth_otps",
  {
    otpId: bigserial("otp_id", { mode: "number" }).primaryKey(),
    userId: bigint("user_id", { mode: "number" })
      .notNull()
      .references(() => users.userId, { onDelete: "cascade" }),
    email: varchar("email", { length: 255 }).notNull(),
    otpHash: varchar("otp_hash", { length: 255 }).notNull(),
    purpose: varchar("purpose", { length: 30 })
      .$type<"SIGNUP" | "LOGIN">()
      .notNull()
      .default("SIGNUP"),
    attempts: integer("attempts").notNull().default(0),
    maxAttempts: integer("max_attempts").notNull().default(5),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    isUsed: boolean("is_used").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check("auth_otps_purpose_check", sql`${table.purpose} IN ('SIGNUP', 'LOGIN')`),
    index("idx_auth_otps_user_purpose").on(table.userId, table.purpose),
    index("idx_auth_otps_email_purpose").on(table.email, table.purpose),
  ]
);
