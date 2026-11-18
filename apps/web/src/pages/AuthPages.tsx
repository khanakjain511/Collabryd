import { useState } from "react";
import type { FormEvent } from "react";
import type { DemoData } from "../hooks/useDemoData";
import { HeroNetwork, Icon, Logo } from "../components/ui";

export function AuthPage({
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
      ? "A little trust goes a long way."
      : registering
        ? "Your people are out there."
        : mode === "forgot-password"
          ? "Let’s get you back in."
          : mode === "reset-password"
            ? "A fresh start."
            : "Good to have you back.";

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
    <main className="auth-page" id="main">
      <div className="auth-main">
        <Logo />
        <a className="auth-back" href="#/">
          <span aria-hidden="true">←</span> Back to the good stuff
        </a>
        <div className="auth-form-wrap">
          <p className="eyebrow">A PLACE FOR WHAT YOU BRING</p>
          <h1 tabIndex={-1}>{title}</h1>
          <p className="auth-intro">
            {registering
              ? "An idea, a skill, a little curiosity. That’s a good start."
              : mode === "verify-campus"
                ? "Campus verification keeps the intended community within its campus."
                : recovery
                  ? "This screen demonstrates the recovery experience."
                  : "Your next team is still taking shape. Let’s see what’s new."}
          </p>
          <div className="auth-demo">
            <Icon name="spark" size={17} />
            <p>
              <strong>Try the frontend demo.</strong> No real account is
              created. Use the sample details or any fictional details; don’t
              enter a real password.
            </p>
          </div>
          {mode === "verify-campus" ? (
            <div className="verification-panel">
              <span className="verification-icon">
                <Icon name="mail" size={30} />
              </span>
              <h2>Check? In the demo, you’re in control.</h2>
              <p>
                No email has been sent. In the live product, an expiring link
                and the campus policy will determine access.
              </p>
              <button
                type="button"
                className="button button-primary full-width"
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
                className="button button-text full-width"
                onClick={() => setSent(true)}
              >
                Preview resend feedback
              </button>
              {sent && (
                <p className="inline-info" role="status">
                  Demo only: a live service would apply a resend cooldown. No
                  email was sent.
                </p>
              )}
            </div>
          ) : sent ? (
            <div className="verification-panel">
              <Icon name="check" size={32} />
              <h2>
                {mode === "forgot-password"
                  ? "That’s the next step."
                  : "You’ve previewed the reset."}
              </h2>
              <p role="status">
                This was a local demonstration. No email was sent and no
                password was changed.
              </p>
              <a className="button button-primary" href="#/login">
                Back to login <Icon name="arrow" />
              </a>
            </div>
          ) : (
            <form className="auth-form" onSubmit={submit}>
              {registering && (
                <label>
                  Your name
                  <input
                    name="name"
                    placeholder="Alex Morgan"
                    autoComplete="name"
                    required
                    maxLength={80}
                  />
                </label>
              )}
              {mode !== "reset-password" && (
                <label>
                  Institution email
                  <span className="input-with-icon">
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
                <div className="form-field">
                  <label htmlFor="demo-password">Demo password</label>
                  <span className="input-with-icon">
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
                      className="password-toggle"
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
                <label>
                  Confirm demo password
                  <input
                    name="confirm"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? "password-error" : undefined}
                    required
                  />
                </label>
              )}
              {!registering && !recovery && (
                <div className="auth-form-links">
                  <span>Demo details are prefilled.</span>
                  <a href="#/forgot-password">Forgot password?</a>
                </div>
              )}
              {error && (
                <p className="form-error" id="password-error" role="alert">
                  {error}
                </p>
              )}
              <button
                className="button button-primary full-width"
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
                <p className="auth-terms">
                  This is a demonstration, not a live service agreement. Read
                  our <a href="#/privacy">demo privacy information</a>.
                </p>
              )}
            </form>
          )}
          {mode !== "verify-campus" && (
            <p className="auth-switch">
              {registering ? "Already found us?" : "New around here?"}{" "}
              <a href={registering ? "#/login" : "#/register"}>
                {registering ? "Log in" : "Make yourself known"}{" "}
                <Icon name="arrowUp" size={14} />
              </a>
            </p>
          )}
        </div>
        <p className="auth-bottom">
          Better things happen when we build them together.
        </p>
      </div>
      <aside className="auth-visual">
        <HeroNetwork />
        <img src="/images/campus-team.webp" alt="" width="1200" height="900" />
        <div className="auth-visual-copy">
          <span className="eyebrow">THE MISSING PIECE MIGHT BE A PERSON</span>
          <h2>
            Different strengths.
            <br />
            <em>Shared possibilities.</em>
          </h2>
          <p>
            Somewhere on your campus, there’s someone
            <br />
            who’d love to build what you’re thinking about.
          </p>
          <div className="auth-visual-bottom">
            <span>Ideas grow better together.</span>
            <span aria-hidden="true">✳</span>
          </div>
        </div>
      </aside>
    </main>
  );
}

export function AccessPage({ demo }: { demo: DemoData }) {
  return (
    <div className="access-page container">
      <span className="access-symbol">
        <Icon name="people" size={36} />
      </span>
      <p className="eyebrow">A CAMPUS COMMUNITY, WITH CLEAR BOUNDARIES</p>
      <h1>
        Let’s get you
        <br />
        <em>on the inside.</em>
      </h1>
      <p>
        Private discovery is designed for verified students.
        <br />
        For now, step into our example campus and explore.
      </p>
      <div className="hero-actions">
        <button
          type="button"
          className="button button-primary"
          onClick={demo.openDemo}
        >
          Explore the demo <Icon name="arrowUp" />
        </button>
        <a
          className="button button-secondary"
          href={demo.signedIn ? "#/verify-campus" : "#/register"}
        >
          {demo.signedIn ? "Continue verification" : "Create a demo profile"}
        </a>
      </div>
      <p className="quiet-note">
        No real accounts. No messages sent. Just possibilities.
      </p>
    </div>
  );
}
