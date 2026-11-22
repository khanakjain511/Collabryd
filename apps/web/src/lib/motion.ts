export const motionStage = Number(
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_MOTION_STAGE) ?? 6,
);

export function loadMotion() {
  return import("./scrollMotion");
}

export function canAnimate(reducedMotion?: boolean): boolean {
  if (reducedMotion) return false;
  if (typeof window === "undefined") return false;
  const attr = document.documentElement.dataset.motion;
  if (attr === "reduced" || attr === "off") return false;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return false;
  return true;
}

export type LenisLike = {
  scrollTo: (
    target: HTMLElement | string,
    options?: { offset?: number; immediate?: boolean; duration?: number }
  ) => void;
};

export function scrollToSection(
  target: HTMLElement | string | null,
  lenis?: LenisLike | null,
  reducedMotion = false,
  offset?: number,
) {
  if (!target) return;
  const element =
    typeof target === "string"
      ? typeof document !== "undefined"
        ? document.getElementById(target.replace(/^#/, ""))
        : null
      : target;
  if (!element) return;

  const nav =
    typeof document !== "undefined"
      ? document.querySelector(".site-header")
      : null;
  const navHeight =
    offset ?? (nav ? Math.round(nav.getBoundingClientRect().height) : 70);

  const heading = element.querySelector<HTMLElement>("h1, h2, h3") ?? element;
  heading.setAttribute("tabindex", "-1");
  heading.focus({ preventScroll: true });

  if (lenis && !reducedMotion) {
    lenis.scrollTo(element, { offset: -navHeight });
  } else {
    element.scrollIntoView({
      behavior: reducedMotion ? "instant" : "smooth",
      block: "start",
    });
  }
}
