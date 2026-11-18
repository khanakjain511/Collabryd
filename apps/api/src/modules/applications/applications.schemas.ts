import { z } from "zod";
import { APPLICATION_STATUSES } from "@collabryd/database";
import {
  paginationQuerySchema,
  positiveIntIdParam,
} from "../../common/utils/pagination.js";

export const createApplicationSchema = z.object({
  roleId: z.coerce.number().int().positive().nullable().optional(),
  message: z.string().trim().max(2000).nullable().optional(),
});

export const listApplicationsQuerySchema = paginationQuerySchema.extend({
  status: z.enum(APPLICATION_STATUSES).optional(),
});

export const projectIdParamsSchema = z.object({
  projectId: positiveIntIdParam,
});

export const applicationIdParamsSchema = z.object({
  applicationId: positiveIntIdParam,
});
