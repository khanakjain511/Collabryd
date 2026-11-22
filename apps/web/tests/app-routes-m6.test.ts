import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const WEB_ROOT = path.resolve(import.meta.dirname, "..");

test("Roster.tsx implements sticky header, aria-sort, and keyboard navigation", () => {
  const content = fs.readFileSync(path.join(WEB_ROOT, "src/components/Roster.tsx"), "utf8");

  // Sticky header verification
  assert.ok(
    content.includes("sticky top-[70px]") && content.includes("z-10"),
    "Roster header missing sticky positioning or z-index"
  );

  // aria-sort contract verification
  assert.ok(
    content.includes('aria-sort={direction}') &&
    content.includes('"ascending"') &&
    content.includes('"descending"') &&
    content.includes('"none"'),
    "Roster th missing compliant aria-sort contract (ascending/descending/none)"
  );

  // Keyboard navigation verification
  assert.ok(content.includes('ArrowDown'), "Missing ArrowDown row navigation");
  assert.ok(content.includes('ArrowUp'), "Missing ArrowUp row navigation");
  assert.ok(content.includes('Enter'), "Missing Enter row activation");
  assert.ok(content.includes('tabIndex={0}'), "Roster rows must have tabIndex={0} for keyboard accessibility");
  assert.ok(content.includes('data-roster-row="true"'), "Roster rows must have data-roster-row marker");
  assert.ok(content.includes("focus-visible:ring-2"), "Roster rows must have visible focus rings");

  // Mobile card reflow verification
  assert.ok(
    content.includes("hidden md:table") && content.includes("md:hidden"),
    "Roster missing responsive table to mobile card reflow"
  );
});

test("EmptyState component implements open seat and actionable button contract", () => {
  const content = fs.readFileSync(path.join(WEB_ROOT, "src/components/ui.tsx"), "utf8");
  assert.ok(
    content.includes('<Seat status="open" size="lg" decorative />'),
    "EmptyState must render an open Seat by default"
  );
  assert.ok(
    content.includes('{action}'),
    "EmptyState must render an actionable button"
  );
});

test("Directory and hackathon pages integrate Roster, Seat pips, and EmptyState", () => {
  const discover = fs.readFileSync(path.join(WEB_ROOT, "src/pages/DiscoverPage.tsx"), "utf8");
  const teams = fs.readFileSync(path.join(WEB_ROOT, "src/pages/TeamsPages.tsx"), "utf8");
  const events = fs.readFileSync(path.join(WEB_ROOT, "src/pages/EventPages.tsx"), "utf8");

  for (const [name, src] of [["DiscoverPage", discover], ["TeamsPages", teams], ["EventPages", events]]) {
    assert.ok(src.includes("<Roster"), `${name} missing <Roster component`);
    assert.ok(src.includes("<EmptyState"), `${name} missing <EmptyState component`);
    assert.ok(src.includes("RosterSkills"), `${name} missing RosterSkills component`);
  }
});

test("Account forms implement View Transitions API with instant switch under reduced motion", () => {
  const appSrc = fs.readFileSync(path.join(WEB_ROOT, "src/App.tsx"), "utf8");

  // Check startViewTransition and flushSync usage
  assert.ok(appSrc.includes("document.startViewTransition"), "App.tsx must use document.startViewTransition");
  assert.ok(appSrc.includes("flushSync"), "App.tsx must wrap view transition state update with flushSync");
  assert.ok(appSrc.includes("!reducedMotion"), "View transition must be bypassed when reducedMotion is active");
  assert.ok(appSrc.includes("setCrossfade(isAccountSwitch && !reducedMotion)"), "Must support crossfade fallback");

  // Ensure accountRoutes includes login, register, verify-campus, etc.
  assert.ok(appSrc.includes("/login") && appSrc.includes("/register") && appSrc.includes("/verify-campus"),
    "accountRoutes must cover all account transition views"
  );
});

test("Non-landing routes strictly exclude GSAP and Lenis from their bundles", () => {
  const motionSrc = fs.readFileSync(path.join(WEB_ROOT, "src/lib/motion.ts"), "utf8");
  assert.ok(
    motionSrc.includes('import("./scrollMotion")'),
    "src/lib/motion.ts must dynamically import scrollMotion for landing-only loading"
  );

  const authSrc = fs.readFileSync(path.join(WEB_ROOT, "src/pages/AuthPages.tsx"), "utf8");
  assert.ok(!authSrc.includes("gsap") && !authSrc.includes("lenis"), "AuthPages must not import GSAP or Lenis");

  const discoverSrc = fs.readFileSync(path.join(WEB_ROOT, "src/pages/DiscoverPage.tsx"), "utf8");
  assert.ok(!discoverSrc.includes("gsap") && !discoverSrc.includes("lenis"), "DiscoverPage must not import GSAP or Lenis");

  const teamsSrc = fs.readFileSync(path.join(WEB_ROOT, "src/pages/TeamsPages.tsx"), "utf8");
  assert.ok(!teamsSrc.includes("gsap") && !teamsSrc.includes("lenis"), "TeamsPages must not import GSAP or Lenis");

  const eventSrc = fs.readFileSync(path.join(WEB_ROOT, "src/pages/EventPages.tsx"), "utf8");
  assert.ok(!eventSrc.includes("gsap") && !eventSrc.includes("lenis"), "EventPages must not import GSAP or Lenis");
});
