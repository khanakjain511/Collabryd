import { useState } from "react";
import { AppearanceControls } from "../components/AppearanceControls";
import type { FormEvent } from "react";
import type { DemoData } from "../hooks/useDemoData";
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
            : "Log in to Collabyrd";

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    if (recovery) {
      if (
        mode === "reset-password" &&
        form.get("password") !== form.get("confirm")
      ) {
        setError("The passwords don’t match.");
        return;
      }
      event.currentTarget.reset();
      setSent(true);
      return;
    }
    if (registering) {
      demo.setProfile({
        ...demo.profile,
        name: String(form.get("name")).trim() || demo.profile.name,
      });
      demo.setSignedIn(true);
      demo.setVerified(false);
      window.location.hash = "/verify-campus";
    } else {
      demo.openDemo();
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
              ? "Campus verification keeps the intended community within its campus."
              : recovery
                ? "This screen demonstrates the recovery experience."
                : "Pick up where you left off with your campus team."}
        </p>
        <div className="auth-demo flex gap-2.5 items-start border border-border bg-soft rounded-xl p-3.5 mb-5">
          <Icon name="spark" size={17} />
          <p className="text-xs text-muted m-0 leading-relaxed">
            <strong className="text-ink font-semibold">
              Try the frontend demo.
            </strong>{" "}
            No real account is created. Use the sample details or any fictional
            details; don’t enter a real password.
          </p>
        </div>
        {mode === "verify-campus" ? (
          <div className="flex flex-col items-center text-center p-6 bg-surface border border-border rounded-xl">
            <span className="w-14 h-14 rounded-2xl bg-sage text-primary grid place-items-center mb-3">
              <Icon name="mail" size={30} />
            </span>
            <h2 className="text-xl font-semibold mb-2">
              Check? In the demo, you’re in control.
            </h2>
            <p className="text-sm text-muted mb-5 leading-relaxed">
              No email has been sent. In the live product, an expiring link and
              the campus policy will determine access.
            </p>
            <button
              type="button"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold bg-accent text-on-accent hover:bg-accent/90 transition-colors cursor-pointer shadow-sm"
              onClick={() => {
                demo.setSignedIn(true);
                demo.setVerified(true);
                window.location.hash = "/onboarding";
              }}
            >
              Confirm demo verification <Icon name="arrow" size={18} />
            </button>
            <button
              type="button"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-muted hover:text-ink transition-colors cursor-pointer mt-2"
              onClick={() => setSent(true)}
            >
              Preview resend feedback
            </button>
            {sent && (
              <p className="text-xs text-muted mt-3" role="status">
                Demo only: a live service would apply a resend cooldown. No
                email was sent.
              </p>
            )}
          </div>
        ) : sent ? (
          <div className="flex flex-col items-center text-center p-6 bg-surface border border-border rounded-xl">
            <Icon name="check" size={32} />
            <h2 className="text-xl font-semibold my-2">
              {mode === "forgot-password"
                ? "That’s the next step."
                : "You’ve previewed the reset."}
            </h2>
            <p className="text-sm text-muted mb-5 leading-relaxed" role="status">
              This was a local demonstration. No email was sent and no password
              was changed.
            </p>
            <a
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold bg-accent text-on-accent hover:bg-accent/90 transition-colors cursor-pointer shadow-sm"
              href="#/login"
            >
              Back to login <Icon name="arrow" />
            </a>
          </div>
        ) : (
          <form className="auth-form flex flex-col gap-3.5" onSubmit={submit}>
            {registering && (
              <label className="text-xs font-semibold text-ink flex flex-col gap-1.5">
                Your name
                <input
                  name="name"
                  placeholder="Alex Morgan"
                  autoComplete="name"
                  required
                  maxLength={80}
                  className="mt-1"
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
                    placeholder="alex@campus.example"
                    defaultValue={registering ? "" : "alex@campus.example"}
                    autoComplete="email"
                    required
                  />
                </span>
              </label>
            )}
            {mode !== "forgot-password" && (
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="demo-password"
                  className="text-xs font-semibold text-ink"
                >
                  Demo password
                </label>
                <span className="relative flex items-center mt-1 [&>svg:first-child]:absolute [&>svg:first-child]:left-3.5 [&>svg:first-child]:pointer-events-none [&>svg:first-child]:text-muted [&>input]:pl-10">
                  <Icon name="lock" size={18} />
                  <input
                    id="demo-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Any demo password"
                    defaultValue={registering || recovery ? "" : "demo-only"}
                    autoComplete={
                      registering || recovery
                        ? "new-password"
                        : "current-password"
                    }
                    required
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
                Confirm demo password
                <input
                  name="confirm"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? "password-error" : undefined}
                  required
                  className="mt-1"
                />
              </label>
            )}
            {!registering && !recovery && (
              <div className="auth-form-links flex items-center justify-between text-xs text-muted my-1">
                <span>Demo details are prefilled.</span>
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
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold bg-accent text-on-accent hover:bg-accent/90 transition-colors cursor-pointer shadow-sm mt-2"
              type="submit"
            >
              {registering
                ? "Create a demo profile"
                : mode === "forgot-password"
                  ? "Preview reset request"
                  : mode === "reset-password"
                    ? "Preview password reset"
                    : "Step into the demo"}
              <Icon name="arrowUp" size={18} />
            </button>
            {registering && (
              <p className="auth-terms text-xs text-muted text-center mt-3">
                This is a demonstration, not a live service agreement. Read our{" "}
                <a href="#/privacy" className="text-primary underline">
                  demo privacy information
                </a>
                .
              </p>
            )}
          </form>
        )}
        {mode !== "verify-campus" && (
          <p className="auth-switch text-xs text-muted text-center mt-5">
            {registering ? "Already found us?" : "New around here?"}{" "}
            <a
              href={registering ? "#/login" : "#/register"}
              className="text-primary font-semibold hover:underline inline-flex items-center gap-1"
            >
              {registering ? "Log in" : "Make yourself known"}{" "}
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
            alt="Generated editorial image of Indian students sketching in a campus library"
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
          ACCOUNT ACCESS / DEMO STATE
        </p>
        <h1 tabIndex={-1} className="font-display text-3xl font-medium mb-3">
          This account is on pause.
        </h1>
        <p className="text-sm text-muted mb-6 leading-relaxed">
          The suspended-account preview blocks workspace screens.
          <br />A live service must revoke access on the server.
        </p>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold bg-accent text-on-accent hover:bg-accent/90 transition-colors cursor-pointer shadow-sm"
          onClick={demo.signOut}
        >
          Leave suspended-account preview
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
        Private discovery is designed for verified students.
        <br />
        For now, step into our example campus and explore.
      </p>
      <div className="flex justify-center flex-wrap gap-3">
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold bg-accent text-on-accent hover:bg-accent/90 transition-colors cursor-pointer shadow-sm"
          onClick={demo.openDemo}
        >
          Explore the demo <Icon name="arrowUp" />
        </button>
        <a
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold border border-border bg-surface text-ink hover:bg-soft transition-colors cursor-pointer"
          href={demo.signedIn ? "#/verify-campus" : "#/register"}
        >
          {demo.signedIn ? "Continue verification" : "Create a demo profile"}
        </a>
      </div>
      <p className="text-xs text-muted mt-6">
        No real accounts. No messages sent. Just possibilities.
      </p>
    </div>
  );
}
