import { createContext, useContext } from "react";

export type Theme = "light" | "dark";
export const AppearanceContext = createContext({
  theme: "light" as Theme,
  reducedMotion: false,
  toggleTheme: () => {},
  toggleMotion: () => {},
});
export const useAppearance = () => useContext(AppearanceContext);

export function readPreference(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
export function savePreference(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* Private browsing still works. */
  }
}
