import rateLimit from "express-rate-limit";
import { env } from "../../config/env.js";

const skipInTest = () => env.NODE_ENV === "test";

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: skipInTest,
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests, please try again later",
    },
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: skipInTest,
  message: {
    success: false,
    error: {
      code: "AUTH_RATE_LIMIT_EXCEEDED",
      message: "Too many authentication attempts, please wait and retry",
    },
  },
});
