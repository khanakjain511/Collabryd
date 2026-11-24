import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import { and, eq } from "drizzle-orm";
import {
  conversationMembers,
  createNotificationListener,
  db,
  notifications,
  users,
} from "../models/index.js";
import { assertConversationMember } from "./conversations.service.js";
import { resolveAuthenticatedUser } from "../middlewares/auth.middleware.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { env, logger } from "../config/index.js";

export async function attachNotificationSockets(server: HttpServer) {
  const io = new Server(server, {
    cors: { origin: env.CORS_ORIGINS, credentials: true },
    maxHttpBufferSize: 16384,
  });
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const user = await resolveAuthenticatedUser(token);
      if (user.accountStatus !== "ACTIVE") throw new Error();
      await socket.join(`user:${user.userId}`);
      next();
    } catch {
      next(new Error("Authentication required"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("conversation:join", async (id: unknown, ack: unknown) => {
      if (typeof ack !== "function") return;
      if (typeof id !== "number" || !Number.isSafeInteger(id) || id <= 0) return ack(false);
      try {
        const user = await resolveAuthenticatedUser(socket.handshake.auth.token);
        if (user.accountStatus !== "ACTIVE") return ack(false);
        await assertConversationMember(id, user.userId);
        await socket.join(`conversation:${id}`);
        ack(true);
      } catch {
        ack(false);
      }
    });
    socket.on("conversation:leave", (id: unknown) => {
      if (typeof id === "number") void socket.leave(`conversation:${id}`);
    });
  });

  async function deliverChat(id: number) {
    if (!io.engine.clientsCount) return;
    const members = await db.select({ userId: users.userId }).from(conversationMembers)
      .innerJoin(users, eq(users.userId, conversationMembers.userId))
      .where(and(eq(conversationMembers.conversationId, id), eq(users.accountStatus, "ACTIVE")));
    const room = `conversation:${id}`;
    // Membership can change after join. Authorize this delivery against the committed rows.
    for (const { userId } of members) {
      for (const sid of io.sockets.adapter.rooms.get(`user:${userId}`) ?? []) {
        const socket = io.sockets.sockets.get(sid);
        if (!socket) continue;
        try {
          verifyAccessToken(socket.handshake.auth.token);
          if (socket.rooms.has(room)) socket.emit("conversation:changed", id);
          else socket.emit("inbox:changed");
        } catch {
          socket.disconnect(true);
        }
      }
    }
  }

  async function deliver(id: number) {
    if (!io.engine.clientsCount) return;
    const [result] = await db
      .select({ notification: notifications })
      .from(notifications)
      .innerJoin(users, eq(users.userId, notifications.recipientId))
      .where(
        and(
          eq(notifications.notificationId, id),
          eq(users.accountStatus, "ACTIVE")
        )
      );
    if (!result) return;
    if (result.notification.type === "NEW_MESSAGE") {
      const [member] = await db.select({ userId: conversationMembers.userId }).from(conversationMembers)
        .where(and(eq(conversationMembers.conversationId, result.notification.resourceId),
          eq(conversationMembers.userId, result.notification.recipientId)));
      if (!member) return;
    }
    const room = `user:${result.notification.recipientId}`;
    for (const socketId of io.sockets.adapter.rooms.get(room) ?? []) {
      const socket = io.sockets.sockets.get(socketId);
      if (!socket) continue;
      try {
        verifyAccessToken(socket.handshake.auth.token);
        socket.emit("notification:new", result.notification);
      } catch {
        socket.disconnect(true);
      }
    }
  }

  let stopped = false;
  let retry: NodeJS.Timeout | undefined;
  let listener = createNotificationListener();
  async function listen() {
    const client = listener;
    client.on("error", () =>
      logger.warn("Notification database connection lost")
    );
    client.on("notification", ({ channel, payload }) => {
      if (channel === "collabryd_chat" && payload?.startsWith("read:")) {
        const userId = Number(payload.slice(5));
        if (Number.isSafeInteger(userId)) io.to(`user:${userId}`).emit("inbox:changed");
        return;
      }
      const id = Number(payload);
      if (Number.isSafeInteger(id) && id > 0) {
        const delivery = channel === "collabryd_chat" ? deliverChat(id) : deliver(id);
        void delivery.catch(() =>
          logger.warn("Live notification delivery failed")
        );
      }
    });
    client.once("end", scheduleReconnect);
    await client.connect();
    await client.query("LISTEN collabryd_notifications");
    await client.query("LISTEN collabryd_chat");
    io.emit("chat:sync");
  }
  function scheduleReconnect() {
    if (stopped || retry) return;
    void listener.end().catch(() => logger.warn("Listener cleanup failed"));
    retry = setTimeout(() => {
      retry = undefined;
      listener = createNotificationListener();
      void listen().catch(scheduleReconnect);
    }, 1000);
  }
  await listen().catch(scheduleReconnect);
  return async () => {
    stopped = true;
    clearTimeout(retry);
    io.disconnectSockets(true);
    await listener.end();
    await io.close();
  };
}
