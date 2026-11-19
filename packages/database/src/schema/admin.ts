import { desc, sql } from "drizzle-orm";
import {
  bigint,
  bigserial,
  check,
  index,
  jsonb,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./auth.js";
import { collabrydSchema, type AdminAuditAction } from "./constants.js";

export const adminAuditLogs = collabrydSchema.table(
  "admin_audit_logs",
  {
    logId: bigserial("log_id", { mode: "number" }).primaryKey(),
    adminId: bigint("admin_id", { mode: "number" })
      .notNull()
      .references(() => users.userId, { onDelete: "restrict" }),
    action: varchar("action", { length: 50 })
      .$type<AdminAuditAction>()
      .notNull(),
    targetType: varchar("target_type", { length: 50 }).notNull(),
    targetId: bigint("target_id", { mode: "number" }).notNull(),
    details: jsonb("details").$type<Record<string, unknown> | null>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check(
      "admin_audit_logs_action_check",
      sql`${table.action} IN ('ACCOUNT_SUSPENDED', 'ACCOUNT_ACTIVATED', 'PROJECT_MODERATED', 'ROLE_OVERRIDE')`
    ),
    index("idx_admin_audit_logs_created").on(desc(table.createdAt)),
  ]
);
