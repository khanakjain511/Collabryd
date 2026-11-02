
import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),

  username: varchar("username", { length: 50 })
    .notNull()
    .unique(),

  email: varchar("email", { length: 255 })
    .notNull()
    .unique(),

  fullName: varchar("full_name", { length: 100 })
    .notNull(),

  bio: text("bio"),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});