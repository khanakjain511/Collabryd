import type { Response } from "express";

export function sendSuccess<T>(
  res: Response,
  data: T,
  meta?: Record<string, unknown>,
  statusCode = 200
): void {
  const payload: Record<string, unknown> = {
    success: true,
    data,
  };
  if (meta) {
    payload.meta = meta;
  }
  res.status(statusCode).json(payload);
}

export function sendCreated<T>(
  res: Response,
  data: T,
  meta?: Record<string, unknown>
): void {
  sendSuccess(res, data, meta, 201);
}
