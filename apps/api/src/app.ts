import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { env, logger } from "./config/index.js";
import {
  apiRateLimiter,
  errorHandler,
  notFoundHandler,
  requestIdMiddleware,
} from "./common/index.js";
import apiRouter from "./routes/index.js";

export function createApp(): Express {
  const app: Express = express();

  app.set("trust proxy", env.TRUST_PROXY_HOPS || false);

  // 1. Request ID attribution for distributed tracing
  app.use(requestIdMiddleware);

  // 2. Security headers and CORS
  app.use(helmet());
  app.use(
    cors({
      origin:
        env.CORS_ORIGINS.length === 1 ? env.CORS_ORIGINS[0] : env.CORS_ORIGINS,
      credentials: true,
    })
  );

  // 3. Body parsers
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: false }));

  // 4. Request logging
  if (env.NODE_ENV !== "test") {
    app.use(pinoHttp({ logger, serializers: { req: (req) => ({ id: req.id, method: req.method, url: req.url?.split("?")[0] }) } }));
  }

  // 5. Rate limiting and API routes
  app.use("/api", apiRateLimiter, apiRouter);

  // 6. Global 404 and Error handling middlewares
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

const app: Express = createApp();
export default app;
