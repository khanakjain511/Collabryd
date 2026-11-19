import { sql } from "drizzle-orm";
import {
  bigint,
  bigserial,
  check,
  index,
  numeric,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./auth.js";
import { collabrydSchema, type ProficiencyLevel } from "./constants.js";

export const skills = collabrydSchema.table("skills", {
  skillId: bigserial("skill_id", { mode: "number" }).primaryKey(),
  name: varchar("name", { length: 80 }).notNull().unique(),
  category: varchar("category", { length: 80 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const interests = collabrydSchema.table("interests", {
  interestId: bigserial("interest_id", { mode: "number" }).primaryKey(),
  name: varchar("name", { length: 80 }).notNull().unique(),
  domain: varchar("domain", { length: 80 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const roles = collabrydSchema.table("roles", {
  roleId: bigserial("role_id", { mode: "number" }).primaryKey(),
  name: varchar("name", { length: 80 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const userSkills = collabrydSchema.table(
  "user_skills",
  {
    userId: bigint("user_id", { mode: "number" })
      .notNull()
      .references(() => users.userId, { onDelete: "cascade" }),
    skillId: bigint("skill_id", { mode: "number" })
      .notNull()
      .references(() => skills.skillId, { onDelete: "restrict" }),
    proficiencyLevel: varchar("proficiency_level", { length: 20 })
      .$type<ProficiencyLevel>()
      .notNull(),
    yearsExperience: numeric("years_experience", { precision: 3, scale: 1 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.skillId] }),
    check(
      "user_skills_proficiency_level_check",
      sql`${table.proficiencyLevel} IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT')`
    ),
    check(
      "user_skills_years_experience_check",
      sql`${table.yearsExperience} >= 0`
    ),
    index("idx_user_skills_skill").on(table.skillId),
  ]
);

export const userInterests = collabrydSchema.table(
  "user_interests",
  {
    userId: bigint("user_id", { mode: "number" })
      .notNull()
      .references(() => users.userId, { onDelete: "cascade" }),
    interestId: bigint("interest_id", { mode: "number" })
      .notNull()
      .references(() => interests.interestId, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.interestId] }),
    index("idx_user_interests_interest").on(table.interestId),
  ]
);

export const userPreferredRoles = collabrydSchema.table(
  "user_preferred_roles",
  {
    userId: bigint("user_id", { mode: "number" })
      .notNull()
      .references(() => users.userId, { onDelete: "cascade" }),
    roleId: bigint("role_id", { mode: "number" })
      .notNull()
      .references(() => roles.roleId, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.roleId] })]
);
