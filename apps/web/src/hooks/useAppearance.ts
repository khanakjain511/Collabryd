import { createContext, useContext } from "react";

export type Theme = "light" | "dark";
export type MotionMode = "full" | "reduced";

export interface AppearanceState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  motionMode: MotionMode;
  setMotionMode: (mode: MotionMode) => void;
  toggleMotion: () => void;
  reducedMotion: boolean;
}

export const AppearanceContext = createContext<AppearanceState>({
  theme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
  motionMode: "full",
  setMotionMode: () => {},
  toggleMotion: () => {},
  reducedMotion: false,
});

export const useAppearance = () => useContext(AppearanceContext);

export function readPreference(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function savePreference(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* Private browsing still works. */
  }
}
