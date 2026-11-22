import { z } from "zod";
import { PROJECT_TYPES } from "@collabryd/database";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const registerSchema = z.object({
  email: z.string().trim().email().max(255),
  password: passwordSchema,
  displayName: z.string().trim().min(2).max(100),
  institution: z.string().trim().min(2).max(150),
  courseProgram: z.string().trim().min(2).max(150),
  academicYear: z.string().trim().min(1).max(20),
  department: z.string().trim().max(100).optional(),
  bio: z.string().trim().max(2000).optional(),
  preferredProjectType: z.enum(PROJECT_TYPES).optional(),
});

export const verifyEmailSchema = z.object({
  token: z.string().trim().min(16).max(256),
});

export const resendVerificationSchema = z.object({
  email: z.string().trim().email().max(255),
});

export const loginSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(1).max(128),
});

export const refreshSchema = z.object({
  refreshToken: z.string().trim().min(16),
});

export const logoutSchema = z.object({
  refreshToken: z.string().trim().min(16),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: passwordSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
