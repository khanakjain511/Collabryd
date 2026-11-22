import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const WEB_ROOT = path.resolve(import.meta.dirname, "..");
const SCROLL_EXPAND_PATH = path.join(WEB_ROOT, "src/components/ScrollExpand.tsx");
const SCROLL_REVEAL_PATH = path.join(WEB_ROOT, "src/components/ScrollReveal.tsx");
const HORIZONTAL_PATH = path.join(WEB_ROOT, "src/components/HorizontalScrollSection.tsx");
const FOOTER_PATH = path.join(WEB_ROOT, "src/components/CinematicFooter.tsx");
const LANDING_PATH = path.join(WEB_ROOT, "src/pages/LandingPage.tsx");

test("ScrollExpand.tsx satisfies all edge cases and performance requirements", () => {
  assert.ok(fs.existsSync(SCROLL_EXPAND_PATH), "ScrollExpand.tsx must exist");
  const content = fs.readFileSync(SCROLL_EXPAND_PATH, "utf8");

  // (a) overflow-x: clip
  assert.ok(content.includes("overflow-x-clip"), "Must use overflow-x-clip instead of overflow-x-hidden");

  // (b) real h1
  assert.ok(content.includes("<h1"), "Must render a real <h1> element");

  // (c) overlay children inert until ~68%
  assert.ok(content.includes("p >= 0.68"), "Overlay must become active only at progress >= 0.68");
  assert.ok(content.includes('setAttribute("inert"'), "Overlay must be inert before full expansion");

  // (d) primary CTA reachable without scrolling
  assert.ok(content.includes("restingCTA"), "Must accept and display restingCTA for immediate access");

  // (e) reduced motion directly renders expanded state
  assert.ok(content.includes("if (!allowMotion)"), "Must handle disabled/reduced motion");
  assert.ok(content.includes('frame.style.clipPath = "inset(0% 0% 0% 0% round 0px)"'), "Must render expanded frame on reduced motion");

  // (f) media specs
  assert.ok(content.includes('fetchPriority="high"'), "Must use fetchPriority high on hero image");
  assert.ok(content.includes("width={1536}"), "Must set explicit width on image");
  assert.ok(content.includes("height={1024}"), "Must set explicit height on image");

  // (g) contrast scrim
  assert.ok(content.includes("scrimRef"), "Must include contrast scrim layer for title and overlay text");
});

test("ScrollReveal.tsx supports plain strings, heading levels, font refresh, and reduced motion", () => {
  assert.ok(fs.existsSync(SCROLL_REVEAL_PATH), "ScrollReveal.tsx must exist");
  const content = fs.readFileSync(SCROLL_REVEAL_PATH, "utf8");

  // Valid heading levels via 'as' prop
  assert.ok(content.includes('as: Component = "h2"'), "Must support heading polymorphism via 'as' prop");

  // Plain string children
  assert.ok(content.includes("Children.toArray(children)"), "Must support string children conversion");

  // Font readiness refresh
  assert.ok(content.includes("document.fonts?.ready"), "Must refresh ScrollTrigger when fonts settle");
  assert.ok(content.includes("ScrollTrigger.refresh()"), "Must call ScrollTrigger.refresh()");

  // Reduced motion plain text fallback
  assert.ok(content.includes("if (!allowMotion)"), "Must fall back to plain text when motion is reduced/off");
});

test("Horizontal card stack preserves native scrolling, keyboard controls and motion cleanup", () => {
  const content = fs.readFileSync(HORIZONTAL_PATH, "utf8");
  assert.ok(content.includes('root.scrollTo('));
  assert.ok(content.includes('ArrowRight') && content.includes('ArrowLeft'));
  assert.ok(content.includes('onFocusCapture'));
  assert.ok(content.includes('data-reduced={reducedMotion'));
  assert.ok(content.includes('observer.disconnect()'));
  assert.ok(content.includes('cancelAnimationFrame(frame)'));
});

test("CinematicFooter.tsx implements theme-adaptive footer with curtain reveal guard", () => {
  assert.ok(fs.existsSync(FOOTER_PATH), "CinematicFooter.tsx must exist");
  const content = fs.readFileSync(FOOTER_PATH, "utf8");

  // Collabyrd content
  assert.ok(content.includes("Find a Team"), "Must include Collabyrd primary CTA");
  assert.ok(content.includes("COLLABYRD"), "Must include giant COLLABYRD wordmark");
  assert.ok(!content.includes("SOBERS"), "Must not include SOBERS");
  assert.ok(!content.includes("Volvox"), "Must not include Volvox");

  // Giant text overflow protection
  assert.ok(content.includes("clamp("), "Giant wordmark must use clamped font size to avoid overflow");

  // Curtain reveal gate: landing only + >= 768px + >= 600px + no reduced motion
  assert.ok(content.includes("window.innerWidth >= 768"), "Curtain reveal requires >= 768px");
  assert.ok(content.includes("window.innerHeight >= 600"), "Curtain reveal requires >= 600px");
  assert.ok(content.includes("!reducedMotion"), "Curtain reveal requires no reduced motion");

  // Fine pointer check for magnetic effect
  assert.ok(content.includes("(hover: hover) and (pointer: fine)"), "Magnetic effect requires fine pointer");
});

test("LandingPage.tsx follows specified sequence: hero -> manifesto -> cards -> preview -> events -> faq -> footer", () => {
  assert.ok(fs.existsSync(LANDING_PATH), "LandingPage.tsx must exist");
  const content = fs.readFileSync(LANDING_PATH, "utf8");

  const heroIndex = content.indexOf("<ScrollExpand");
  const manifestoIndex = content.indexOf('id="manifesto"');
  const howItWorksIndex = content.indexOf('id="how-it-works"');
  const eventsIndex = content.indexOf('id="campus-events"');
  const faqIndex = content.indexOf('id="faq"');

  assert.ok(heroIndex !== -1, "Hero must exist");
  assert.ok(manifestoIndex !== -1, "Manifesto must exist");
  assert.ok(howItWorksIndex !== -1, "How it works must exist");
  assert.ok(eventsIndex !== -1, "Campus events must exist");
  assert.ok(faqIndex !== -1, "FAQ must exist");

  assert.ok(heroIndex < manifestoIndex, "Hero must precede Manifesto");
  assert.ok(manifestoIndex < howItWorksIndex, "Manifesto must precede How It Works");
  assert.ok(howItWorksIndex < eventsIndex, "How It Works must precede Events");
  assert.ok(eventsIndex < faqIndex, "Events must precede FAQ");
});
