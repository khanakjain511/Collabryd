import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { authRateLimiter } from "../middlewares/rate-limit.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import * as controller from "../controllers/auth.controller.js";
import {
  changePasswordSchema,
  loginSchema,
  loginWithOtpSchema,
  logoutSchema,
  refreshSchema,
  registerSchema,
  resendVerificationSchema,
  sendOtpSchema,
  verifyEmailSchema,
  verifyOtpSchema,
} from "../schemas/auth.schemas.js";

const authRouter: Router = Router();

authRouter.post(
  "/register",
  authRateLimiter,
  validate({ body: registerSchema }),
  controller.registerHandler
);
authRouter.post(
  "/verify-email",
  authRateLimiter,
  validate({ body: verifyEmailSchema }),
  controller.verifyEmailHandler
);
authRouter.post(
  "/send-otp",
  authRateLimiter,
  validate({ body: sendOtpSchema }),
  controller.sendOtpHandler
);
authRouter.post(
  "/verify-otp",
  authRateLimiter,
  validate({ body: verifyOtpSchema }),
  controller.verifyOtpHandler
);
authRouter.post(
  "/login-otp",
  authRateLimiter,
  validate({ body: loginWithOtpSchema }),
  controller.loginOtpHandler
);
authRouter.post(
  "/resend-verification",
  authRateLimiter,
  validate({ body: resendVerificationSchema }),
  controller.resendVerificationHandler
);
authRouter.post(
  "/login",
  authRateLimiter,
  validate({ body: loginSchema }),
  controller.loginHandler
);
authRouter.post(
  "/refresh",
  authRateLimiter,
  validate({ body: refreshSchema }),
  controller.refreshHandler
);
authRouter.post(
  "/logout",
  validate({ body: logoutSchema }),
  controller.logoutHandler
);
authRouter.post("/logout-all", requireAuth, controller.logoutAllHandler);
authRouter.get("/me", requireAuth, controller.meHandler);
authRouter.patch(
  "/password",
  requireAuth,
  validate({ body: changePasswordSchema }),
  controller.changePasswordHandler
);

export default authRouter;
