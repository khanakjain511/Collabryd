import { useEffect, useState } from "react";
import { AppearanceControls } from "../components/AppearanceControls";
import type { FormEvent } from "react";
import type { DemoData } from "../hooks/useDemoData";
import { authApi } from "../lib/api";
import { Icon, Logo } from "../components/ui";

function AuthContent({
  mode,
  demo,
}: {
  mode:
    | "login"
    | "register"
    | "verify-campus"
    | "forgot-password"
    | "reset-password";
  demo: DemoData;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"password" | "otp">("password");
  const [loginOtpSent, setLoginOtpSent] = useState(false);
  const [loginOtpEmail, setLoginOtpEmail] = useState(demo.pendingEmail || "");
  const [loginOtpCode, setLoginOtpCode] = useState("");
  const [loginOtpMessage, setLoginOtpMessage] = useState("");

  const [verificationInput, setVerificationInput] = useState(
    () => new URLSearchParams(window.location.hash.slice(1)).get("token") || demo.verificationToken
  );

  const [resendEmail, setResendEmail] = useState(demo.pendingEmail);
  const [resendMessage, setResendMessage] = useState("");

  useEffect(() => {
    if (mode !== "verify-campus") return;
    function readVerificationLink() {
      const token = new URLSearchParams(window.location.hash.slice(1)).get("token");
      if (token) setVerificationInput(token);
    }
    window.addEventListener("hashchange", readVerificationLink);
    return () => window.removeEventListener("hashchange", readVerificationLink);
  }, [mode]);

  const registering = mode === "register";
  const recovery = mode === "forgot-password" || mode === "reset-password";
  const title =
    mode === "verify-campus"
      ? "Verify your campus"
      : registering
        ? "Create your account"
        : mode === "forgot-password"
          ? "Reset your password"
          : mode === "reset-password"
            ? "Choose a new password"
            : "Log in to Collabryd";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);

    try {
      if (recovery) {
        if (
          mode === "reset-password" &&
          form.get("password") !== form.get("confirm")
        ) {
          setError("The passwords don’t match.");
          setLoading(false);
          return;
        }
        event.currentTarget.reset();
        setSent(true);
        setLoading(false);
        return;
      }

      if (registering) {
        const name = String(form.get("name") || "").trim();
        const email = String(form.get("email") || "").trim();
        const password = String(form.get("password") || "");

        if (!name || !email || !password) {
          setError("Please provide your name, institution email, and password.");
          setLoading(false);
          return;
        }

        const err = await demo.registerStudentAccount({
          email,
          password,
          name,
        });

        if (err) {
          setError(err);
        }
      } else {
        const email = String(form.get("email") || "").trim();
        const password = String(form.get("password") || "");

        const err = await demo.login(email, password);
        if (err) setError(err);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(tokenValue: string) {
    setError("");
    setLoading(true);
    try {
      const token = tokenValue.trim();
      if (!token) {
        setError("Enter the token from your verification email.");
        return;
      }
      const err = await demo.verifyEmailToken(token);
      if (err) setError(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResendMessage("");
    setLoading(true);
    try {
      const result = await authApi.sendOtp(resendEmail.trim(), "SIGNUP");
      setVerificationInput(result.otp || result.verificationToken || "");
      setResendMessage(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend verification code.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSendLoginOtp(event?: FormEvent) {
    if (event) event.preventDefault();
    setError("");
    setLoginOtpMessage("");
    setLoading(true);
    try {
      if (!loginOtpEmail.trim()) {
        setError("Please enter your campus email address.");
        return;
      }
      const result = await demo.sendLoginOtp(loginOtpEmail.trim());
      if (!result.success) {
        setError(result.message);
        return;
      }
      setLoginOtpSent(true);
      setLoginOtpMessage(result.message);
      if (result.otp) {
        setLoginOtpCode(result.otp);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyLoginOtp(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (!loginOtpEmail.trim() || !loginOtpCode.trim()) {
        setError("Please enter your email and the 6-digit verification code.");
        return;
      }
      const err = await demo.loginWithOtp(loginOtpEmail.trim(), loginOtpCode.trim());
      if (err) setError(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-content">
      <div className="auth-form-wrap max-w-md mx-auto w-full">
        {(mode === "login" || mode === "register") && (
          <nav
            className="auth-tabs flex gap-1 p-1 mb-5 rounded-lg bg-soft"
            aria-label="Account options"
          >
            <a
              href="#/login"
              className="flex-1 grid place-items-center min-h-[44px] text-sm rounded-md transition-colors aria-[current=page]:bg-surface aria-[current=page]:shadow-sm aria-[current=page]:font-bold"
              aria-current={mode === "login" ? "page" : undefined}
            >
              Log in
            </a>
            <a
              href="#/register"
              className="flex-1 grid place-items-center min-h-[44px] text-sm rounded-md transition-colors aria-[current=page]:bg-surface aria-[current=page]:shadow-sm aria-[current=page]:font-bold"
              aria-current={registering ? "page" : undefined}
            >
              Sign up
            </a>
          </nav>
        )}
        <h1
          id="auth-title"
          tabIndex={-1}
          className="font-display text-4xl sm:text-5xl font-medium tracking-tight mb-2 leading-tight"
        >
          {title}
        </h1>
        <p className="auth-intro text-sm text-muted mb-4 leading-relaxed">
          {registering
            ? "Start a profile and find students to build with."
            : mode === "verify-campus"
              ? "Campus verification keeps the student community authenticated and private."
              : recovery
                ? "Manage your password and recover your campus account."
                : "Pick up where you left off with your campus team."}
        </p>

        {mode === "verify-campus" ? (
          <div className="flex flex-col items-center text-center p-6 bg-surface border border-border rounded-xl">
            <span className="w-14 h-14 rounded-2xl bg-sage text-primary grid place-items-center mb-3">
              <Icon name="mail" size={30} />
            </span>
            <h2 className="text-xl font-semibold mb-2">
              Verify your campus identity
            </h2>
            <p className="text-sm text-muted mb-4 leading-relaxed">
              Enter the 6-digit verification code (OTP) sent to your campus email address to activate your account.
            </p>

            {demo.authMessage && !resendMessage && <p role="status">{demo.authMessage}</p>}
            <div className="w-full mb-4 text-left">
              <label htmlFor="verification-token" className="text-xs font-semibold text-ink block mb-1.5">
                6-Digit Verification Code (OTP)
              </label>
              <input
                className="w-full px-3.5 py-2.5 bg-surface border border-input-border rounded-lg text-sm text-ink placeholder:text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-colors font-mono tracking-widest text-center text-lg"
                id="verification-token"
                placeholder="482915"
                maxLength={6}
                value={verificationInput}
                onChange={(e) => setVerificationInput(e.target.value)}
              />
            </div>

            {error && (
              <p role="alert" className="text-xs text-danger font-medium mb-3">
                {error}
              </p>
            )}

            <button
              type="button"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold bg-accent text-on-accent hover:bg-accent/90 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
              onClick={() => handleVerify(verificationInput)}
            >
              {loading ? "Verifying…" : "Confirm verification code"}{" "}
              <Icon name="arrow" size={18} />
            </button>
            <form onSubmit={handleResend} className="w-full mt-4">
              <label className="text-xs font-semibold text-ink block text-left">
                Institution email
                <input type="email" autoComplete="email" required value={resendEmail}
                  onChange={(event) => setResendEmail(event.target.value)}
                  className="w-full mt-1 px-3.5 py-2.5 bg-surface border border-input-border rounded-lg text-sm" />
              </label>
              <button type="submit" disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-muted hover:text-ink cursor-pointer mt-2">
                Resend 6-digit code
              </button>
            </form>
            {resendMessage && (
              <p className="text-xs text-muted mt-3" role="status">
                {resendMessage}
              </p>
            )}
          </div>
        ) : sent ? (
          <div className="flex flex-col items-center text-center p-6 bg-surface border border-border rounded-xl">
            <Icon name="check" size={32} />
            <h2 className="text-xl font-semibold my-2">
              {mode === "forgot-password"
                ? "Check your inbox."
                : "Password reset complete."}
            </h2>
            <p className="text-sm text-muted mb-5 leading-relaxed" role="status">
              Please follow the instructions sent to your campus email address.
            </p>
            <a
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold bg-accent text-on-accent hover:bg-accent/90 transition-colors cursor-pointer shadow-sm"
              href="#/login"
            >
              Back to login <Icon name="arrow" />
            </a>
          </div>
        ) : mode === "login" && loginMethod === "otp" ? (
          <div className="flex flex-col gap-3.5">
            <div className="flex gap-2 p-1 bg-soft rounded-lg mb-2 text-xs font-semibold">
              <button
                type="button"
                className="flex-1 py-1.5 rounded-md transition-colors text-muted hover:text-ink"
                onClick={() => { setLoginMethod("password"); setError(""); }}
              >
                Password Login
              </button>
              <button
                type="button"
                className="flex-1 py-1.5 rounded-md transition-colors bg-surface shadow-sm text-ink font-bold"
                onClick={() => { setLoginMethod("otp"); setError(""); }}
              >
                OTP Code Login
              </button>
            </div>

            {!loginOtpSent ? (
              <form onSubmit={handleSendLoginOtp} className="flex flex-col gap-3.5">
                <p className="text-xs text-muted leading-relaxed">
                  Enter your campus email. We will send a 6-digit one-time code to log you in securely.
                </p>
                <label className="text-xs font-semibold text-ink flex flex-col gap-1.5">
                  Institution email
                  <span className="relative flex items-center mt-1 [&>svg:first-child]:absolute [&>svg:first-child]:left-3.5 [&>svg:first-child]:pointer-events-none [&>svg:first-child]:text-muted [&>input]:pl-10">
                    <Icon name="mail" size={18} />
                    <input
                      name="email"
                      type="email"
                      placeholder="student@campus.edu"
                      value={loginOtpEmail}
                      onChange={(e) => setLoginOtpEmail(e.target.value)}
                      autoComplete="email"
                      required
                      className="w-full px-3.5 py-2.5 bg-surface border border-input-border rounded-lg text-sm text-ink placeholder:text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-colors"
                    />
                  </span>
                </label>

                {error && <p role="alert" className="text-xs text-danger font-medium">{error}</p>}

                <button
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold bg-accent text-on-accent hover:bg-accent/90 transition-colors cursor-pointer shadow-sm mt-1 disabled:opacity-50"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Sending code…" : "Send login code"}
                  <Icon name="arrowUp" size={18} />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyLoginOtp} className="flex flex-col gap-3.5">
                {loginOtpMessage && (
                  <p className="text-xs text-accent font-medium">{loginOtpMessage}</p>
                )}
                <label className="text-xs font-semibold text-ink flex flex-col gap-1.5">
                  6-Digit Login Code (OTP)
                  <input
                    name="otp"
                    type="text"
                    maxLength={6}
                    placeholder="482915"
                    value={loginOtpCode}
                    onChange={(e) => setLoginOtpCode(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-surface border border-input-border rounded-lg text-sm text-ink placeholder:text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-colors font-mono tracking-widest text-center text-lg"
                  />
                </label>

                {error && <p role="alert" className="text-xs text-danger font-medium">{error}</p>}

                <button
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold bg-accent text-on-accent hover:bg-accent/90 transition-colors cursor-pointer shadow-sm mt-1 disabled:opacity-50"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Logging in…" : "Verify code & log in"}
                  <Icon name="arrowUp" size={18} />
                </button>

                <div className="flex items-center justify-between text-xs text-muted mt-2">
                  <button
                    type="button"
                    onClick={() => handleSendLoginOtp()}
                    className="text-primary hover:underline bg-transparent border-0 p-0 cursor-pointer text-xs"
                    disabled={loading}
                  >
                    Resend code
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLoginOtpSent(false); setLoginOtpCode(""); setError(""); }}
                    className="text-muted hover:text-ink bg-transparent border-0 p-0 cursor-pointer text-xs"
                  >
                    Use different email
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <form className="auth-form flex flex-col gap-3.5" onSubmit={submit}>
            {mode === "login" && (
              <div className="flex gap-2 p-1 bg-soft rounded-lg mb-2 text-xs font-semibold">
                <button
                  type="button"
                  className="flex-1 py-1.5 rounded-md transition-colors bg-surface shadow-sm text-ink font-bold"
                  onClick={() => { setLoginMethod("password"); setError(""); }}
                >
                  Password Login
                </button>
                <button
                  type="button"
                  className="flex-1 py-1.5 rounded-md transition-colors text-muted hover:text-ink"
                  onClick={() => { setLoginMethod("otp"); setError(""); }}
                >
                  OTP Code Login
                </button>
              </div>
            )}
            {mode === "login" && demo.authMessage && <p role="status">{demo.authMessage}</p>}
            {registering && (
              <label className="text-xs font-semibold text-ink flex flex-col gap-1.5">
                Your full name
                <input
                  name="name"
                  placeholder="Aarav Sharma"
                  autoComplete="name"
                  required
                  maxLength={80}
                  className="mt-1 px-3.5 py-2.5 bg-surface border border-input-border rounded-lg text-sm text-ink placeholder:text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-colors"
                />
              </label>
            )}
            {mode !== "reset-password" && (
              <label className="text-xs font-semibold text-ink flex flex-col gap-1.5">
                Institution email
                <span className="relative flex items-center mt-1 [&>svg:first-child]:absolute [&>svg:first-child]:left-3.5 [&>svg:first-child]:pointer-events-none [&>svg:first-child]:text-muted [&>input]:pl-10">
                  <Icon name="mail" size={18} />
                  <input
                    name="email"
                    type="email"
                    placeholder="student@campus.edu"
                    defaultValue={mode === "login" ? demo.pendingEmail : ""}
                    autoComplete="email"
                    required
                    className="w-full px-3.5 py-2.5 bg-surface border border-input-border rounded-lg text-sm text-ink placeholder:text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-colors"
                  />
                </span>
              </label>
            )}
            {mode !== "forgot-password" && (
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="password-field"
                  className="text-xs font-semibold text-ink"
                >
                  Password
                </label>
                <span className="relative flex items-center mt-1 [&>svg:first-child]:absolute [&>svg:first-child]:left-3.5 [&>svg:first-child]:pointer-events-none [&>svg:first-child]:text-muted [&>input]:pl-10">
                  <Icon name="lock" size={18} />
                  <input
                    id="password-field"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
                    minLength={registering ? 8 : undefined}
                    maxLength={128}
                    autoComplete={
                      registering || recovery
                        ? "new-password"
                        : "current-password"
                    }
                    required
                    className="w-full px-3.5 py-2.5 bg-surface border border-input-border rounded-lg text-sm text-ink placeholder:text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-colors"
                  />
                  <button
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink cursor-pointer bg-transparent border-0 p-1 flex items-center justify-center"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                  >
                    <Icon name="eye" size={18} />
                  </button>
                </span>
              </div>
            )}
            {mode === "reset-password" && (
              <label className="text-xs font-semibold text-ink flex flex-col gap-1.5">
                Confirm new password
                <input
                  name="confirm"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? "password-error" : undefined}
                  required
                  className="mt-1 px-3.5 py-2.5 bg-surface border border-input-border rounded-lg text-sm text-ink placeholder:text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-colors"
                />
              </label>
            )}
            {!registering && !recovery && (
              <div className="auth-form-links flex items-center justify-between text-xs text-muted my-1">
                <a
                  href="#/forgot-password"
                  className="text-primary hover:underline"
                >
                  Forgot password?
                </a>
              </div>
            )}
            {error && (
              <p
                className="text-xs text-danger font-medium mt-1"
                id="password-error"
                role="alert"
              >
                {error}
              </p>
            )}
            <button
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold bg-accent text-on-accent hover:bg-accent/90 transition-colors cursor-pointer shadow-sm mt-2 disabled:opacity-50"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Connecting…"
                : registering
                  ? "Create campus account"
                  : mode === "forgot-password"
                    ? "Request password reset"
                    : mode === "reset-password"
                      ? "Set new password"
                      : "Sign in to workspace"}
              <Icon name="arrowUp" size={18} />
            </button>
            {registering && (
              <p className="auth-terms text-xs text-muted text-center mt-3">
                By registering, you agree to your institution’s collaboration guidelines.
                Read our{" "}
                <a href="#/privacy" className="text-primary underline">
                  privacy information
                </a>
                .
              </p>
            )}
          </form>
        )}
        {mode !== "verify-campus" && (
          <p className="auth-switch text-xs text-muted text-center mt-5">
            {registering ? "Already have an account?" : "New to Collabryd?"}{" "}
            <a
              href={registering ? "#/login" : "#/register"}
              className="text-primary font-semibold hover:underline inline-flex items-center gap-1"
            >
              {registering ? "Log in" : "Create an account"}{" "}
              <Icon name="arrowUp" size={14} />
            </a>
          </p>
        )}
      </div>
    </div>
  );
}

type AuthMode =
  "login" | "register" | "verify-campus" | "forgot-password" | "reset-password";

export function AuthPage({
  mode,
  demo,
  crossfade,
}: {
  mode: AuthMode;
  demo: DemoData;
  crossfade: boolean;
}) {
  return (
    <main className="account-page min-h-screen bg-surface" id="main">
      <header className="account-bar flex items-center justify-between gap-4 py-3.5 px-4 sm:px-12 border-b border-border">
        <Logo />
        <div className="flex items-center gap-3">
          <AppearanceControls />
          <a
            className="text-link inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            href="#/"
          >
            Back to home
          </a>
        </div>
      </header>
      <div className="account-grid grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-73px)] items-stretch">
        <div
          className="account-form self-center p-6 sm:p-12"
          data-crossfade={crossfade || undefined}
        >
          <AuthContent key={mode} mode={mode} demo={demo} />
        </div>
        <aside className="account-photo hidden lg:flex flex-col bg-inverse-bg text-on-inverse p-8 sm:p-14 justify-between">
          <img
            src="/images/campus-team.webp"
            srcSet="/images/campus-team-small.webp 640w, /images/campus-team.webp 1200w"
            sizes="(max-width: 860px) 1px, 50vw"
            alt="Students collaborating on campus"
            width="1536"
            height="1024"
            loading="lazy"
            className="w-full h-auto rounded-2xl object-cover shadow-xl"
          />
          <div className="mt-8">
            <p className="font-display text-2xl font-medium text-on-inverse mb-1">
              Good work starts with good company.
            </p>
            <span className="text-sm text-inverse-muted">
              Find teammates for the project you want to build.
            </span>
          </div>
        </aside>
      </div>
    </main>
  );
}

export function AccessPage({ demo }: { demo: DemoData }) {
  if (demo.signedIn && demo.profile.status === "Suspended")
    return (
      <div className="container max-w-lg mx-auto text-center p-8 bg-surface border border-border rounded-2xl my-16 shadow-sm">
        <span className="w-16 h-16 rounded-full bg-soft text-primary grid place-items-center mx-auto mb-4">
          <Icon name="lock" size={36} />
        </span>
        <p className="eyebrow text-xs uppercase tracking-wider font-semibold text-primary mb-2">
          ACCOUNT ACCESS
        </p>
        <h1 tabIndex={-1} className="font-display text-3xl font-medium mb-3">
          This account has been suspended.
        </h1>
        <p className="text-sm text-muted mb-6 leading-relaxed">
          Access to campus recruitment and workspace has been paused by the
          institution administrator.
        </p>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold bg-accent text-on-accent hover:bg-accent/90 transition-colors cursor-pointer shadow-sm"
          onClick={demo.signOut}
        >
          Sign out of account
        </button>
      </div>
    );

  return (
    <div className="container max-w-lg mx-auto text-center p-8 bg-surface border border-border rounded-2xl my-16 shadow-sm">
      <span className="w-16 h-16 rounded-full bg-soft text-primary grid place-items-center mx-auto mb-4">
        <Icon name="people" size={36} />
      </span>
      <p className="eyebrow text-xs uppercase tracking-wider font-semibold text-primary mb-2">
        A CAMPUS COMMUNITY, WITH CLEAR BOUNDARIES
      </p>
      <h1
        tabIndex={-1}
        className="font-display text-4xl sm:text-5xl font-medium mb-4 leading-tight"
      >
        Let’s get you
        <br />
        <em className="text-primary italic">on the inside.</em>
      </h1>
      <p className="text-sm text-muted mb-6 leading-relaxed">
        Private discovery and recruitment are reserved for verified campus members.
        Sign in with your campus account or explore available teams.
      </p>
      <div className="flex justify-center flex-wrap gap-3">
        <a
          href="#/login"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold bg-accent text-on-accent hover:bg-accent/90 transition-colors cursor-pointer shadow-sm"
        >
          Sign in <Icon name="arrowUp" />
        </a>
        <a
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold border border-border bg-surface text-ink hover:bg-soft transition-colors cursor-pointer"
          href={demo.signedIn ? "#/verify-campus" : "#/register"}
        >
          {demo.signedIn ? "Verify Campus Email" : "Create Account"}
        </a>
      </div>
      <p className="text-xs text-muted mt-6">
        Verified campus members collaborate and recruit across all student projects.
      </p>
    </div>
  );
}
