import { AppError } from "../errors/app-error.js";
import { env } from "../config/env.js";

export async function sendOtpEmail(
  email: string,
  otp: string,
  purpose: "SIGNUP" | "LOGIN" = "SIGNUP"
) {
  if (env.EMAIL_PROVIDER === "local") return;

  const subject =
    purpose === "LOGIN"
      ? "Your Collabryd login verification code"
      : "Verify your Collabryd account";

  let linkHref = "";
  if (env.VERIFICATION_PAGE_URL) {
    try {
      const link = new URL(env.VERIFICATION_PAGE_URL);
      link.hash = new URLSearchParams({ token: otp }).toString();
      linkHref = link.href;
    } catch {
      // Ignore malformed URL
    }
  }

  const text =
    purpose === "LOGIN"
      ? `Your Collabryd login verification code is: ${otp}\n\nIt is valid for 10 minutes. Do not share this code with anyone.`
      : `Your Collabryd verification code is: ${otp}\n\nIt is valid for 10 minutes.\n\n${linkHref ? `Verify your email by opening this link: ${linkHref}` : ""}`.trim();

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      redirect: "error",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM,
        to: [email],
        subject,
        text,
      }),
      signal: AbortSignal.timeout(5000),
    });
    await response.body?.cancel();
    if (response.ok) return;
  } catch {
    // Provider errors can contain credentials or message content.
  }
  throw new AppError(
    503,
    "EMAIL_DELIVERY_UNAVAILABLE",
    "Email delivery is unavailable. Please request a new verification email."
  );
}

export async function sendVerificationEmail(email: string, token: string) {
  return sendOtpEmail(email, token, "SIGNUP");
}
