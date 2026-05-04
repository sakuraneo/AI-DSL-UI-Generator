export type ThemePreference = "light" | "dark" | "system";

const STORAGE_KEY = "dsl-ui-theme-preference";

export function getThemePreference(): ThemePreference {
  if (typeof window === "undefined") return "system";
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch {
    /* ignore */
  }
  return "system";
}

/** 写入本地并立刻应用到 `<html data-theme>` */
export function persistThemePreference(p: ThemePreference): void {
  try {
    localStorage.setItem(STORAGE_KEY, p);
  } catch {
    /* ignore */
  }
  applyDocumentTheme(p);
}

/** 根据偏好得到当前应为浅色还是深色（图表 / color-scheme） */
export function getEffectiveScheme(preference: ThemePreference): "light" | "dark" {
  if (preference === "light") return "light";
  if (preference === "dark") return "dark";
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/** 同步 DOM：data-theme + color-scheme，供 CSS 变量切换 */
export function applyDocumentTheme(preference: ThemePreference): void {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = preference;
  const scheme = getEffectiveScheme(preference);
  document.documentElement.style.setProperty("color-scheme", scheme);
}
