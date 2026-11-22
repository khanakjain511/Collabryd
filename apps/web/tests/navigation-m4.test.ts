import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const WEB_ROOT = path.resolve(import.meta.dirname, "..");
const STAGGERED_MENU_PATH = path.join(WEB_ROOT, "src/components/StaggeredMenu.tsx");
const SLIDING_HOOK_PATH = path.join(WEB_ROOT, "src/hooks/useSlidingIndicator.ts");
const LAYOUT_PATH = path.join(WEB_ROOT, "src/components/Layout.tsx");

test("StaggeredMenu.tsx implements accessible, responsive sheet without legacy hardcoded colors", () => {
  assert.ok(fs.existsSync(STAGGERED_MENU_PATH), "StaggeredMenu.tsx must exist");
  const content = fs.readFileSync(STAGGERED_MENU_PATH, "utf8");

  // Optional isFixed
  assert.ok(content.includes("isFixed?: boolean;"), "isFixed must be optional");
  assert.ok(content.includes("isFixed = true"), "isFixed default value must be provided");

  // No hardcoded React Bits purple
  assert.ok(!content.includes("#B497CF"), "Must not use hardcoded purple #B497CF");
  assert.ok(!content.includes("#5227FF"), "Must not use hardcoded purple #5227FF");

  // Clamped font sizes for 360px responsiveness
  assert.ok(
    content.includes("clamp(") || content.includes("[clamp("),
    "Menu labels must use clamp() to prevent overflow on 360px viewports"
  );

  // Focus trap & modal accessibility
  assert.ok(content.includes('role="dialog"'), 'Must have role="dialog"');
  assert.ok(content.includes('aria-modal="true"'), 'Must have aria-modal="true"');
  assert.ok(content.includes("inert="), "Must set inert attribute when closed");

  // Outside click & escape & hashchange handlers
  assert.ok(content.includes('"pointerdown"'), 'Must handle pointerdown outside');
  assert.ok(content.includes('"Escape"'), 'Must handle Escape key');
  assert.ok(content.includes('"hashchange"'), 'Must close on route change (hashchange)');

  // Body scroll lock
  assert.ok(content.includes('document.body.style.overflow = "hidden"'), "Must lock body scroll while open");
  assert.ok(content.includes("document.body.style.overflow = prevOverflow"), "Must restore body scroll on close");

  // Reduced motion support
  assert.ok(content.includes("canAnimate"), "Must respect motion settings via canAnimate");
});

test("useSlidingIndicator measures active rect, handles resize, fonts, and zero layout shift", () => {
  assert.ok(fs.existsSync(SLIDING_HOOK_PATH), "useSlidingIndicator.ts must exist");
  const content = fs.readFileSync(SLIDING_HOOK_PATH, "utf8");

  // Measures rect
  assert.ok(content.includes("getBoundingClientRect"), "Must measure rect with getBoundingClientRect");
  assert.ok(content.includes("activeEl"), "Must find active element");

  // Recomputes on resize and font load
  assert.ok(content.includes('"resize"'), 'Must listen to window resize');
  assert.ok(content.includes("document.fonts?.ready"), "Must recompute when document fonts are ready");

  // Absolute positioning for zero layout shift
  assert.ok(content.includes('position: "absolute"'), "Indicator must be absolutely positioned to avoid layout shift");

  // Reduced motion support
  assert.ok(content.includes("reducedMotion"), "Must support reduced motion for instant transitions");
});

test("Layout.tsx integrates sliding indicator and signed-in mobile bottom tab bar", () => {
  assert.ok(fs.existsSync(LAYOUT_PATH), "Layout.tsx must exist");
  const content = fs.readFileSync(LAYOUT_PATH, "utf8");

  // Imports sliding indicator and StaggeredMenu
  assert.ok(content.includes("useSlidingIndicator"), "Layout.tsx must import useSlidingIndicator");
  assert.ok(content.includes("StaggeredMenu"), "Layout.tsx must import StaggeredMenu");

  // Desktop active indicators
  assert.ok(content.includes("useSlidingIndicator(publicNavRef"), "Public nav must use sliding indicator");
  assert.ok(content.includes("useSlidingIndicator(appNavRef"), "Workspace nav must use sliding indicator");

  // Signed-in mobile bottom tab bar
  assert.ok(content.includes('aria-label="Mobile Navigation"'), "Must render mobile navigation tab bar");
  assert.ok(content.includes("lg:hidden fixed bottom-0"), "Mobile bar must be fixed to bottom on mobile");
  assert.ok(content.includes("safe-area-inset-bottom"), "Must respect safe-area-inset-bottom");
  assert.ok(content.includes("min-h-[48px]"), "Touch targets must be >= 44px (using min-h-[48px])");
  assert.ok(content.includes('aria-current={isActive ? "page" : undefined}'), 'Must announce aria-current="page" on active tab');
});
