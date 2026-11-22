import { Router } from "express";
import {
  requireAdmin,
  requireAuth,
} from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import * as controller from "../controllers/admin.controller.js";
import {
  listAuditLogsQuerySchema,
  moderateProjectSchema,
  moderationReasonSchema,
  projectIdParamsSchema,
  roleOverrideBodySchema,
  roleOverrideParamsSchema,
  userIdParamsSchema,
} from "../schemas/admin.schemas.js";

const adminRouter: Router = Router();

adminRouter.use(requireAuth, requireAdmin);

adminRouter.get("/metrics", controller.getMetricsHandler);

adminRouter.get(
  "/audit-logs",
  validate({ query: listAuditLogsQuerySchema }),
  controller.listAuditLogsHandler
);

adminRouter.post(
  "/users/:userId/suspend",
  validate({ params: userIdParamsSchema, body: moderationReasonSchema }),
  controller.suspendUserHandler
);

adminRouter.post(
  "/users/:userId/activate",
  validate({ params: userIdParamsSchema, body: moderationReasonSchema }),
  controller.activateUserHandler
);

adminRouter.post(
  "/projects/:projectId/moderate",
  validate({ params: projectIdParamsSchema, body: moderateProjectSchema }),
  controller.moderateProjectHandler
);

adminRouter.post(
  "/projects/:projectId/members/:userId/role-override",
  validate({ params: roleOverrideParamsSchema, body: roleOverrideBodySchema }),
  controller.overrideRoleHandler
);

export default adminRouter;
