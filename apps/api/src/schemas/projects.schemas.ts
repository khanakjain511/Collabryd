import { z } from "zod";
import {
  PROJECT_STATUSES,
  PROJECT_TYPES,
  PROJECT_VISIBILITIES,
} from "@collabryd/database";
import {
  paginationQuerySchema,
  positiveIntIdParam,
} from "../utils/pagination.js";

const projectSkillItemSchema = z.object({
  skillId: z.coerce.number().int().positive(),
  isRequired: z.boolean().default(true),
});

const projectRoleItemSchema = z.object({
  roleId: z.coerce.number().int().positive(),
  openPositions: z.coerce.number().int().min(1).max(50).default(1),
  description: z.string().trim().max(1000).nullable().optional(),
});

export const createProjectSchema = z
  .object({
    title: z.string().trim().min(3).max(200),
    summary: z.string().trim().min(10).max(500),
    description: z.string().trim().min(10).max(10000),
    category: z.string().trim().min(2).max(80),
    projectType: z.enum(PROJECT_TYPES),
    status: z.enum(["DRAFT", "OPEN"]).default("DRAFT"),
    visibility: z.enum(PROJECT_VISIBILITIES).default("PUBLIC"),
    minTeamSize: z.coerce.number().int().min(1).max(50).default(1),
    maxTeamSize: z.coerce.number().int().min(1).max(50).default(4),
    applicationDeadline: z.coerce.date().nullable().optional(),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD")
      .nullable()
      .optional(),
    skills: z.array(projectSkillItemSchema).max(30).optional(),
    roles: z.array(projectRoleItemSchema).max(20).optional(),
  })
  .refine((data) => data.maxTeamSize >= data.minTeamSize, {
    message: "maxTeamSize must be greater than or equal to minTeamSize",
    path: ["maxTeamSize"],
  });

export const updateProjectSchema = z.object({
  title: z.string().trim().min(3).max(200).optional(),
  summary: z.string().trim().min(10).max(500).optional(),
  description: z.string().trim().min(10).max(10000).optional(),
  category: z.string().trim().min(2).max(80).optional(),
  projectType: z.enum(PROJECT_TYPES).optional(),
  visibility: z.enum(PROJECT_VISIBILITIES).optional(),
  minTeamSize: z.coerce.number().int().min(1).max(50).optional(),
  maxTeamSize: z.coerce.number().int().min(1).max(50).optional(),
  applicationDeadline: z.coerce.date().nullable().optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD")
    .nullable()
    .optional(),
});

export const updateProjectStatusSchema = z.object({
  status: z.enum(PROJECT_STATUSES),
});

export const replaceProjectSkillsSchema = z.object({
  skills: z.array(projectSkillItemSchema).max(30),
});

export const replaceProjectRolesSchema = z.object({
  roles: z.array(projectRoleItemSchema).max(20),
});

export const listProjectsQuerySchema = paginationQuerySchema.extend({
  status: z.enum(PROJECT_STATUSES).optional(),
  category: z.string().trim().max(80).optional(),
  projectType: z.enum(PROJECT_TYPES).optional(),
  skillId: z.coerce.number().int().positive().optional(),
  skillName: z.string().trim().max(80).optional(),
  roleId: z.coerce.number().int().positive().optional(),
  ownerId: z.coerce.number().int().positive().optional(),
  search: z.string().trim().max(150).optional(),
});

export const recommendationsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const projectIdParamsSchema = z.object({
  projectId: positiveIntIdParam,
});

export const projectSkillParamsSchema = z.object({
  projectId: positiveIntIdParam,
  skillId: positiveIntIdParam,
});

export const projectRoleParamsSchema = z.object({
  projectId: positiveIntIdParam,
  roleId: positiveIntIdParam,
});
