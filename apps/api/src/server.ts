import { closePool } from "@collabryd/database";
import app from "./app.js";
import { closeRedis, logger, PORT } from "./config/index.js";

const server = app.listen(PORT, () => {
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

  server.close(async (err) => {
    if (err) {
      logger.error({ err }, "Error while closing HTTP server");
    }

    try {
      await Promise.all([closePool(), closeRedis()]);
      logger.info("PostgreSQL and Redis connections closed cleanly");
      process.exit(err ? 1 : 0);
    } catch (cleanupErr) {
      logger.error({ err: cleanupErr }, "Error during resource cleanup");
      process.exit(1);
    }
  });

  setTimeout(() => {
    logger.fatal("Forced shutdown after timeout");
    process.exit(1);
  }, 10_000).unref();
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
