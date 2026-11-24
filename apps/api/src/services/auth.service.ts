import { and, desc, eq, isNull, sql } from "drizzle-orm";
import {
  authOtps,
  db,
  emailVerificationTokens,
  notificationPreferences,
  refreshSessions,
  userProfiles,
  users,
} from "../models/index.js";
import { env } from "../config/env.js";
import {
  AppError,
  BadRequestError,
  ConflictError,
  ForbiddenError,
  UnauthorizedError,
} from "../errors/app-error.js";
import {
  generateNumericOtp,
  generateSecureToken,
  hashPassword,
  sha256,
  verifyPassword,
} from "../utils/crypto.js";
import {
  parseDurationToMs,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import type {
  ChangePasswordInput,
  LoginInput,
  RegisterInput,
} from "../schemas/auth.schemas.js";

import { sendOtpEmail, sendVerificationEmail } from "./verification-email.js";
import { logger } from "../config/logger.js";

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const OTP_MAX_ATTEMPTS = 5;
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
  const otp = generateNumericOtp(6);
  const otpHash = sha256(otp);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  const created = await db.transaction(async (tx) => {
    // Check if this should be an admin account (first user or configured admin email)
    const [adminCountRow] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(eq(users.systemRole, "ADMIN"));

    const noExistingAdmins = (adminCountRow?.count ?? 0) === 0;
    const isConfiguredAdmin =
      Boolean(process.env.ADMIN_EMAIL && email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase()) ||
      email.toLowerCase().startsWith("admin@");

    const systemRole = (noExistingAdmins || isConfiguredAdmin) ? "ADMIN" : "STUDENT";

    const [user] = await tx
      .insert(users)
      .values({
        email,
        passwordHash,
        accountStatus: "PENDING_VERIFICATION",
        systemRole,
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

    await tx.insert(authOtps).values({
      userId: user!.userId,
      email,
      otpHash,
      purpose: "SIGNUP",
      attempts: 0,
      maxAttempts: OTP_MAX_ATTEMPTS,
      expiresAt,
      isUsed: false,
    });

    await tx.insert(emailVerificationTokens).values({
      userId: user!.userId,
      tokenHash: otpHash,
      expiresAt,
      isUsed: false,
    });

    return { user: user!, profile: profile! };
  });

  await sendOtpEmail(email, otp, "SIGNUP");
  return {
    ...created,
    message: "Verification code sent to your email.",
    ...(env.EMAIL_PROVIDER === "local"
      ? { otp, verificationToken: otp }
      : {}),
  };
}

export async function sendOtp(
  rawEmail: string,
  purpose: "SIGNUP" | "LOGIN" = "LOGIN"
) {
  const email = normalizeEmail(rawEmail);
  assertAllowedEmailDomain(email);

  const message =
    purpose === "LOGIN"
      ? "Login verification code sent to your email."
      : "If an unverified account exists for this email, a new verification link has been issued.";

  try {
    return await db.transaction(async (tx) => {
      await tx.execute(
        sql`SELECT pg_advisory_xact_lock(hashtextextended(${email}, 0))`
      );

      const [user] = await tx
        .select({
          userId: users.userId,
          accountStatus: users.accountStatus,
        })
        .from(users)
        .where(
          and(
            sql`LOWER(${users.email}) = ${email}`,
            purpose === "SIGNUP" ? eq(users.accountStatus, "PENDING_VERIFICATION") : sql`true`
          )
        )
        .limit(1);

      if (!user) {
        return { message };
      }

      if (purpose === "LOGIN") {
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
      }

      const otp = generateNumericOtp(6);
      const otpHash = sha256(otp);
      const expiresAt = new Date(Date.now() + OTP_TTL_MS);

      // Invalidate prior unused OTPs for this user & purpose
      await tx
        .update(authOtps)
        .set({ isUsed: true })
        .where(
          and(
            eq(authOtps.userId, user.userId),
            eq(authOtps.purpose, purpose),
            eq(authOtps.isUsed, false)
          )
        );

      await tx.insert(authOtps).values({
        userId: user.userId,
        email,
        otpHash,
        purpose,
        attempts: 0,
        maxAttempts: OTP_MAX_ATTEMPTS,
        expiresAt,
        isUsed: false,
      });

      if (purpose === "SIGNUP") {
        await tx
          .update(emailVerificationTokens)
          .set({ isUsed: true })
          .where(
            and(
              eq(emailVerificationTokens.userId, user.userId),
              eq(emailVerificationTokens.isUsed, false)
            )
          );

        await tx.insert(emailVerificationTokens).values({
          userId: user.userId,
          tokenHash: otpHash,
          expiresAt,
          isUsed: false,
        });
      }

      await sendOtpEmail(email, otp, purpose);

      return {
        message,
        ...(env.EMAIL_PROVIDER === "local"
          ? { otp, verificationToken: otp }
          : {}),
      };
    });
  } catch (err) {
    if (
      !(err instanceof AppError) ||
      err.code !== "EMAIL_DELIVERY_UNAVAILABLE"
    ) {
      throw err;
    }
    logger.warn("Verification email delivery unavailable");
    return { message };
  }
}

export async function verifyOtp(
  rawEmail: string,
  rawOtp: string,
  purpose?: "SIGNUP" | "LOGIN"
) {
  const email = normalizeEmail(rawEmail);
  const otp = rawOtp.trim();
  const inputHash = sha256(otp);

  return db.transaction(async (tx) => {
    await tx.execute(
      sql`SELECT pg_advisory_xact_lock(hashtextextended(${email}, 0))`
    );

    const [otpRow] = await tx
      .select()
      .from(authOtps)
      .where(
        and(
          sql`LOWER(${authOtps.email}) = ${email}`,
          eq(authOtps.isUsed, false),
          purpose ? eq(authOtps.purpose, purpose) : sql`true`
        )
      )
      .orderBy(desc(authOtps.createdAt))
      .for("update")
      .limit(1);

    if (!otpRow) {
      throw new BadRequestError(
        "Invalid or expired verification code",
        "INVALID_OTP"
      );
    }

    if (otpRow.expiresAt.getTime() < Date.now()) {
      await tx
        .update(authOtps)
        .set({ isUsed: true })
        .where(eq(authOtps.otpId, otpRow.otpId));

      throw new BadRequestError(
        "Verification code has expired. Please request a new code.",
        "OTP_EXPIRED"
      );
    }

    if (otpRow.attempts >= otpRow.maxAttempts) {
      await tx
        .update(authOtps)
        .set({ isUsed: true })
        .where(eq(authOtps.otpId, otpRow.otpId));

      throw new BadRequestError(
        "Too many failed attempts. Please request a new verification code.",
        "OTP_MAX_ATTEMPTS_EXCEEDED"
      );
    }

    if (otpRow.otpHash !== inputHash) {
      const nextAttempts = otpRow.attempts + 1;
      const isExhausted = nextAttempts >= otpRow.maxAttempts;

      await tx
        .update(authOtps)
        .set({
          attempts: nextAttempts,
          ...(isExhausted ? { isUsed: true } : {}),
        })
        .where(eq(authOtps.otpId, otpRow.otpId));

      const remaining = otpRow.maxAttempts - nextAttempts;
      throw new BadRequestError(
        isExhausted
          ? "Too many failed attempts. Please request a new verification code."
          : `Invalid verification code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
        "INVALID_OTP"
      );
    }

    // Mark OTP used
    await tx
      .update(authOtps)
      .set({ isUsed: true })
      .where(eq(authOtps.otpId, otpRow.otpId));

    await tx
      .update(emailVerificationTokens)
      .set({ isUsed: true })
      .where(
        and(
          eq(emailVerificationTokens.userId, otpRow.userId),
          eq(emailVerificationTokens.isUsed, false)
        )
      );

    const [user] = await tx
      .select({
        userId: users.userId,
        email: users.email,
        accountStatus: users.accountStatus,
        systemRole: users.systemRole,
        passwordHash: users.passwordHash,
        displayName: userProfiles.displayName,
        institution: userProfiles.institution,
        courseProgram: userProfiles.courseProgram,
        academicYear: userProfiles.academicYear,
        avatarUrl: userProfiles.avatarUrl,
      })
      .from(users)
      .leftJoin(userProfiles, eq(users.userId, userProfiles.userId))
      .where(eq(users.userId, otpRow.userId))
      .limit(1);

    if (!user) {
      throw new BadRequestError("User not found", "USER_NOT_FOUND");
    }

    let accountStatus = user.accountStatus;
    if (accountStatus === "PENDING_VERIFICATION") {
      await tx
        .update(users)
        .set({ accountStatus: "ACTIVE", updatedAt: new Date() })
        .where(eq(users.userId, user.userId));
      accountStatus = "ACTIVE";
    }

    if (accountStatus === "SUSPENDED") {
      throw new ForbiddenError(
        "Your account has been suspended",
        "ACCOUNT_SUSPENDED"
      );
    }
    if (accountStatus === "DEACTIVATED") {
      throw new ForbiddenError(
        "Your account has been deactivated",
        "ACCOUNT_DEACTIVATED"
      );
    }

    const effectivePurpose = purpose || otpRow.purpose;

    if (effectivePurpose === "LOGIN") {
      const jti = generateSecureToken(16);
      const accessToken = signAccessToken({
        userId: user.userId,
        email: user.email,
        systemRole: user.systemRole,
      });
      const refreshToken = signRefreshToken({ userId: user.userId, jti });
      const refreshExpiresAt = new Date(
        Date.now() + parseDurationToMs(env.JWT_REFRESH_EXPIRES_IN)
      );

      await tx.insert(refreshSessions).values({
        userId: user.userId,
        tokenHash: sha256(refreshToken),
        expiresAt: refreshExpiresAt,
      });

      return {
        message: "Logged in successfully",
        user: {
          userId: user.userId,
          email: user.email,
          accountStatus,
          systemRole: user.systemRole,
          displayName: user.displayName,
          institution: user.institution,
          courseProgram: user.courseProgram,
          academicYear: user.academicYear,
          avatarUrl: user.avatarUrl,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      };
    }

    return {
      message: "Email verified successfully",
      user: {
        userId: user.userId,
        email: user.email,
        accountStatus,
        systemRole: user.systemRole,
        displayName: user.displayName,
        institution: user.institution,
        courseProgram: user.courseProgram,
        academicYear: user.academicYear,
        avatarUrl: user.avatarUrl,
      },
    };
  });
}

export async function verifyEmail(rawTokenOrOtp: string, rawEmail?: string) {
  const token = rawTokenOrOtp.trim();
  const tokenHash = sha256(token);

  return db.transaction(async (tx) => {
    // 1. Check authOtps if email provided or if token looks like 6-digit OTP
    if (rawEmail || /^\d{6}$/.test(token)) {
      const email = rawEmail ? normalizeEmail(rawEmail) : undefined;
      const [otpRow] = await tx
        .select()
        .from(authOtps)
        .where(
          and(
            eq(authOtps.otpHash, tokenHash),
            eq(authOtps.isUsed, false),
            email ? sql`LOWER(${authOtps.email}) = ${email}` : sql`true`
          )
        )
        .for("update")
        .limit(1);

      if (otpRow) {
        if (otpRow.expiresAt.getTime() < Date.now()) {
          await tx
            .update(authOtps)
            .set({ isUsed: true })
            .where(eq(authOtps.otpId, otpRow.otpId));
          throw new BadRequestError(
            "Verification code has expired",
            "TOKEN_EXPIRED"
          );
        }

        await tx
          .update(authOtps)
          .set({ isUsed: true })
          .where(eq(authOtps.otpId, otpRow.otpId));

        await tx
          .update(emailVerificationTokens)
          .set({ isUsed: true })
          .where(
            and(
              eq(emailVerificationTokens.userId, otpRow.userId),
              eq(emailVerificationTokens.isUsed, false)
            )
          );

        const [updatedUser] = await tx
          .update(users)
          .set({ accountStatus: "ACTIVE", updatedAt: new Date() })
          .where(eq(users.userId, otpRow.userId))
          .returning({
            userId: users.userId,
            email: users.email,
            accountStatus: users.accountStatus,
          });

        return updatedUser!;
      }
    }

    // 2. Check emailVerificationTokens
    const [tokenRow] = await tx
      .select()
      .from(emailVerificationTokens)
      .where(eq(emailVerificationTokens.tokenHash, tokenHash))
      .for("update")
      .limit(1);

    if (!tokenRow) {
      throw new BadRequestError(
        "Invalid verification token or code",
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

    await tx
      .update(authOtps)
      .set({ isUsed: true })
      .where(
        and(
          eq(authOtps.userId, tokenRow.userId),
          eq(authOtps.isUsed, false)
        )
      );

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

export async function resendVerification(
  rawEmail: string,
  purpose: "SIGNUP" | "LOGIN" = "SIGNUP"
) {
  return sendOtp(rawEmail, purpose);
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

  await db.transaction(async (tx) => {
    const [current] = await tx.select({ userId: users.userId }).from(users)
      .where(and(eq(users.userId, row.userId), eq(users.passwordHash, row.passwordHash),
        eq(users.accountStatus, "ACTIVE"))).for("share").limit(1);
    if (!current) throw new UnauthorizedError("Credentials changed. Please log in again.");
    await tx.insert(refreshSessions).values({
      userId: row.userId,
      tokenHash: sha256(refreshToken),
      expiresAt: refreshExpiresAt,
    });
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
    // Lock the account before its sessions, as password changes and suspension do.
    const [user] = await tx
      .select({
        userId: users.userId,
        email: users.email,
        accountStatus: users.accountStatus,
        systemRole: users.systemRole,
      })
      .from(users)
      .where(eq(users.userId, decoded.userId))
      .for("update")
      .limit(1);

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
  await db.transaction(async (tx) => {
    await tx.select({ userId: users.userId }).from(users).where(eq(users.userId, userId)).for("update");
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
    const [updated] = await tx.update(users)
      .set({ passwordHash: newHash, updatedAt: new Date() })
      .where(and(eq(users.userId, userId), eq(users.passwordHash, user.passwordHash)))
      .returning({ userId: users.userId });
    if (!updated) throw new UnauthorizedError("Current password is incorrect", "INVALID_CURRENT_PASSWORD");

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
