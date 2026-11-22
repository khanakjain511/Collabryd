import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import { and, eq } from "drizzle-orm";
import {
  createNotificationListener,
  db,
  notifications,
  users,
} from "../models/index.js";
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
    client.on("notification", ({ payload }) => {
      const id = Number(payload);
      if (Number.isSafeInteger(id) && id > 0) {
        void deliver(id).catch(() =>
          logger.warn("Live notification delivery failed")
        );
      }
    });
    client.once("end", scheduleReconnect);
    await client.connect();
    await client.query("LISTEN collabryd_notifications");
  }
  function scheduleReconnect() {
    if (stopped || retry) return;
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
