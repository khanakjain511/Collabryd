import { z } from "zod";
import {
  AVAILABILITY_STATUSES,
  PROFICIENCY_LEVELS,
  PROFILE_VISIBILITIES,
  PROJECT_TYPES,
  SOCIAL_PLATFORMS,
} from "@collabryd/database";
import {
  paginationQuerySchema,
  positiveIntIdParam,
} from "../utils/pagination.js";

export const upsertProfileSchema = z.object({
  displayName: z.string().trim().min(2).max(100),
  bio: z.string().trim().max(2000).nullable().optional(),
  avatarUrl: z.string().trim().url().max(500).nullable().optional(),
  institution: z.string().trim().min(2).max(150),
  courseProgram: z.string().trim().min(2).max(150),
  academicYear: z.string().trim().min(1).max(20),
  department: z.string().trim().max(100).nullable().optional(),
  preferredProjectType: z.enum(PROJECT_TYPES).nullable().optional(),
  availabilityStatus: z.enum(AVAILABILITY_STATUSES).optional(),
  profileVisibility: z.enum(PROFILE_VISIBILITIES).optional(),
});

export const upsertUserSkillSchema = z.object({
  skillId: z.coerce.number().int().positive(),
  proficiencyLevel: z.enum(PROFICIENCY_LEVELS),
  yearsExperience: z.coerce
    .number()
    .min(0)
    .max(50)
    .multipleOf(0.5)
    .nullable()
    .optional(),
});

export const replaceUserSkillsSchema = z.object({
  skills: z.array(upsertUserSkillSchema).max(50),
});

export const replaceIdsSchema = z.object({
  ids: z.array(z.coerce.number().int().positive()).max(50),
});

export const createAchievementSchema = z.object({
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(2000).nullable().optional(),
  issuer: z.string().trim().max(150).nullable().optional(),
  dateAchieved: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD date")
    .nullable()
    .optional(),
});

export const updateAchievementSchema = createAchievementSchema.partial();

export const createSocialLinkSchema = z.object({
  platform: z.enum(SOCIAL_PLATFORMS),
  url: z.string().trim().url().max(500),
});

export const updateSocialLinkSchema = createSocialLinkSchema.partial();

export const discoverStudentsQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().max(100).optional(),
  skillId: z.coerce.number().int().positive().optional(),
  interestId: z.coerce.number().int().positive().optional(),
  roleId: z.coerce.number().int().positive().optional(),
  availabilityStatus: z.enum(AVAILABILITY_STATUSES).optional(),
  institution: z.string().trim().max(150).optional(),
  academicYear: z.string().trim().max(20).optional(),
});

export const userIdParamsSchema = z.object({ userId: positiveIntIdParam });
export const skillIdParamsSchema = z.object({ skillId: positiveIntIdParam });
export const interestIdParamsSchema = z.object({
  interestId: positiveIntIdParam,
});
export const roleIdParamsSchema = z.object({ roleId: positiveIntIdParam });
export const achievementIdParamsSchema = z.object({
  achievementId: positiveIntIdParam,
});
export const linkIdParamsSchema = z.object({ linkId: positiveIntIdParam });
