import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  AppearanceContext,
  readPreference,
  savePreference,
} from "../hooks/useAppearance";
import type { MotionMode, Theme } from "../hooks/useAppearance";

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = readPreference("collabyrd-theme");
    if (saved === "dark" || saved === "light") return saved;
    return typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  const [systemReduced, setSystemReduced] = useState(() => {
    return typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;
  });

  const [motionMode, setMotionModeState] = useState<MotionMode>(() => {
    const saved = readPreference("collabyrd-motion");
    if (saved === "reduced" || saved === "off") return "reduced";
    if (saved === "full" || saved === "on") return "full";
    return typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
      ? "reduced"
      : "full";
  });

  useEffect(() => {
    const onPointer = () => {
      document.documentElement.dataset.input = "pointer";
    };
    const onKey = () => {
      document.documentElement.dataset.input = "keyboard";
    };
    document.addEventListener("pointerdown", onPointer, true);
    document.addEventListener("keydown", onKey, true);

    const motionQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const onMotionChange = (event: MediaQueryListEvent) => {
      setSystemReduced(event.matches);
    };
    motionQuery?.addEventListener("change", onMotionChange);

    const schemeQuery = window.matchMedia?.("(prefers-color-scheme: dark)");
    const onSchemeChange = (event: MediaQueryListEvent) => {
      if (!readPreference("collabyrd-theme")) {
        setThemeState(event.matches ? "dark" : "light");
      }
    };
    schemeQuery?.addEventListener("change", onSchemeChange);

    return () => {
      document.removeEventListener("pointerdown", onPointer, true);
      document.removeEventListener("keydown", onKey, true);
      motionQuery?.removeEventListener("change", onMotionChange);
      schemeQuery?.removeEventListener("change", onSchemeChange);
    };
  }, []);

  const reducedMotion = systemReduced || motionMode === "reduced";

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#0c2420" : "#fffbf2");
  }, [theme]);

  useEffect(() => {
    document.documentElement.dataset.motion = reducedMotion ? "reduced" : "full";
  }, [reducedMotion]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    savePreference("collabyrd-theme", next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      savePreference("collabyrd-theme", next);
      return next;
    });
  }, []);

  const setMotionMode = useCallback((next: MotionMode) => {
    setMotionModeState(next);
    savePreference("collabyrd-motion", next);
  }, []);

  const toggleMotion = useCallback(() => {
    setMotionModeState((prev) => {
      const next: MotionMode = prev === "reduced" ? "full" : "reduced";
      savePreference("collabyrd-motion", next);
      return next;
    });
  }, []);

  return (
    <AppearanceContext
      value={{
        theme,
        setTheme,
        toggleTheme,
        motionMode,
        setMotionMode,
        toggleMotion,
        reducedMotion,
      }}
    >
      {children}
    </AppearanceContext>
  );
}
