import { and, desc, eq, sql } from "drizzle-orm";
import { db, notificationPreferences, notifications } from "@collabryd/database";
import { NotFoundError } from "../../common/errors/app-error.js";
import { buildPaginationMeta } from "../../common/utils/pagination.js";

export async function listNotifications(
  userId: number,
  query: { page: number; limit: number; unreadOnly?: boolean }
) {
  const conditions = [eq(notifications.recipientId, userId)];
  if (query.unreadOnly) {
    conditions.push(eq(notifications.isRead, false));
  }
  const whereClause = and(...conditions);
  const offset = (query.page - 1) * query.limit;

  const [countRow] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(notifications)
    .where(whereClause);

  // Implements R23 when unreadOnly=true
  const items = await db
    .select()
    .from(notifications)
    .where(whereClause)
    .orderBy(desc(notifications.createdAt))
    .limit(query.limit)
    .offset(offset);

  return {
    items,
    meta: buildPaginationMeta(query.page, query.limit, countRow?.total ?? 0),
  };
}

export async function getUnreadCount(userId: number): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(notifications)
    .where(
      and(
        eq(notifications.recipientId, userId),
        eq(notifications.isRead, false)
      )
    );
  return row?.count ?? 0;
}

export async function markNotificationRead(
  userId: number,
  notificationId: number
) {
  const [updated] = await db
    .update(notifications)
    .set({ isRead: true })
    .where(
      and(
        eq(notifications.notificationId, notificationId),
        eq(notifications.recipientId, userId)
      )
    )
    .returning();

  if (!updated) {
    throw new NotFoundError("Notification not found", "NOTIFICATION_NOT_FOUND");
  }
  return updated;
}

export async function markAllNotificationsRead(userId: number) {
  // Implements W10
  const updated = await db
    .update(notifications)
    .set({ isRead: true })
    .where(
      and(
        eq(notifications.recipientId, userId),
        eq(notifications.isRead, false)
      )
    )
    .returning({ notificationId: notifications.notificationId });

  return { updatedCount: updated.length };
}

export async function getNotificationPreferences(userId: number) {
  const [existing] = await db
    .select()
    .from(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId))
    .limit(1);

  if (existing) return existing;

  const [created] = await db
    .insert(notificationPreferences)
    .values({ userId })
    .onConflictDoNothing()
    .returning();

  if (created) return created;

  const [reloaded] = await db
    .select()
    .from(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId))
    .limit(1);

  return reloaded!;
}

export async function updateNotificationPreferences(
  userId: number,
  input: Partial<{
    emailOnApplication: boolean;
    emailOnTeamChange: boolean;
    emailOnMessage: boolean;
    inappNotifications: boolean;
  }>
) {
  const current = await getNotificationPreferences(userId);
  const [updated] = await db
    .update(notificationPreferences)
    .set({
      emailOnApplication:
        input.emailOnApplication ?? current.emailOnApplication,
      emailOnTeamChange: input.emailOnTeamChange ?? current.emailOnTeamChange,
      emailOnMessage: input.emailOnMessage ?? current.emailOnMessage,
      inappNotifications:
        input.inappNotifications ?? current.inappNotifications,
    })
    .where(eq(notificationPreferences.userId, userId))
    .returning();

  return updated!;
}
