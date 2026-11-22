import { z } from "zod";
import { PROJECT_MEMBER_ROLES } from "@collabryd/database";
import { positiveIntIdParam } from "../utils/pagination.js";

export const projectIdParamsSchema = z.object({
  projectId: positiveIntIdParam,
});

export const memberParamsSchema = z.object({
  projectId: positiveIntIdParam,
  userId: positiveIntIdParam,
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(PROJECT_MEMBER_ROLES),
});
