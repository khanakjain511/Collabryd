import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "../../config/logger.js";
import {
  AppError,
  NotFoundError,
  ValidationError,
  mapPostgresError,
} from "../errors/app-error.js";

export function notFoundHandler(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  next(
    new NotFoundError(
      `Route ${req.method} ${req.originalUrl} not found`,
      "ROUTE_NOT_FOUND"
    )
  );
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  let normalized: AppError | null = null;

  if (err instanceof AppError) {
    normalized = err;
  } else if (err instanceof ZodError) {
    normalized = new ValidationError(err.flatten().fieldErrors);
  } else if (
    err instanceof SyntaxError &&
    "status" in err &&
    (err as { status?: number }).status === 400
  ) {
    normalized = new AppError(400, "INVALID_JSON", "Malformed JSON request body");
  } else {
    normalized = mapPostgresError(err);
  }

  if (normalized) {
    if (normalized.statusCode >= 500) {
      logger.error({ err, path: req.originalUrl, method: req.method }, normalized.message);
    } else {
      logger.warn(
        { code: normalized.code, path: req.originalUrl, method: req.method },
        normalized.message
      );
    }

    res.status(normalized.statusCode).json({
      success: false,
      error: {
        code: normalized.code,
        message: normalized.message,
        ...(normalized.details !== undefined ? { details: normalized.details } : {}),
      },
    });
    return;
  }

  logger.error(
    { err, path: req.originalUrl, method: req.method },
    "Unhandled server error"
  );

  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected internal error occurred",
    },
  });
}
