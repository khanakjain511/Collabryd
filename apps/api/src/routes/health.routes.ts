import { Router } from "express";
import { sql } from "drizzle-orm";
import { db } from "@collabryd/database";
import { getRedisHealth } from "../config/index.js";

const healthRouter: Router = Router();

healthRouter.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "API is running",
    data: {
      status: "ok",
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    },
  });
});

healthRouter.get("/ready", async (_req, res) => {
  await db.execute(sql`SELECT 1`);
  const redisStatus = await getRedisHealth();

  res.json({
    success: true,
    data: {
      status: "ready",
      database: "connected",
      redis: redisStatus,
      timestamp: new Date().toISOString(),
    },
  });
});

export default healthRouter;
