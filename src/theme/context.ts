import { createContext } from "react";
import type { ThemePreference } from "./themePreference";

export type ThemeContextValue = {
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => void;
  effectiveScheme: "light" | "dark";
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);
