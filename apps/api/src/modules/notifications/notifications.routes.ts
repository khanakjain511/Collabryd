import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import { validate } from "../../common/middleware/validate.middleware.js";
import * as controller from "./notifications.controller.js";
import {
  listNotificationsQuerySchema,
  notificationIdParamsSchema,
  updateNotificationPreferencesSchema,
} from "./notifications.schemas.js";

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
