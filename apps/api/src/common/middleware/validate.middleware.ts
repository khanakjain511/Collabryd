import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";
import { ValidationError } from "../errors/app-error.js";

export interface ValidationSchemas {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

/**
 * Validates Express route params, query string, and JSON body using Zod.
 * Stores parsed results on `req.validated` (avoiding Express 5's read-only `req.query` getter).
 */
export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const errors: Record<string, unknown> = {};
    const validated: NonNullable<Request["validated"]> = {};

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        errors.params = result.error.flatten().fieldErrors;
      } else {
        validated.params = result.data;
      }
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        errors.query = result.error.flatten().fieldErrors;
      } else {
        validated.query = result.data;
      }
    }

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        errors.body = result.error.flatten().fieldErrors;
      } else {
        validated.body = result.data;
        req.body = result.data;
      }
    }

    if (Object.keys(errors).length > 0) {
      next(new ValidationError(errors));
      return;
    }

    req.validated = validated;
    next();
  };
}

/** Returns Zod-parsed route params with clean typing inside controllers. */
export function getValidatedParams<T>(req: Request): T {
  return req.validated!.params as T;
}

/** Returns Zod-parsed query parameters with clean typing inside controllers. */
export function getValidatedQuery<T>(req: Request): T {
  return req.validated!.query as T;
}
