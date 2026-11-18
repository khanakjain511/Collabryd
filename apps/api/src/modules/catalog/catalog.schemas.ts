import { z } from "zod";
import { paginationQuerySchema } from "../../common/utils/pagination.js";

export const listSkillsQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().max(80).optional(),
  category: z.string().trim().max(80).optional(),
});

export const listInterestsQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().max(80).optional(),
  domain: z.string().trim().max(80).optional(),
});

export const listRolesQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().max(80).optional(),
});

export const createSkillSchema = z.object({
  name: z.string().trim().min(1).max(80),
  category: z.string().trim().min(1).max(80),
});

export const createInterestSchema = z.object({
  name: z.string().trim().min(1).max(80),
  domain: z.string().trim().min(1).max(80),
});

export const createRoleSchema = z.object({
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(1000).optional(),
});
