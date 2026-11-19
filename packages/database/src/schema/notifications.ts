import { desc, sql } from "drizzle-orm";
import {
  bigint,
  bigserial,
  boolean,
  check,
  index,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./auth.js";
import { collabrydSchema, type NotificationType } from "./constants.js";

export const notifications = collabrydSchema.table(
  "notifications",
  {
    notificationId: bigserial("notification_id", {
      mode: "number",
    }).primaryKey(),
    recipientId: bigint("recipient_id", { mode: "number" })
      .notNull()
      .references(() => users.userId, { onDelete: "cascade" }),
    type: varchar("type", { length: 50 })
      .$type<NotificationType>()
      .notNull(),
    resourceType: varchar("resource_type", { length: 50 }).notNull(),
    resourceId: bigint("resource_id", { mode: "number" }).notNull(),
    message: text("message").notNull(),
    isRead: boolean("is_read").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check(
      "notifications_type_check",
      sql`${table.type} IN ('APPLICATION_RECEIVED', 'APPLICATION_ACCEPTED', 'APPLICATION_REJECTED', 'TEAM_MEMBER_ADDED', 'TEAM_MEMBER_REMOVED', 'NEW_MESSAGE', 'PROJECT_STATUS_CHANGED')`
    ),
    index("idx_notifications_recipient_unread").on(
      table.recipientId,
      table.isRead,
      desc(table.createdAt)
    ),
  ]
);

export const notificationPreferences = collabrydSchema.table(
  "notification_preferences",
  {
    userId: bigint("user_id", { mode: "number" })
      .primaryKey()
      .references(() => users.userId, { onDelete: "cascade" }),
    emailOnApplication: boolean("email_on_application").notNull().default(true),
    emailOnTeamChange: boolean("email_on_team_change").notNull().default(true),
    emailOnMessage: boolean("email_on_message").notNull().default(false),
    inappNotifications: boolean("inapp_notifications").notNull().default(true),
  }
);
