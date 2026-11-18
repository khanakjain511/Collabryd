import { Router } from "express";
import {
  requireAuth,
  requireProjectManager,
  validate,
} from "../../common/index.js";
import * as controller from "./applications.controller.js";
import {
  applicationIdParamsSchema,
  createApplicationSchema,
  listApplicationsQuerySchema,
  projectIdParamsSchema,
} from "./applications.schemas.js";

export const projectApplicationsRouter: Router = Router({ mergeParams: true });

/**
 * Submit an application to join a project
 */
projectApplicationsRouter.post(
  "/",
  requireAuth,
  validate({ params: projectIdParamsSchema, body: createApplicationSchema }),
  controller.submitApplicationHandler
);

/**
 * List all applications submitted to this project (Project Manager required)
 */
projectApplicationsRouter.get(
  "/",
  requireAuth,
  validate({
    params: projectIdParamsSchema,
    query: listApplicationsQuerySchema,
  }),
  requireProjectManager,
  controller.listProjectApplicationsHandler
);

export const applicationsRouter: Router = Router();

applicationsRouter.use(requireAuth);

/**
 * List applications submitted by the logged-in user
 */
applicationsRouter.get(
  "/me",
  validate({ query: listApplicationsQuerySchema }),
  controller.listMyApplicationsHandler
);

/**
 * List incoming applications across all projects managed by the logged-in user
 */
applicationsRouter.get(
  "/incoming",
  validate({ query: listApplicationsQuerySchema }),
  controller.listIncomingApplicationsHandler
);

/**
 * Accept an application (Transactional: marks accepted and inserts into project members)
 */
applicationsRouter.post(
  "/:applicationId/accept",
  validate({ params: applicationIdParamsSchema }),
  controller.acceptApplicationHandler
);

/**
 * Reject an application
 */
applicationsRouter.post(
  "/:applicationId/reject",
  validate({ params: applicationIdParamsSchema }),
  controller.rejectApplicationHandler
);

/**
 * Withdraw an application (Applicant only)
 */
applicationsRouter.post(
  "/:applicationId/withdraw",
  validate({ params: applicationIdParamsSchema }),
  controller.withdrawApplicationHandler
);
