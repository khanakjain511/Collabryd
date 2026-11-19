import { z } from "zod";
import {
  ADMIN_AUDIT_ACTIONS,
  PROJECT_MEMBER_ROLES,
  PROJECT_STATUSES,
} from "@collabryd/database";
import {
  paginationQuerySchema,
  positiveIntIdParam,
} from "../../common/utils/pagination.js";

export const userIdParamsSchema = z.object({ userId: positiveIntIdParam });
export const projectIdParamsSchema = z.object({
  projectId: positiveIntIdParam,
});
export const roleOverrideParamsSchema = z.object({
  projectId: positiveIntIdParam,
  userId: positiveIntIdParam,
});

export const moderationReasonSchema = z.object({
  reason: z.string().trim().min(3).max(500).optional(),
});

export const moderateProjectSchema = z.object({
  status: z.enum(PROJECT_STATUSES),
  reason: z.string().trim().min(3).max(500),
});

export const roleOverrideBodySchema = z.object({
  role: z.enum(PROJECT_MEMBER_ROLES),
  reason: z.string().trim().min(3).max(500),
});

export const listAuditLogsQuerySchema = paginationQuerySchema.extend({
  action: z.enum(ADMIN_AUDIT_ACTIONS).optional(),
  targetType: z.string().trim().max(50).optional(),
});
