import type { NextFunction, Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db, userProfiles, users } from "@collabryd/database";
import { ForbiddenError, UnauthorizedError } from "../errors/app-error.js";
import { verifyAccessToken } from "../utils/jwt.js";

function extractBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token;
}

export async function resolveAuthenticatedUser(token: string) {
  const payload = verifyAccessToken(token);

  const [record] = await db
    .select({
      userId: users.userId,
      email: users.email,
      accountStatus: users.accountStatus,
      systemRole: users.systemRole,
      institution: userProfiles.institution,
    })
    .from(users)
    .leftJoin(userProfiles, eq(users.userId, userProfiles.userId))
    .where(eq(users.userId, payload.userId))
    .limit(1);

  if (!record) {
    throw new UnauthorizedError("User account no longer exists", "USER_NOT_FOUND");
  }

  return record;
}

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const token = extractBearerToken(req);
  if (!token) {
    throw new UnauthorizedError("Missing Bearer access token");
  }

  const user = await resolveAuthenticatedUser(token);
  if (user.accountStatus === "SUSPENDED") {
    throw new ForbiddenError(
      "Your account has been suspended",
      "ACCOUNT_SUSPENDED"
    );
  }
  if (user.accountStatus === "DEACTIVATED") {
    throw new ForbiddenError(
      "Your account has been deactivated",
      "ACCOUNT_DEACTIVATED"
    );
  }
  if (user.accountStatus !== "ACTIVE") {
    throw new ForbiddenError(
      "Please verify your email address before continuing",
      "EMAIL_NOT_VERIFIED"
    );
  }

  req.user = user;
  next();
}

export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const token = extractBearerToken(req);
  if (!token) {
    next();
    return;
  }

  try {
    const user = await resolveAuthenticatedUser(token);
    if (user.accountStatus === "ACTIVE") {
      req.user = user;
    }
  } catch {
    // Ignore invalid/expired token on optional-auth routes
  }
  next();
}

export function requireAdmin(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    throw new UnauthorizedError();
  }
  if (req.user.systemRole !== "ADMIN") {
    throw new ForbiddenError(
      "Administrator privileges are required",
      "ADMIN_REQUIRED"
    );
  }
  next();
}
