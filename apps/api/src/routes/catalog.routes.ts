import { Router } from "express";
import {
  requireAdmin,
  requireAuth,
} from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import * as controller from "../controllers/catalog.controller.js";
import {
  createInterestSchema,
  createRoleSchema,
  createSkillSchema,
  listInterestsQuerySchema,
  listRolesQuerySchema,
  listSkillsQuerySchema,
} from "../schemas/catalog.schemas.js";

const catalogRouter: Router = Router();

catalogRouter.get(
  "/skills",
  validate({ query: listSkillsQuerySchema }),
  controller.listSkillsHandler
);
catalogRouter.post(
  "/skills",
  requireAuth,
  requireAdmin,
  validate({ body: createSkillSchema }),
  controller.createSkillHandler
);

catalogRouter.get(
  "/interests",
  validate({ query: listInterestsQuerySchema }),
  controller.listInterestsHandler
);
catalogRouter.post(
  "/interests",
  requireAuth,
  requireAdmin,
  validate({ body: createInterestSchema }),
  controller.createInterestHandler
);

catalogRouter.get(
  "/roles",
  validate({ query: listRolesQuerySchema }),
  controller.listRolesHandler
);
catalogRouter.post(
  "/roles",
  requireAuth,
  requireAdmin,
  validate({ body: createRoleSchema }),
  controller.createRoleHandler
);

export default catalogRouter;
