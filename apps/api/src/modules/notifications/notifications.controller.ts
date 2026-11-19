import type { Request, Response } from "express";
import {
  getValidatedParams,
  getValidatedQuery,
  sendSuccess,
} from "../../common/index.js";
import * as notificationsService from "./notifications.service.js";

export async function listNotificationsHandler(req: Request, res: Response) {
  const query = getValidatedQuery<
    Parameters<typeof notificationsService.listNotifications>[1]
  >(req);
  const { items, meta } = await notificationsService.listNotifications(
    req.user!.userId,
    query
  );
  sendSuccess(res, items, { pagination: meta });
}

export async function unreadCountHandler(req: Request, res: Response) {
  const unreadCount = await notificationsService.getUnreadCount(
    req.user!.userId
  );
  sendSuccess(res, { unreadCount });
}

export async function markReadHandler(req: Request, res: Response) {
  const { notificationId } = getValidatedParams<{ notificationId: number }>(req);
  const updated = await notificationsService.markNotificationRead(
    req.user!.userId,
    notificationId
  );
  sendSuccess(res, updated);
}

export async function markAllReadHandler(req: Request, res: Response) {
  const result = await notificationsService.markAllNotificationsRead(
    req.user!.userId
  );
  sendSuccess(res, result);
}

export async function getPreferencesHandler(req: Request, res: Response) {
  const prefs = await notificationsService.getNotificationPreferences(
    req.user!.userId
  );
  sendSuccess(res, prefs);
}

export async function updatePreferencesHandler(req: Request, res: Response) {
  const prefs = await notificationsService.updateNotificationPreferences(
    req.user!.userId,
    req.body
  );
  sendSuccess(res, prefs);
}
