import { desc, sql } from "drizzle-orm";
import {
  bigint,
  bigserial,
  boolean,
  check,
  date,
  index,
  integer,
  primaryKey,
  text,
  timestamp,
  unique,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./auth.js";
import { roles, skills } from "./catalog.js";
import {
  collabrydSchema,
  type ApplicationStatus,
  type ProjectMemberRole,
  type ProjectStatus,
  type ProjectType,
  type ProjectVisibility,
} from "./constants.js";

export const projects = collabrydSchema.table(
  "projects",
  {
    projectId: bigserial("project_id", { mode: "number" }).primaryKey(),
    ownerId: bigint("owner_id", { mode: "number" })
      .notNull()
      .references(() => users.userId, { onDelete: "restrict" }),
    title: varchar("title", { length: 200 }).notNull(),
    summary: varchar("summary", { length: 500 }).notNull(),
    description: text("description").notNull(),
    category: varchar("category", { length: 80 }).notNull(),
    projectType: varchar("project_type", { length: 40 })
      .$type<ProjectType>()
      .notNull(),
    status: varchar("status", { length: 30 })
      .$type<ProjectStatus>()
      .notNull()
      .default("DRAFT"),
    visibility: varchar("visibility", { length: 30 })
      .$type<ProjectVisibility>()
      .notNull()
      .default("PUBLIC"),
    minTeamSize: integer("min_team_size").notNull().default(1),
    maxTeamSize: integer("max_team_size").notNull().default(4),
    applicationDeadline: timestamp("application_deadline", {
      withTimezone: true,
    }),
    startDate: date("start_date"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check(
      "projects_project_type_check",
      sql`${table.projectType} IN ('HACKATHON', 'CAPSTONE', 'COMPETITION', 'RESEARCH', 'OPEN_SOURCE', 'PERSONAL')`
    ),
    check(
      "projects_status_check",
      sql`${table.status} IN ('DRAFT', 'OPEN', 'PAUSED', 'IN_PROGRESS', 'COMPLETED', 'CLOSED', 'ARCHIVED')`
    ),
    check(
      "projects_visibility_check",
      sql`${table.visibility} IN ('PUBLIC', 'CAMPUS_ONLY', 'PRIVATE')`
    ),
    check("projects_min_team_size_check", sql`${table.minTeamSize} >= 1`),
    check("projects_max_team_size_check", sql`${table.maxTeamSize} >= 1`),
    check(
      "projects_team_size_range_check",
      sql`${table.maxTeamSize} >= ${table.minTeamSize}`
    ),
    index("idx_projects_status_created").on(table.status, desc(table.createdAt)),
    index("idx_projects_category_type").on(table.category, table.projectType),
    index("idx_projects_owner").on(table.ownerId),
  ]
);

export const projectSkills = collabrydSchema.table(
  "project_skills",
  {
    projectId: bigint("project_id", { mode: "number" })
      .notNull()
      .references(() => projects.projectId, { onDelete: "cascade" }),
    skillId: bigint("skill_id", { mode: "number" })
      .notNull()
      .references(() => skills.skillId, { onDelete: "restrict" }),
    isRequired: boolean("is_required").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.projectId, table.skillId] }),
    index("idx_project_skills_skill").on(table.skillId),
  ]
);

export const projectRoles = collabrydSchema.table(
  "project_roles",
  {
    projectRoleId: bigserial("project_role_id", { mode: "number" }).primaryKey(),
    projectId: bigint("project_id", { mode: "number" })
      .notNull()
      .references(() => projects.projectId, { onDelete: "cascade" }),
    roleId: bigint("role_id", { mode: "number" })
      .notNull()
      .references(() => roles.roleId, { onDelete: "restrict" }),
    openPositions: integer("open_positions").notNull().default(1),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check(
      "project_roles_open_positions_check",
      sql`${table.openPositions} >= 1`
    ),
    unique("project_roles_project_id_role_id_key").on(
      table.projectId,
      table.roleId
    ),
  ]
);

export const applications = collabrydSchema.table(
  "applications",
  {
    applicationId: bigserial("application_id", { mode: "number" }).primaryKey(),
    projectId: bigint("project_id", { mode: "number" })
      .notNull()
      .references(() => projects.projectId, { onDelete: "cascade" }),
    applicantId: bigint("applicant_id", { mode: "number" })
      .notNull()
      .references(() => users.userId, { onDelete: "cascade" }),
    roleId: bigint("role_id", { mode: "number" }).references(
      () => roles.roleId,
      { onDelete: "set null" }
    ),
    status: varchar("status", { length: 30 })
      .$type<ApplicationStatus>()
      .notNull()
      .default("PENDING"),
    message: text("message"),
    appliedAt: timestamp("applied_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  },
  (table) => [
    check(
      "applications_status_check",
      sql`${table.status} IN ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN', 'CANCELLED')`
    ),
    uniqueIndex("uq_active_application")
      .on(table.projectId, table.applicantId)
      .where(sql`${table.status} = 'PENDING'`),
    index("idx_applications_project_status").on(table.projectId, table.status),
    index("idx_applications_applicant").on(table.applicantId),
  ]
);

export const projectMembers = collabrydSchema.table(
  "project_members",
  {
    projectId: bigint("project_id", { mode: "number" })
      .notNull()
      .references(() => projects.projectId, { onDelete: "cascade" }),
    userId: bigint("user_id", { mode: "number" })
      .notNull()
      .references(() => users.userId, { onDelete: "restrict" }),
    role: varchar("role", { length: 30 })
      .$type<ProjectMemberRole>()
      .notNull()
      .default("MEMBER"),
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.projectId, table.userId] }),
    check(
      "project_members_role_check",
      sql`${table.role} IN ('OWNER', 'ADMIN', 'MEMBER')`
    ),
    index("idx_project_members_user").on(table.userId),
  ]
);
