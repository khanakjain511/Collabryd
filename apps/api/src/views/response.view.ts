import type { Response } from "express";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: Record<string, unknown>;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  meta?: Record<string, unknown>,
  statusCode = 200
): void {
  const payload: ApiResponse<T> = {
    success: true,
    data,
    ...(meta ? { meta } : {}),
  };
  res.status(statusCode).json(payload);
}

export function sendCreated<T>(
  res: Response,
  data: T,
  meta?: Record<string, unknown>
): void {
  sendSuccess(res, data, meta, 201);
}

export function sendNoContent(res: Response): void {
  res.status(204).send();
}
