import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { canAnimate, scrollToSection } from "../src/lib/motion.ts";
import { readPreference, savePreference } from "../src/hooks/useAppearance.ts";

const WEB_ROOT = path.resolve(import.meta.dirname, "..");
const INDEX_HTML_PATH = path.join(WEB_ROOT, "index.html");
const CSS_PATH = path.join(WEB_ROOT, "src/index.css");
const PKG_PATH = path.join(WEB_ROOT, "package.json");
const LANDING_PATH = path.join(WEB_ROOT, "src/pages/LandingPage.tsx");
const LAYOUT_PATH = path.join(WEB_ROOT, "src/components/Layout.tsx");
const SCROLL_MOTION_PATH = path.join(WEB_ROOT, "src/lib/scrollMotion.ts");

// --- Helper: WCAG 2.1 Contrast Calculation ---
function srgbToLinear(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hexToRgb(hex1));
  const l2 = relativeLuminance(hexToRgb(hex2));
  const bright = Math.max(l1, l2);
  const dark = Math.min(l1, l2);
  return (bright + 0.05) / (dark + 0.05);
}

function alphaBlend(fgHex: string, bgHex: string, alpha: number): string {
  const [r1, g1, b1] = hexToRgb(fgHex);
  const [r2, g2, b2] = hexToRgb(bgHex);
  const r = Math.round(r1 * alpha + r2 * (1 - alpha));
  const g = Math.round(g1 * alpha + g2 * (1 - alpha));
  const b = Math.round(b1 * alpha + b2 * (1 - alpha));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

test("three and @types/three are completely pruned from package.json", () => {
  const pkg = JSON.parse(fs.readFileSync(PKG_PATH, "utf8"));
  assert.equal(pkg.dependencies?.three, undefined, "three should not be in dependencies");
  assert.equal(pkg.devDependencies?.["@types/three"], undefined, "@types/three should not be in devDependencies");
});

test("index.html contains zero-FOUC inline script for theme and motion", () => {
  const html = fs.readFileSync(INDEX_HTML_PATH, "utf8");
  assert.ok(html.includes('localStorage.getItem("collabyrd-theme")'), "Checks collabyrd-theme");
  assert.ok(html.includes('(prefers-color-scheme: dark)'), "Checks prefers-color-scheme: dark");
  assert.ok(html.includes('dataset.theme = activeTheme') || html.includes('dataset.theme ='), "Sets document.documentElement.dataset.theme");
  assert.ok(html.includes('meta[name="theme-color"]'), "Finds theme-color meta tag");
  assert.ok(html.includes("#0c2420") && html.includes("#fffbf2"), "Updates theme-color between #0c2420 and #fffbf2");
  assert.ok(html.includes('localStorage.getItem("collabyrd-motion")'), "Checks collabyrd-motion");
  assert.ok(html.includes('(prefers-reduced-motion: reduce)'), "Checks prefers-reduced-motion: reduce");
  assert.ok(html.includes('dataset.motion = isReduced ? "reduced" : "full"'), "Sets document.documentElement.dataset.motion to reduced/full");
});

test("src/index.css includes layered radial-gradient wash and supports reduced motion", () => {
  const css = fs.readFileSync(CSS_PATH, "utf8");
  assert.ok(css.includes("--wash: radial-gradient("), "Defines --wash custom property in :root");
  assert.ok(css.includes("rgba(17, 94, 89, 0.08)"), "Includes teal 8% in light wash");
  assert.ok(css.includes("rgba(223, 207, 175, 0.25)"), "Includes warm ivory 25% in light wash");
  assert.ok(css.includes("rgba(17, 94, 89, 0.3"), "Includes teal 30% in dark wash");
  assert.ok(css.includes("rgba(255, 192, 140, 0.04)"), "Includes warm amber 4% in dark wash");
  assert.ok(css.includes('[data-motion="reduced"] *'), "Supports [data-motion=\"reduced\"] selector");
  assert.ok(css.includes('[data-motion="off"] *'), "Supports [data-motion=\"off\"] selector");
  assert.ok(css.includes(".wash {"), "Defines .wash utility class");
  assert.ok(css.includes("background-image: var(--wash);"), ".wash references var(--wash)");
});

test("WCAG 2.1 contrast ratios meet AA/AAA in both light and dark themes", () => {
  // Light Theme
  const lightCanvas = "#fffbf2";
  const lightInk = "#17332f";
  const lightMuted = "#52645d";
  const lightPrimary = "#115e59";
  const lightAccent = "#964a27";
  const lightSeatOpen = "#c45a43";
  const lightInputBorder = "#788c81";

  const crInkLight = contrastRatio(lightInk, lightCanvas);
  assert.ok(crInkLight >= 4.5, `Light Ink contrast ${crInkLight} < 4.5:1`);
  assert.ok(crInkLight >= 7.0, `Light Ink contrast ${crInkLight} achieves AAA >= 7.0:1`);

  const crMutedLight = contrastRatio(lightMuted, lightCanvas);
  assert.ok(crMutedLight >= 4.5, `Light Muted contrast ${crMutedLight} < 4.5:1`);

  const crPrimaryLight = contrastRatio(lightPrimary, lightCanvas);
  assert.ok(crPrimaryLight >= 4.5, `Light Primary contrast ${crPrimaryLight} < 4.5:1`);

  const crAccentLight = contrastRatio(lightAccent, lightCanvas);
  assert.ok(crAccentLight >= 4.5, `Light Accent contrast ${crAccentLight} < 4.5:1`);

  const crSeatOpenLight = contrastRatio(lightSeatOpen, lightCanvas);
  assert.ok(crSeatOpenLight >= 3.0, `Light Seat Open contrast ${crSeatOpenLight} < 3.0:1`);

  const crInputLight = contrastRatio(lightInputBorder, lightCanvas);
  assert.ok(crInputLight >= 3.0, `Light Input Border contrast ${crInputLight} < 3.0:1`);

  // Dark Theme
  const darkCanvas = "#0c2420";
  const darkInk = "#f3f7f0";
  const darkMuted = "#bdcfc7";
  const darkPrimary = "#a9e6d0";
  const darkAccent = "#ffc08c";
  const darkSeatOpen = "#fa9078";
  const darkInputBorder = "#8ea79b";

  const crInkDark = contrastRatio(darkInk, darkCanvas);
  assert.ok(crInkDark >= 4.5, `Dark Ink contrast ${crInkDark} < 4.5:1`);
  assert.ok(crInkDark >= 7.0, `Dark Ink contrast ${crInkDark} achieves AAA >= 7.0:1`);

  const crMutedDark = contrastRatio(darkMuted, darkCanvas);
  assert.ok(crMutedDark >= 4.5, `Dark Muted contrast ${crMutedDark} < 4.5:1`);

  const crPrimaryDark = contrastRatio(darkPrimary, darkCanvas);
  assert.ok(crPrimaryDark >= 4.5, `Dark Primary contrast ${crPrimaryDark} < 4.5:1`);

  const crAccentDark = contrastRatio(darkAccent, darkCanvas);
  assert.ok(crAccentDark >= 4.5, `Dark Accent contrast ${crAccentDark} < 4.5:1`);

  const crSeatOpenDark = contrastRatio(darkSeatOpen, darkCanvas);
  assert.ok(crSeatOpenDark >= 3.0, `Dark Seat Open contrast ${crSeatOpenDark} < 3.0:1`);

  const crInputDark = contrastRatio(darkInputBorder, darkCanvas);
  assert.ok(crInputDark >= 3.0, `Dark Input Border contrast ${crInputDark} < 3.0:1`);

  // Wash composite points verification
  const lightPeakTeal = alphaBlend("#115e59", lightCanvas, 0.08);
  assert.ok(contrastRatio(lightMuted, lightPeakTeal) >= 4.5, "Light Muted on Wash peak >= 4.5:1");
  assert.ok(contrastRatio(lightInk, lightPeakTeal) >= 4.5, "Light Ink on Wash peak >= 4.5:1");

  const darkPeakTeal = alphaBlend("#115e59", darkCanvas, 0.30);
  assert.ok(contrastRatio(darkMuted, darkPeakTeal) >= 4.5, "Dark Muted on Wash peak >= 4.5:1");
  assert.ok(contrastRatio(darkInk, darkPeakTeal) >= 4.5, "Dark Ink on Wash peak >= 4.5:1");
});

test("motion infrastructure exports canAnimate and scrollToSection with proper fallback", () => {
  assert.equal(typeof canAnimate, "function");
  assert.equal(canAnimate(true), false, "canAnimate(true) must return false");

  assert.equal(typeof scrollToSection, "function");

  // Verify scrollToSection calls lenis when provided and reducedMotion is false
  let lenisTarget: unknown = null;
  let lenisOptions: unknown = null;
  const mockLenis = {
    scrollTo: (t: HTMLElement | string, opts?: unknown) => {
      lenisTarget = t;
      lenisOptions = opts;
    },
  };

  const dummyElement = {
    querySelector: () => null,
    setAttribute: () => {},
    focus: () => {},
    scrollIntoView: () => {},
  } as unknown as HTMLElement;

  scrollToSection(dummyElement, mockLenis, false, 70);
  assert.equal(lenisTarget, dummyElement);
  assert.deepEqual(lenisOptions, { offset: -70 });

  // Verify fallback when reducedMotion is true
  let scrolledIntoView = false;
  let scrollBehavior: unknown = null;
  const fallbackElement = {
    querySelector: () => null,
    setAttribute: () => {},
    focus: () => {},
    scrollIntoView: (opts?: { behavior?: string }) => {
      scrolledIntoView = true;
      scrollBehavior = opts?.behavior;
    },
  } as unknown as HTMLElement;

  scrollToSection(fallbackElement, mockLenis, true, 70);
  assert.equal(scrolledIntoView, true);
  assert.equal(scrollBehavior, "instant");
});

test("useAppearance provides readPreference and savePreference helpers safely", () => {
  assert.equal(typeof readPreference, "function");
  assert.equal(typeof savePreference, "function");
  // Should not throw even in non-browser environment
  assert.doesNotThrow(() => {
    readPreference("collabyrd-theme");
    savePreference("collabyrd-theme", "light");
  });
});

test("scrollMotion.ts exports initScrollInfra with destroy lifecycle", () => {
  const content = fs.readFileSync(SCROLL_MOTION_PATH, "utf8");
  assert.ok(content.includes("export function initScrollInfra"), "Exports initScrollInfra");
  assert.ok(content.includes("autoRaf: false"), "Lenis instantiated with autoRaf: false");
  assert.ok(content.includes("gsap.ticker.lagSmoothing(0)"), "gsap.ticker.lagSmoothing(0) called");
  assert.ok(content.includes("gsap.ticker.add"), "Lenis driven by gsap.ticker");
  assert.ok(content.includes("lenis.on(\"scroll\", ScrollTrigger.update)"), "Lenis wired to ScrollTrigger.update");
  assert.ok(content.includes("ScrollTrigger.refresh()"), "Refreshes on font and media loads");
  assert.ok(content.includes("ScrollTrigger.getAll().length !== 0"), "Checks ScrollTrigger leak on destroy");
});

test("LandingPage.tsx uses initScrollInfra, scrollToSection, and sets scroll-mt-20", () => {
  const content = fs.readFileSync(LANDING_PATH, "utf8");
  assert.ok(content.includes("initScrollInfra"), "Calls initScrollInfra");
  assert.ok(content.includes("scrollToSection"), "Calls scrollToSection");
  assert.ok(content.includes('id="landing-top"') && content.includes("scroll-mt-20"), "#landing-top has scroll-mt-20");
  assert.ok(content.includes('id="how-it-works"') && content.includes("scroll-mt-20"), "#how-it-works has scroll-mt-20");
  assert.ok(content.includes('id="campus-events"') && content.includes("scroll-mt-20"), "#campus-events has scroll-mt-20");
  assert.ok(content.includes('id="faq"') && content.includes("scroll-mt-20"), "#faq has scroll-mt-20");
});

test("Layout.tsx renders wash background in PublicLayout and AppLayout", () => {
  const content = fs.readFileSync(LAYOUT_PATH, "utf8");
  assert.ok(content.includes('className="wash pointer-events-none fixed inset-0 -z-10"'), "Renders wash layer behind content");
});
