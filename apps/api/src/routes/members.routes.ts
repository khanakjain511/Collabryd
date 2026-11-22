import { Router } from "express";
import {
  optionalAuth,
  requireAuth,
  requireProjectManager,
  validate,
} from "../middlewares/index.js";
import * as controller from "../controllers/members.controller.js";
import {
  memberParamsSchema,
  projectIdParamsSchema,
  updateMemberRoleSchema,
} from "../schemas/members.schemas.js";

const projectMembersRouter: Router = Router({ mergeParams: true });

/**
 * List all members of a project team
 */
projectMembersRouter.get(
  "/",
  optionalAuth,
  validate({ params: projectIdParamsSchema }),
  controller.listMembersHandler
);

/**
 * Update a member's project role (OWNER or ADMIN only)
 */
projectMembersRouter.patch(
  "/:userId",
  requireAuth,
  validate({ params: memberParamsSchema, body: updateMemberRoleSchema }),
  requireProjectManager,
  controller.updateMemberRoleHandler
);

/**
 * Remove a member from the project (or self-leave)
 */
projectMembersRouter.delete(
  "/:userId",
  requireAuth,
  validate({ params: memberParamsSchema }),
  controller.removeMemberHandler
);

export default projectMembersRouter;
