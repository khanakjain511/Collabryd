import { Router } from "express";
import {
  optionalAuth,
  requireAuth,
} from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import * as controller from "../controllers/profiles.controller.js";
import {
  achievementIdParamsSchema,
  createAchievementSchema,
  createSocialLinkSchema,
  discoverStudentsQuerySchema,
  linkIdParamsSchema,
  replaceIdsSchema,
  replaceUserSkillsSchema,
  skillIdParamsSchema,
  updateAchievementSchema,
  updateSocialLinkSchema,
  upsertProfileSchema,
  upsertUserSkillSchema,
  userIdParamsSchema,
} from "../schemas/profiles.schemas.js";

export const profilesRouter: Router = Router();

profilesRouter.use(requireAuth);

profilesRouter.get("/me", controller.getOwnProfileHandler);
profilesRouter.put(
  "/me",
  validate({ body: upsertProfileSchema }),
  controller.upsertOwnProfileHandler
);

profilesRouter.post(
  "/me/skills",
  validate({ body: upsertUserSkillSchema }),
  controller.upsertSkillHandler
);
profilesRouter.put(
  "/me/skills",
  validate({ body: replaceUserSkillsSchema }),
  controller.replaceSkillsHandler
);
profilesRouter.delete(
  "/me/skills/:skillId",
  validate({ params: skillIdParamsSchema }),
  controller.removeSkillHandler
);

profilesRouter.put(
  "/me/interests",
  validate({ body: replaceIdsSchema }),
  controller.replaceInterestsHandler
);

profilesRouter.put(
  "/me/preferred-roles",
  validate({ body: replaceIdsSchema }),
  controller.replacePreferredRolesHandler
);

profilesRouter.post(
  "/me/achievements",
  validate({ body: createAchievementSchema }),
  controller.addAchievementHandler
);
profilesRouter.patch(
  "/me/achievements/:achievementId",
  validate({ params: achievementIdParamsSchema, body: updateAchievementSchema }),
  controller.updateAchievementHandler
);
profilesRouter.delete(
  "/me/achievements/:achievementId",
  validate({ params: achievementIdParamsSchema }),
  controller.deleteAchievementHandler
);

profilesRouter.post(
  "/me/social-links",
  validate({ body: createSocialLinkSchema }),
  controller.addSocialLinkHandler
);
profilesRouter.patch(
  "/me/social-links/:linkId",
  validate({ params: linkIdParamsSchema, body: updateSocialLinkSchema }),
  controller.updateSocialLinkHandler
);
profilesRouter.delete(
  "/me/social-links/:linkId",
  validate({ params: linkIdParamsSchema }),
  controller.deleteSocialLinkHandler
);

export const studentsRouter: Router = Router();

studentsRouter.get(
  "/",
  optionalAuth,
  validate({ query: discoverStudentsQuerySchema }),
  controller.discoverStudentsHandler
);
studentsRouter.get(
  "/:userId",
  optionalAuth,
  validate({ params: userIdParamsSchema }),
  controller.getStudentProfileHandler
);
