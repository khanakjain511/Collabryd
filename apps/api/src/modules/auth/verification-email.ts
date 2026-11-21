import { AppError } from "../../common/errors/app-error.js";
import { env } from "../../config/env.js";

export async function sendVerificationEmail(email: string, token: string) {
  if (env.EMAIL_PROVIDER === "local") return;
  const link = new URL(env.VERIFICATION_PAGE_URL!);
  link.hash = new URLSearchParams({ token }).toString();
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
        subject: "Verify your Collabryd account",
        text: `Verify your email within 24 hours by opening this link: ${link.href}`,
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
