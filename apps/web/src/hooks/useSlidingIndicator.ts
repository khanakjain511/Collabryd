import { useCallback, useLayoutEffect, useState } from "react";
import type React from "react";
import { useAppearance } from "./useAppearance";

export function useSlidingIndicator(
  navRef: React.RefObject<HTMLElement | null>,
  activeKey: string | number
): React.CSSProperties {
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({
    opacity: 0,
  });
  const { reducedMotion } = useAppearance();

  const update = useCallback(() => {
    const nav = navRef.current;
    if (!nav) return;

    // Find the currently active link/button inside the nav container
    const activeEl = nav.querySelector<HTMLElement>(
      '[aria-current="page"], [aria-current="location"], [data-active="true"]'
    );

    if (!activeEl) {
      setIndicatorStyle({ opacity: 0 });
      return;
    }

    const navRect = nav.getBoundingClientRect();
    const itemRect = activeEl.getBoundingClientRect();

    const left = itemRect.left - navRect.left;
    const top = itemRect.top - navRect.top;
    const width = itemRect.width;
    const height = itemRect.height;

    setIndicatorStyle({
      position: "absolute",
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`,
      opacity: 1,
      transition: reducedMotion
        ? "none"
        : "transform 240ms cubic-bezier(0.2, 0, 0, 1), width 240ms cubic-bezier(0.2, 0, 0, 1), left 240ms cubic-bezier(0.2, 0, 0, 1), opacity 150ms ease",
    });
  }, [navRef, reducedMotion]);

  useLayoutEffect(() => {
    update();
    const nav = navRef.current;
    if (!nav) return;

    window.addEventListener("resize", update, { passive: true });

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(update);
      ro.observe(nav);
      Array.from(nav.children).forEach((child) => {
        if (child instanceof HTMLElement && !child.hasAttribute("aria-hidden")) {
          ro?.observe(child);
        }
      });
    }

    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(update).catch(() => {});
    }

    // Measure after next animation frame to guarantee settled layout without shift
    const raf = requestAnimationFrame(update);

    return () => {
      window.removeEventListener("resize", update);
      ro?.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [activeKey, update, navRef]);

  return indicatorStyle;
}
