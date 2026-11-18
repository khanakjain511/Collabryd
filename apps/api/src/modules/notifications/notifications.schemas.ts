import { z } from "zod";
import {
  paginationQuerySchema,
  positiveIntIdParam,
} from "../../common/utils/pagination.js";

export const listNotificationsQuerySchema = paginationQuerySchema.extend({
  unreadOnly: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
});

export const notificationIdParamsSchema = z.object({
  notificationId: positiveIntIdParam,
});

export const updateNotificationPreferencesSchema = z.object({
  emailOnApplication: z.boolean().optional(),
  emailOnTeamChange: z.boolean().optional(),
  emailOnMessage: z.boolean().optional(),
  inappNotifications: z.boolean().optional(),
});
