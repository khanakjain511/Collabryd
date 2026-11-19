import { inArray } from "drizzle-orm";
import {
  db,
  notificationPreferences,
  notifications,
  type Database,
  type NotificationType,
} from "@collabryd/database";

type DbExecutor = Pick<Database, "select" | "insert">;

export interface NotificationPayload {
  recipientId: number;
  type: NotificationType;
  resourceType: string;
  resourceId: number;
  message: string;
}

/**
 * Inserts in-app notifications while respecting each recipient's
 * `notification_preferences.inapp_notifications` setting, and pushes
 * live `notification:new` events to connected WebSocket clients.
 */
export async function dispatchNotifications(
  items: NotificationPayload[],
  executor: DbExecutor = db
): Promise<void> {
  if (items.length === 0) return;

  const uniqueRecipients = Array.from(new Set(items.map((i) => i.recipientId)));
  const prefs = await executor
    .select({
      userId: notificationPreferences.userId,
      inappNotifications: notificationPreferences.inappNotifications,
    })
    .from(notificationPreferences)
    .where(inArray(notificationPreferences.userId, uniqueRecipients));

  const disabledSet = new Set(
    prefs.filter((p) => !p.inappNotifications).map((p) => p.userId)
  );

  const allowed = items.filter((item) => !disabledSet.has(item.recipientId));
  if (allowed.length === 0) return;

  await executor
    .insert(notifications)
    .values(
      allowed.map((item) => ({
        recipientId: item.recipientId,
        type: item.type,
        resourceType: item.resourceType,
        resourceId: item.resourceId,
        message: item.message,
      }))
    );
}
