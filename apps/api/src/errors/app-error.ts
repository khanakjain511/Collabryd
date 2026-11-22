export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;
  public readonly isOperational = true;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request", code = "BAD_REQUEST", details?: unknown) {
    super(400, code, message, details);
  }
}

export class ValidationError extends AppError {
  constructor(details: unknown, message = "Request validation failed") {
    super(400, "VALIDATION_ERROR", message, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required", code = "UNAUTHORIZED") {
    super(401, code, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to perform this action", code = "FORBIDDEN") {
    super(403, code, message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found", code = "NOT_FOUND") {
    super(404, code, message);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource conflict", code = "CONFLICT", details?: unknown) {
    super(409, code, message, details);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = "Too many requests, please try again later") {
    super(429, "RATE_LIMIT_EXCEEDED", message);
  }
}

interface PgErrorLike {
  code?: string;
  constraint?: string;
  detail?: string;
  cause?: PgErrorLike;
}

export function extractPgError(err: unknown): PgErrorLike | null {
  if (!err || typeof err !== "object") return null;
  const candidate = err as PgErrorLike;
  if (typeof candidate.code === "string") return candidate;
  if (candidate.cause && typeof candidate.cause === "object") {
    return extractPgError(candidate.cause);
  }
  return null;
}

export function mapPostgresError(err: unknown): AppError | null {
  const pgErr = extractPgError(err);
  if (!pgErr?.code) return null;

  switch (pgErr.code) {
    case "23505": {
      if (
        pgErr.constraint === "users_email_key" ||
        pgErr.constraint === "uq_users_email_lower"
      ) {
        return new ConflictError(
          "An account with this email already exists",
          "EMAIL_ALREADY_EXISTS"
        );
      }
      if (pgErr.constraint === "uq_active_application") {
        return new ConflictError(
          "You already have a pending application for this project",
          "DUPLICATE_PENDING_APPLICATION"
        );
      }
      if (pgErr.constraint === "project_roles_project_id_role_id_key") {
        return new ConflictError(
          "This role is already defined for the project",
          "DUPLICATE_PROJECT_ROLE"
        );
      }
      if (pgErr.constraint === "messages_conversation_id_client_message_id_key") {
        return new ConflictError(
          "Duplicate client message ID in conversation",
          "DUPLICATE_CLIENT_MESSAGE_ID"
        );
      }
      return new ConflictError("A record with these values already exists", "UNIQUE_VIOLATION");
    }
    case "23503":
      return new BadRequestError(
        "Referenced resource does not exist or cannot be removed while referenced",
        "FOREIGN_KEY_VIOLATION"
      );
    case "23514":
      return new BadRequestError(
        "Data violates a database integrity constraint",
        "CHECK_VIOLATION"
      );
    case "22P02":
      return new BadRequestError("Invalid identifier or value syntax", "INVALID_SYNTAX");
    default:
      return null;
  }
}
