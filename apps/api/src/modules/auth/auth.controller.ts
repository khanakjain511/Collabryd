import type { Request, Response } from "express";
import { sendCreated, sendSuccess } from "../../common/utils/response.js";
import * as authService from "./auth.service.js";
import type {
  ChangePasswordInput,
  LoginInput,
  RegisterInput,
} from "./auth.schemas.js";

export async function registerHandler(req: Request, res: Response) {
  const result = await authService.registerStudent(req.body as RegisterInput);
  sendCreated(res, result);
}

export async function verifyEmailHandler(req: Request, res: Response) {
  const result = await authService.verifyEmail(req.body.token as string);
  sendSuccess(res, result);
}

export async function resendVerificationHandler(req: Request, res: Response) {
  const result = await authService.resendVerification(req.body.email as string);
  sendSuccess(res, result);
}

export async function loginHandler(req: Request, res: Response) {
  const result = await authService.loginStudent(req.body as LoginInput);
  sendSuccess(res, result);
}

export async function refreshHandler(req: Request, res: Response) {
  const tokens = await authService.refreshAuthSession(
    req.body.refreshToken as string
  );
  sendSuccess(res, { tokens });
}

export async function logoutHandler(req: Request, res: Response) {
  await authService.logoutSession(req.body.refreshToken as string);
  sendSuccess(res, { message: "Logged out successfully" });
}

export async function logoutAllHandler(req: Request, res: Response) {
  await authService.logoutAllSessions(req.user!.userId);
  sendSuccess(res, { message: "All active sessions have been revoked" });
}

export async function meHandler(req: Request, res: Response) {
  const user = await authService.getCurrentUser(req.user!.userId);
  sendSuccess(res, user);
}

export async function changePasswordHandler(req: Request, res: Response) {
  await authService.changePassword(
    req.user!.userId,
    req.body as ChangePasswordInput
  );
  sendSuccess(res, {
    message: "Password updated successfully. Please log in again.",
  });
}
