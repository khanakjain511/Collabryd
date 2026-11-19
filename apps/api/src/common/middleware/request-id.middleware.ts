import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

/**
 * Middleware that assigns a unique request identifier (UUIDv4) to every incoming request.
 * If the client already sent an `X-Request-Id` header, it is reused for distributed tracing.
 * The identifier is also mirrored on the response headers.
 */
export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const existingId = req.headers["x-request-id"];
  const requestId =
    typeof existingId === "string" && existingId.length > 0
      ? existingId
      : randomUUID();

  req.id = requestId;
  res.setHeader("X-Request-Id", requestId);
  next();
}
