import { Router } from "express";
import { optionalAuth, requireAuth, validate } from "../middlewares/index.js";
import * as controller from "../controllers/events.controller.js";
import {
  createEventSchema,
  eventSlugParamsSchema,
  listEventsQuerySchema,
  updateEventPublicationSchema,
  updateEventSchema,
} from "../schemas/events.schemas.js";

const eventsRouter: Router = Router();

// Public / optional auth routes for browsing events
eventsRouter.get(
  "/",
  optionalAuth,
  validate({ query: listEventsQuerySchema }),
  controller.listEventsHandler
);

eventsRouter.get(
  "/:slug",
  optionalAuth,
  validate({ params: eventSlugParamsSchema }),
  controller.getEventHandler
);

// Authenticated author/admin routes
eventsRouter.post(
  "/",
  requireAuth,
  validate({ body: createEventSchema }),
  controller.createEventHandler
);

eventsRouter.patch(
  "/:slug",
  requireAuth,
  validate({ params: eventSlugParamsSchema, body: updateEventSchema }),
  controller.updateEventHandler
);

eventsRouter.patch(
  "/:slug/publication",
  requireAuth,
  validate({ params: eventSlugParamsSchema, body: updateEventPublicationSchema }),
  controller.updatePublicationHandler
);

eventsRouter.delete(
  "/:slug",
  requireAuth,
  validate({ params: eventSlugParamsSchema }),
  controller.deleteEventHandler
);

export default eventsRouter;
