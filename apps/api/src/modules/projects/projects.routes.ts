import { Router } from "express";
import {
  optionalAuth,
  requireAuth,
  requireProjectManager,
  requireProjectOwner,
  validate,
} from "../../common/index.js";
import * as controller from "./projects.controller.js";
import {
  createProjectSchema,
  listProjectsQuerySchema,
  projectIdParamsSchema,
  projectRoleParamsSchema,
  projectSkillParamsSchema,
  recommendationsQuerySchema,
  replaceProjectRolesSchema,
  replaceProjectSkillsSchema,
  updateProjectSchema,
  updateProjectStatusSchema,
} from "./projects.schemas.js";

export const projectsRouter: Router = Router();

/**
 * Public/Campus list of projects with multi-criteria filtering
 */
projectsRouter.get(
  "/",
  optionalAuth,
  validate({ query: listProjectsQuerySchema }),
  controller.listProjectsHandler
);

/**
 * Create a new project (Authenticated user becomes OWNER)
 */
projectsRouter.post(
  "/",
  requireAuth,
  validate({ body: createProjectSchema }),
  controller.createProjectHandler
);

/**
 * Get project details by ID with visibility enforcement
 */
projectsRouter.get(
  "/:projectId",
  optionalAuth,
  validate({ params: projectIdParamsSchema }),
  controller.getProjectHandler
);

/**
 * Update project details (Project Manager or Admin required)
 */
projectsRouter.patch(
  "/:projectId",
  requireAuth,
  validate({ params: projectIdParamsSchema, body: updateProjectSchema }),
  requireProjectManager,
  controller.updateProjectHandler
);

/**
 * Transition project status (Project Manager or Admin required)
 */
projectsRouter.patch(
  "/:projectId/status",
  requireAuth,
  validate({ params: projectIdParamsSchema, body: updateProjectStatusSchema }),
  requireProjectManager,
  controller.updateProjectStatusHandler
);

/**
 * Delete project (Sole Project Owner or Admin required)
 */
projectsRouter.delete(
  "/:projectId",
  requireAuth,
  validate({ params: projectIdParamsSchema }),
  requireProjectOwner,
  controller.deleteProjectHandler
);

/**
 * Replace project required skills in bulk (Project Manager required)
 */
projectsRouter.put(
  "/:projectId/skills",
  requireAuth,
  validate({
    params: projectIdParamsSchema,
    body: replaceProjectSkillsSchema,
  }),
  requireProjectManager,
  controller.replaceProjectSkillsHandler
);

/**
 * Remove an individual skill from a project (Project Manager required)
 */
projectsRouter.delete(
  "/:projectId/skills/:skillId",
  requireAuth,
  validate({ params: projectSkillParamsSchema }),
  requireProjectManager,
  controller.removeProjectSkillHandler
);

/**
 * Replace project open roles in bulk (Project Manager required)
 */
projectsRouter.put(
  "/:projectId/roles",
  requireAuth,
  validate({
    params: projectIdParamsSchema,
    body: replaceProjectRolesSchema,
  }),
  requireProjectManager,
  controller.replaceProjectRolesHandler
);

/**
 * Remove an individual open role from a project (Project Manager required)
 */
projectsRouter.delete(
  "/:projectId/roles/:roleId",
  requireAuth,
  validate({ params: projectRoleParamsSchema }),
  requireProjectManager,
  controller.removeProjectRoleHandler
);

/**
 * Get current project membership capacity and member count
 */
projectsRouter.get(
  "/:projectId/capacity",
  optionalAuth,
  validate({ params: projectIdParamsSchema }),
  controller.getProjectCapacityHandler
);

/**
 * Candidate recommendations for a project based on required skills (R15)
 */
projectsRouter.get(
  "/:projectId/recommendations",
  requireAuth,
  validate({
    params: projectIdParamsSchema,
    query: recommendationsQuerySchema,
  }),
  requireProjectManager,
  controller.recommendCandidatesHandler
);

export const recommendationsRouter: Router = Router();

/**
 * Project recommendations for the logged-in student based on their skills (R16)
 */
recommendationsRouter.get(
  "/projects",
  requireAuth,
  validate({ query: recommendationsQuerySchema }),
  controller.recommendProjectsHandler
);
