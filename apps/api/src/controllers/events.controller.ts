import type { Request, Response } from "express";
import { getValidatedParams, getValidatedQuery } from "../middlewares/index.js";
import { sendCreated, sendNoContent, sendSuccess } from "../views/index.js";
import * as eventsService from "../services/events.service.js";
import type {
  createEventSchema,
  listEventsQuerySchema,
  updateEventPublicationSchema,
  updateEventSchema,
} from "../schemas/events.schemas.js";
import type { z } from "zod";

export async function listEventsHandler(req: Request, res: Response) {
  const query = getValidatedQuery<z.infer<typeof listEventsQuerySchema>>(req);
  const { items, pagination } = await eventsService.listEvents(query);
  sendSuccess(res, items, { pagination });
}

export async function getEventHandler(req: Request, res: Response) {
  const { slug } = getValidatedParams<{ slug: string }>(req);
  const event = await eventsService.getEventBySlug(slug);
  sendSuccess(res, event);
}

export async function createEventHandler(req: Request, res: Response) {
  const body = req.body as z.infer<typeof createEventSchema>;
  const event = await eventsService.createEvent(req.user?.userId, body);
  sendCreated(res, event);
}

export async function updateEventHandler(req: Request, res: Response) {
  const { slug } = getValidatedParams<{ slug: string }>(req);
  const body = req.body as z.infer<typeof updateEventSchema>;
  const event = await eventsService.updateEvent(slug, body);
  sendSuccess(res, event);
}

export async function updatePublicationHandler(req: Request, res: Response) {
  const { slug } = getValidatedParams<{ slug: string }>(req);
  const { publication } = req.body as z.infer<typeof updateEventPublicationSchema>;
  const event = await eventsService.setEventPublication(slug, publication);
  sendSuccess(res, event);
}

export async function deleteEventHandler(req: Request, res: Response) {
  const { slug } = getValidatedParams<{ slug: string }>(req);
  await eventsService.deleteEvent(slug);
  sendNoContent(res);
}
