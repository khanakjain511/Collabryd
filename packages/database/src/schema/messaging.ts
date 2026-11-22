import { sql } from "drizzle-orm";
import {
  bigint,
  bigserial,
  check,
  index,
  primaryKey,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./auth.js";
import { projects } from "./projects.js";
import { collabrydSchema, type ConversationType } from "./constants.js";

export const conversations = collabrydSchema.table(
  "conversations",
  {
    conversationId: bigserial("conversation_id", {
      mode: "number",
    }).primaryKey(),
    type: varchar("type", { length: 20 })
      .$type<ConversationType>()
      .notNull(),
    projectId: bigint("project_id", { mode: "number" })
      .unique()
      .references(() => projects.projectId, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check(
      "conversations_type_check",
      sql`${table.type} IN ('DIRECT', 'GROUP')`
    ),
    check(
      "conversations_direct_project_null_check",
      sql`${table.type} <> 'DIRECT' OR ${table.projectId} IS NULL`
    ),
  ]
);

export const conversationMembers = collabrydSchema.table(
  "conversation_members",
  {
    conversationId: bigint("conversation_id", { mode: "number" })
      .notNull()
      .references(() => conversations.conversationId, { onDelete: "cascade" }),
    userId: bigint("user_id", { mode: "number" })
      .notNull()
      .references(() => users.userId, { onDelete: "cascade" }),
    lastReadSequence: bigint("last_read_sequence", { mode: "number" })
      .notNull()
      .default(0),
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.conversationId, table.userId] }),
    index("idx_conversation_members_user").on(table.userId),
  ]
);

export const messages = collabrydSchema.table(
  "messages",
  {
    messageId: bigserial("message_id", { mode: "number" }).primaryKey(),
    conversationId: bigint("conversation_id", { mode: "number" })
      .notNull()
      .references(() => conversations.conversationId, { onDelete: "cascade" }),
    senderId: bigint("sender_id", { mode: "number" })
      .notNull()
      .references(() => users.userId, { onDelete: "restrict" }),
    clientMessageId: varchar("client_message_id", { length: 100 }).notNull(),
    sequenceNumber: bigint("sequence_number", { mode: "number" }).notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("messages_conversation_id_sequence_number_key").on(
      table.conversationId,
      table.sequenceNumber
    ),
    unique("messages_conversation_id_client_message_id_key").on(
      table.conversationId,
      table.clientMessageId
    ),
    index("idx_messages_conv_seq").on(
      table.conversationId,
      table.sequenceNumber
    ),
  ]
);
