import jwt, { type SignOptions } from "jsonwebtoken";
import type { SystemRole } from "@collabryd/database";
import { env } from "../../config/env.js";
import { UnauthorizedError } from "../errors/app-error.js";

export interface AccessTokenPayload {
  sub: string;
  userId: number;
  email: string;
  systemRole: SystemRole;
  type: "access";
}

export interface RefreshTokenPayload {
  sub: string;
  userId: number;
  jti: string;
  type: "refresh";
}

export function parseDurationToMs(duration: string): number {
  const match = /^(\d+)([smhd])$/.exec(duration.trim());
  if (!match) {
    throw new Error(`Invalid duration format: ${duration}`);
  }
  const value = Number(match[1]);
  const unit = match[2];
  const multipliers: Record<string, number> = {
    s: 1_000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };
  return value * multipliers[unit!]!;
}

export function signAccessToken(input: {
  userId: number;
  email: string;
  systemRole: SystemRole;
}): string {
  const payload: AccessTokenPayload = {
    sub: String(input.userId),
    userId: input.userId,
    email: input.email,
    systemRole: input.systemRole,
    type: "access",
  };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"],
  });
}

export function signRefreshToken(input: { userId: number; jti: string }): string {
  const payload: RefreshTokenPayload = {
    sub: String(input.userId),
    userId: input.userId,
    jti: input.jti,
    type: "refresh",
  };
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"],
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    const decoded = jwt.verify(
      token,
      env.JWT_ACCESS_SECRET
    ) as AccessTokenPayload;
    if (decoded.type !== "access" || typeof decoded.userId !== "number") {
      throw new UnauthorizedError("Invalid access token", "INVALID_TOKEN");
    }
    return decoded;
  } catch (err) {
    if (err instanceof UnauthorizedError) throw err;
    throw new UnauthorizedError("Invalid or expired access token", "INVALID_TOKEN");
  }
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    const decoded = jwt.verify(
      token,
      env.JWT_REFRESH_SECRET
    ) as RefreshTokenPayload;
    if (
      decoded.type !== "refresh" ||
      typeof decoded.userId !== "number" ||
      typeof decoded.jti !== "string"
    ) {
      throw new UnauthorizedError("Invalid refresh token", "INVALID_REFRESH_TOKEN");
    }
    return decoded;
  } catch (err) {
    if (err instanceof UnauthorizedError) throw err;
    throw new UnauthorizedError(
      "Invalid or expired refresh token",
      "INVALID_REFRESH_TOKEN"
    );
  }
}
