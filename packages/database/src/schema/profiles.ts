import { sql } from "drizzle-orm";
import {
  bigint,
  bigserial,
  check,
  date,
  index,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./auth.js";
import {
  collabrydSchema,
  type AvailabilityStatus,
  type ProfileVisibility,
  type SocialPlatform,
} from "./constants.js";

export const userProfiles = collabrydSchema.table(
  "user_profiles",
  {
    userId: bigint("user_id", { mode: "number" })
      .primaryKey()
      .references(() => users.userId, { onDelete: "cascade" }),
    displayName: varchar("display_name", { length: 100 }).notNull(),
    bio: text("bio"),
    avatarUrl: varchar("avatar_url", { length: 500 }),
    institution: varchar("institution", { length: 150 }).notNull(),
    courseProgram: varchar("course_program", { length: 150 }).notNull(),
    academicYear: varchar("academic_year", { length: 20 }).notNull(),
    department: varchar("department", { length: 100 }),
    preferredProjectType: varchar("preferred_project_type", { length: 50 }),
    availabilityStatus: varchar("availability_status", { length: 30 })
      .$type<AvailabilityStatus>()
      .notNull()
      .default("AVAILABLE"),
    profileVisibility: varchar("profile_visibility", { length: 30 })
      .$type<ProfileVisibility>()
      .notNull()
      .default("PUBLIC"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check(
      "user_profiles_availability_status_check",
      sql`${table.availabilityStatus} IN ('AVAILABLE', 'BUSY', 'NOT_LOOKING')`
    ),
    check(
      "user_profiles_profile_visibility_check",
      sql`${table.profileVisibility} IN ('PUBLIC', 'CAMPUS_ONLY', 'PRIVATE')`
    ),
    index("idx_user_profiles_institution").on(table.institution),
  ]
);

export const achievements = collabrydSchema.table(
  "achievements",
  {
    achievementId: bigserial("achievement_id", { mode: "number" }).primaryKey(),
    userId: bigint("user_id", { mode: "number" })
      .notNull()
      .references(() => users.userId, { onDelete: "cascade" }),
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description"),
    issuer: varchar("issuer", { length: 150 }),
    dateAchieved: date("date_achieved"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("idx_achievements_user").on(table.userId)]
);

export const socialLinks = collabrydSchema.table(
  "social_links",
  {
    linkId: bigserial("link_id", { mode: "number" }).primaryKey(),
    userId: bigint("user_id", { mode: "number" })
      .notNull()
      .references(() => users.userId, { onDelete: "cascade" }),
    platform: varchar("platform", { length: 50 })
      .$type<SocialPlatform>()
      .notNull(),
    url: varchar("url", { length: 500 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check(
      "social_links_platform_check",
      sql`${table.platform} IN ('GITHUB', 'LINKEDIN', 'PORTFOLIO', 'TWITTER', 'OTHER')`
    ),
    index("idx_social_links_user").on(table.userId),
  ]
);
