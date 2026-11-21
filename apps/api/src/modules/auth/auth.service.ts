import { and, eq, isNull, sql } from "drizzle-orm";
import {
  db,
  emailVerificationTokens,
  notificationPreferences,
  refreshSessions,
  userProfiles,
  users,
} from "@collabryd/database";
import { env } from "../../config/env.js";
import {
  AppError,
  BadRequestError,
  ConflictError,
  ForbiddenError,
  UnauthorizedError,
} from "../../common/errors/app-error.js";
import {
  generateSecureToken,
  hashPassword,
  sha256,
  verifyPassword,
} from "../../common/utils/crypto.js";
import {
  parseDurationToMs,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../common/utils/jwt.js";
import type {
  ChangePasswordInput,
  LoginInput,
  RegisterInput,
} from "./auth.schemas.js";

import { sendVerificationEmail } from "./verification-email.js";
import { logger } from "../../config/logger.js";

const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function assertAllowedEmailDomain(email: string): void {
  if (env.ALLOWED_EMAIL_DOMAIN_LIST.length === 0) return;
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain || !env.ALLOWED_EMAIL_DOMAIN_LIST.includes(domain)) {
    throw new BadRequestError(
      `Registration is restricted to allowed campus domains: ${env.ALLOWED_EMAIL_DOMAIN_LIST.join(", ")}`,
      "EMAIL_DOMAIN_NOT_ALLOWED"
    );
  }
}

export async function registerStudent(input: RegisterInput) {
  const email = normalizeEmail(input.email);
  assertAllowedEmailDomain(email);

  const existing = await db
    .select({ userId: users.userId })
    .from(users)
    .where(sql`LOWER(${users.email}) = ${email}`)
    .limit(1);

  if (existing.length > 0) {
    throw new ConflictError(
      "An account with this email already exists",
      "EMAIL_ALREADY_EXISTS"
    );
  }

  const passwordHash = await hashPassword(input.password);
  const rawVerificationToken = generateSecureToken(32);
  const tokenHash = sha256(rawVerificationToken);
  const expiresAt = new Date(Date.now() + VERIFICATION_TTL_MS);

  const created = await db.transaction(async (tx) => {
    const [user] = await tx
      .insert(users)
      .values({
        email,
        passwordHash,
        accountStatus: "PENDING_VERIFICATION",
        systemRole: "STUDENT",
      })
      .returning({
        userId: users.userId,
        email: users.email,
        accountStatus: users.accountStatus,
        systemRole: users.systemRole,
        createdAt: users.createdAt,
      });

    const [profile] = await tx
      .insert(userProfiles)
      .values({
        userId: user!.userId,
        displayName: input.displayName,
        institution: input.institution,
        courseProgram: input.courseProgram,
        academicYear: input.academicYear,
        department: input.department ?? null,
        bio: input.bio ?? null,
        preferredProjectType: input.preferredProjectType ?? null,
      })
      .returning();

    await tx.insert(notificationPreferences).values({
      userId: user!.userId,
    });

    await tx.insert(emailVerificationTokens).values({
      userId: user!.userId,
      tokenHash,
      expiresAt,
      isUsed: false,
    });

    return { user: user!, profile: profile! };
  });

  await sendVerificationEmail(email, rawVerificationToken);
  return {
    ...created,
    ...(env.EMAIL_PROVIDER === "local"
      ? { verificationToken: rawVerificationToken }
      : {}),
  };
}

export async function verifyEmail(rawToken: string) {
  const tokenHash = sha256(rawToken);

  return db.transaction(async (tx) => {
    const [tokenRow] = await tx
      .select()
      .from(emailVerificationTokens)
      .where(eq(emailVerificationTokens.tokenHash, tokenHash))
      .for("update")
      .limit(1);

    if (!tokenRow) {
      throw new BadRequestError(
        "Invalid verification token",
        "INVALID_VERIFICATION_TOKEN"
      );
    }

    if (tokenRow.isUsed) {
      throw new BadRequestError(
        "Verification token has already been used",
        "TOKEN_ALREADY_USED"
      );
    }

    if (tokenRow.expiresAt.getTime() < Date.now()) {
      throw new BadRequestError(
        "Verification token has expired",
        "TOKEN_EXPIRED"
      );
    }

    await tx
      .update(emailVerificationTokens)
      .set({ isUsed: true })
      .where(eq(emailVerificationTokens.tokenId, tokenRow.tokenId));

    const [updatedUser] = await tx
      .update(users)
      .set({
        accountStatus: "ACTIVE",
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(users.userId, tokenRow.userId),
          eq(users.accountStatus, "PENDING_VERIFICATION")
        )
      )
      .returning({
        userId: users.userId,
        email: users.email,
        accountStatus: users.accountStatus,
      });

    if (!updatedUser) {
      throw new ConflictError(
        "Account is already verified or cannot be activated",
        "ACCOUNT_NOT_PENDING"
      );
    }

    return updatedUser;
  });
}

export async function resendVerification(rawEmail: string) {
  const email = normalizeEmail(rawEmail);

  const message = "If an unverified account exists for this email, a new verification link has been issued.";
  try {
    return await db.transaction(async (tx) => {
      // Serialize resends. Roll back rotation if the provider rejects the replacement.
      await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${email}, 0))`);
      const [user] = await tx.select({ userId: users.userId }).from(users)
        .where(and(sql`LOWER(${users.email}) = ${email}`, eq(users.accountStatus, "PENDING_VERIFICATION")))
        .limit(1);
      if (!user) return { message };

      const rawToken = generateSecureToken(32);
      await tx.update(emailVerificationTokens).set({ isUsed: true }).where(and(
        eq(emailVerificationTokens.userId, user.userId), eq(emailVerificationTokens.isUsed, false)
      ));
      await tx.insert(emailVerificationTokens).values({
        userId: user.userId, tokenHash: sha256(rawToken),
        expiresAt: new Date(Date.now() + VERIFICATION_TTL_MS),
      });
      await sendVerificationEmail(email, rawToken);
      return { message, ...(env.EMAIL_PROVIDER === "local" ? { verificationToken: rawToken } : {}) };
    });
  } catch (err) {
    if (!(err instanceof AppError) || err.code !== "EMAIL_DELIVERY_UNAVAILABLE") throw err;
    logger.warn("Verification email delivery unavailable");
    return { message };
  }
}

export async function loginStudent(input: LoginInput) {
  const email = normalizeEmail(input.email);

  const [row] = await db
    .select({
      userId: users.userId,
      email: users.email,
      passwordHash: users.passwordHash,
      accountStatus: users.accountStatus,
      systemRole: users.systemRole,
      displayName: userProfiles.displayName,
      institution: userProfiles.institution,
      courseProgram: userProfiles.courseProgram,
      academicYear: userProfiles.academicYear,
      avatarUrl: userProfiles.avatarUrl,
    })
    .from(users)
    .leftJoin(userProfiles, eq(users.userId, userProfiles.userId))
    .where(sql`LOWER(${users.email}) = ${email}`)
    .limit(1);

  if (!row) {
    throw new UnauthorizedError("Invalid email or password", "INVALID_CREDENTIALS");
  }

  const valid = await verifyPassword(row.passwordHash, input.password);
  if (!valid) {
    throw new UnauthorizedError("Invalid email or password", "INVALID_CREDENTIALS");
  }

  if (row.accountStatus === "PENDING_VERIFICATION") {
    throw new ForbiddenError(
      "Please verify your email before logging in",
      "EMAIL_NOT_VERIFIED"
    );
  }
  if (row.accountStatus === "SUSPENDED") {
    throw new ForbiddenError(
      "Your account has been suspended",
      "ACCOUNT_SUSPENDED"
    );
  }
  if (row.accountStatus === "DEACTIVATED") {
    throw new ForbiddenError(
      "Your account has been deactivated",
      "ACCOUNT_DEACTIVATED"
    );
  }

  const jti = generateSecureToken(16);
  const accessToken = signAccessToken({
    userId: row.userId,
    email: row.email,
    systemRole: row.systemRole,
  });
  const refreshToken = signRefreshToken({ userId: row.userId, jti });
  const refreshExpiresAt = new Date(
    Date.now() + parseDurationToMs(env.JWT_REFRESH_EXPIRES_IN)
  );

  await db.insert(refreshSessions).values({
    userId: row.userId,
    tokenHash: sha256(refreshToken),
    expiresAt: refreshExpiresAt,
  });

  return {
    user: {
      userId: row.userId,
      email: row.email,
      accountStatus: row.accountStatus,
      systemRole: row.systemRole,
      displayName: row.displayName,
      institution: row.institution,
      courseProgram: row.courseProgram,
      academicYear: row.academicYear,
      avatarUrl: row.avatarUrl,
    },
    tokens: {
      accessToken,
      refreshToken,
    },
  };
}

export async function refreshAuthSession(rawRefreshToken: string) {
  const decoded = verifyRefreshToken(rawRefreshToken);
  const tokenHash = sha256(rawRefreshToken);

  const outcome = await db.transaction(async (tx) => {
    const [session] = await tx
      .select()
      .from(refreshSessions)
      .where(eq(refreshSessions.tokenHash, tokenHash))
      .for("update")
      .limit(1);

    if (!session) {
      throw new UnauthorizedError(
        "Refresh session not found",
        "INVALID_REFRESH_TOKEN"
      );
    }

    // Reuse detection: revoke ALL active user sessions and COMMIT the revocation
    if (session.revokedAt !== null) {
      await tx
        .update(refreshSessions)
        .set({ revokedAt: new Date() })
        .where(
          and(
            eq(refreshSessions.userId, session.userId),
            isNull(refreshSessions.revokedAt)
          )
        );
      return { reuseDetected: true as const };
    }

    if (session.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedError("Refresh session has expired", "SESSION_EXPIRED");
    }

    const [user] = await tx
      .select({
        userId: users.userId,
        email: users.email,
        accountStatus: users.accountStatus,
        systemRole: users.systemRole,
      })
      .from(users)
      .where(eq(users.userId, decoded.userId))
      .limit(1);

    if (!user || user.accountStatus !== "ACTIVE") {
      throw new ForbiddenError("Account is not active", "ACCOUNT_INACTIVE");
    }

    await tx
      .update(refreshSessions)
      .set({ revokedAt: new Date() })
      .where(eq(refreshSessions.sessionId, session.sessionId));

    const newJti = generateSecureToken(16);
    const accessToken = signAccessToken({
      userId: user.userId,
      email: user.email,
      systemRole: user.systemRole,
    });
    const refreshToken = signRefreshToken({ userId: user.userId, jti: newJti });
    const refreshExpiresAt = new Date(
      Date.now() + parseDurationToMs(env.JWT_REFRESH_EXPIRES_IN)
    );

    await tx.insert(refreshSessions).values({
      userId: user.userId,
      tokenHash: sha256(refreshToken),
      expiresAt: refreshExpiresAt,
    });

    return { reuseDetected: false as const, accessToken, refreshToken };
  });

  if (outcome.reuseDetected) {
    throw new UnauthorizedError(
      "Refresh token reuse detected. All sessions have been revoked.",
      "REFRESH_TOKEN_REUSE_DETECTED"
    );
  }

  return {
    accessToken: outcome.accessToken,
    refreshToken: outcome.refreshToken,
  };
}

export async function logoutSession(rawRefreshToken: string): Promise<void> {
  const tokenHash = sha256(rawRefreshToken);
  await db
    .update(refreshSessions)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(refreshSessions.tokenHash, tokenHash),
        isNull(refreshSessions.revokedAt)
      )
    );
}

export async function logoutAllSessions(userId: number): Promise<void> {
  await db
    .update(refreshSessions)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(refreshSessions.userId, userId),
        isNull(refreshSessions.revokedAt)
      )
    );
}

export async function getCurrentUser(userId: number) {
  const [userRow] = await db
    .select({
      userId: users.userId,
      email: users.email,
      accountStatus: users.accountStatus,
      systemRole: users.systemRole,
      createdAt: users.createdAt,
      profile: {
        displayName: userProfiles.displayName,
        bio: userProfiles.bio,
        avatarUrl: userProfiles.avatarUrl,
        institution: userProfiles.institution,
        courseProgram: userProfiles.courseProgram,
        academicYear: userProfiles.academicYear,
        department: userProfiles.department,
        preferredProjectType: userProfiles.preferredProjectType,
        availabilityStatus: userProfiles.availabilityStatus,
        profileVisibility: userProfiles.profileVisibility,
      },
    })
    .from(users)
    .leftJoin(userProfiles, eq(users.userId, userProfiles.userId))
    .where(eq(users.userId, userId))
    .limit(1);

  if (!userRow) {
    throw new UnauthorizedError("User not found");
  }

  return userRow;
}

export async function changePassword(
  userId: number,
  input: ChangePasswordInput
): Promise<void> {
  const [user] = await db
    .select({ userId: users.userId, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.userId, userId))
    .limit(1);

  if (!user) {
    throw new UnauthorizedError("User not found");
  }

  const matches = await verifyPassword(user.passwordHash, input.currentPassword);
  if (!matches) {
    throw new UnauthorizedError(
      "Current password is incorrect",
      "INVALID_CURRENT_PASSWORD"
    );
  }

  const newHash = await hashPassword(input.newPassword);
  await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({ passwordHash: newHash, updatedAt: new Date() })
      .where(eq(users.userId, userId));

    await tx
      .update(refreshSessions)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(refreshSessions.userId, userId),
          isNull(refreshSessions.revokedAt)
        )
      );
  });
}
