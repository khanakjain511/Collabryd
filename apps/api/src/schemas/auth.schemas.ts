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

export const verifyEmailSchema = z
  .object({
    token: z.string().trim().min(6).max(256).optional(),
    otp: z.string().trim().min(6).max(256).optional(),
    email: z.string().trim().email().max(255).optional(),
  })
  .refine((data) => data.token || data.otp, {
    message: "Either token or otp must be provided",
  });

export const sendOtpSchema = z.object({
  email: z.string().trim().email().max(255),
  purpose: z.enum(["SIGNUP", "LOGIN"]).default("LOGIN"),
});

export const verifyOtpSchema = z.object({
  email: z.string().trim().email().max(255),
  otp: z.string().trim().min(6).max(10),
  purpose: z.enum(["SIGNUP", "LOGIN"]).optional(),
});

export const loginWithOtpSchema = z.object({
  email: z.string().trim().email().max(255),
  otp: z.string().trim().min(6).max(10),
});

export const resendVerificationSchema = z.object({
  email: z.string().trim().email().max(255),
  purpose: z.enum(["SIGNUP", "LOGIN"]).optional(),
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
export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type LoginWithOtpInput = z.infer<typeof loginWithOtpSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
