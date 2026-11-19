import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import { authRateLimiter } from "../../common/middleware/rate-limit.middleware.js";
import { validate } from "../../common/middleware/validate.middleware.js";
import * as controller from "./auth.controller.js";
import {
  changePasswordSchema,
  loginSchema,
  logoutSchema,
  refreshSchema,
  registerSchema,
  resendVerificationSchema,
  verifyEmailSchema,
} from "./auth.schemas.js";

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
