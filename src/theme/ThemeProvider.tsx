import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ThemeContext } from "./context";
import {
  applyDocumentTheme,
  getEffectiveScheme,
  getThemePreference,
  persistThemePreference,
} from "./themePreference";
import type { ThemePreference } from "./themePreference";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(() =>
    getThemePreference()
  );
  const [effectiveScheme, setEffectiveScheme] = useState<
    "light" | "dark"
  >(() => getEffectiveScheme(getThemePreference()));

  const setPreference = useCallback((p: ThemePreference) => {
    persistThemePreference(p);
    setPreferenceState(p);
    setEffectiveScheme(getEffectiveScheme(p));
  }, []);

  useEffect(() => {
    if (preference !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const bump = () => {
      applyDocumentTheme("system");
      setEffectiveScheme(getEffectiveScheme("system"));
    };
    mq.addEventListener("change", bump);
    return () => mq.removeEventListener("change", bump);
  }, [preference]);

  const value = useMemo(
    () => ({
      preference,
      setPreference,
      effectiveScheme,
    }),
    [preference, setPreference, effectiveScheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
