import { sql } from "drizzle-orm";
import {
  bigserial,
  index,
  integer,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { collabrydSchema } from "./constants.js";
import { users } from "./auth.js";

export const events = collabrydSchema.table(
  "events",
  {
    eventId: bigserial("event_id", { mode: "number" }).primaryKey(),
    slug: varchar("slug", { length: 120 }).notNull(),
    name: varchar("name", { length: 160 }).notNull(),
    category: varchar("category", { length: 80 }).notNull().default("Hackathon"),
    description: text("description").notNull(),
    eventDate: varchar("event_date", { length: 50 }).notNull(),
    deadline: varchar("deadline", { length: 50 }).notNull(),
    mode: varchar("mode", { length: 50 }).notNull().default("Hybrid"),
    color: varchar("color", { length: 50 }).notNull().default("sand"),
    symbol: varchar("symbol", { length: 50 }).notNull().default("✳"),
    publication: varchar("publication", { length: 30 }).notNull().default("Published"),
    organizer: varchar("organizer", { length: 160 }).default("Campus Event Organizers"),
    eligibility: text("eligibility").default("Open to all registered campus students."),
    rules: text("rules"),
    officialUrl: varchar("official_url", { length: 500 }),
    sourceUrl: varchar("source_url", { length: 500 }),
    createdBy: integer("created_by").references(() => users.userId, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("events_slug_idx").on(table.slug),
    index("events_publication_idx").on(table.publication),
    index("events_date_idx").on(table.eventDate),
  ]
);

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
