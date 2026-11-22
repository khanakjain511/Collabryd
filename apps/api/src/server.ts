import { createServer } from "node:http";
import { closePool } from "@collabryd/database";
import app from "./app.js";
import { closeRedis, logger, PORT } from "./config/index.js";
import { attachNotificationSockets } from "./modules/notifications/notifications.socket.js";

const server = createServer(app);
const closeSockets = await attachNotificationSockets(server);
server.listen(PORT, () => {
  logger.info(
    { port: PORT },
    `Collabryd REST API server running on http://localhost:${PORT}`
  );
});

let shuttingDown = false;

async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;

  logger.info({ signal }, "Graceful shutdown initiated");

  setTimeout(() => {
    logger.fatal("Forced shutdown after timeout");
    process.exit(1);
  }, 10_000).unref();
  try {
    await closeSockets();
    await Promise.all([closePool(), closeRedis()]);
    process.exit(0);
  } catch {
    logger.error("Backend shutdown failed");
    process.exit(1);
  }
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
