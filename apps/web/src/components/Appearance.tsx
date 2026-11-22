import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  AppearanceContext,
  readPreference,
  savePreference,
} from "../hooks/useAppearance";
import type { Theme } from "../hooks/useAppearance";

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = readPreference("collabyrd-theme");
    return saved === "dark" || saved === "light"
      ? saved
      : matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
  });
  const [paused, setPaused] = useState(
    () => readPreference("collabyrd-motion") === "off",
  );
  const [systemReduced, setSystemReduced] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const onPointer = () => {
      document.documentElement.dataset.input = "pointer";
    };
    const onKey = () => {
      document.documentElement.dataset.input = "keyboard";
    };
    document.addEventListener("pointerdown", onPointer, true);
    document.addEventListener("keydown", onKey, true);
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const color = matchMedia("(prefers-color-scheme: dark)");
    const onMotion = () => setSystemReduced(motion.matches);
    const onColor = () => {
      if (!readPreference("collabyrd-theme"))
        setTheme(color.matches ? "dark" : "light");
    };
    motion.addEventListener("change", onMotion);
    color.addEventListener("change", onColor);
    return () => {
      document.removeEventListener("pointerdown", onPointer, true);
      document.removeEventListener("keydown", onKey, true);
      motion.removeEventListener("change", onMotion);
      color.removeEventListener("change", onColor);
    };
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#101217" : "#f7f8fa");
  }, [theme]);
  const reducedMotion = paused || systemReduced;
  useEffect(() => {
    document.documentElement.dataset.motion = reducedMotion ? "off" : "on";
  }, [reducedMotion]);
  return (
    <AppearanceContext
      value={{
        theme,
        reducedMotion,
        toggleTheme: () =>
          setTheme((previous) => {
            const next = previous === "dark" ? "light" : "dark";
            savePreference("collabyrd-theme", next);
            return next;
          }),
        toggleMotion: () => {
          if (systemReduced) return;
          setPaused((previous) => {
            savePreference("collabyrd-motion", previous ? "on" : "off");
            return !previous;
          });
        },
      }}
    >
      {children}
    </AppearanceContext>
  );
}
