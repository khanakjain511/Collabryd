import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import * as controller from "../controllers/notifications.controller.js";
import {
  listNotificationsQuerySchema,
  notificationIdParamsSchema,
  updateNotificationPreferencesSchema,
} from "../schemas/notifications.schemas.js";

const notificationsRouter: Router = Router();

notificationsRouter.use(requireAuth);

notificationsRouter.get(
  "/",
  validate({ query: listNotificationsQuerySchema }),
  controller.listNotificationsHandler
);

notificationsRouter.get("/unread-count", controller.unreadCountHandler);

notificationsRouter.patch("/read-all", controller.markAllReadHandler);

notificationsRouter.get("/preferences", controller.getPreferencesHandler);

notificationsRouter.patch(
  "/preferences",
  validate({ body: updateNotificationPreferencesSchema }),
  controller.updatePreferencesHandler
);

notificationsRouter.patch(
  "/:notificationId/read",
  validate({ params: notificationIdParamsSchema }),
  controller.markReadHandler
);

export default notificationsRouter;
