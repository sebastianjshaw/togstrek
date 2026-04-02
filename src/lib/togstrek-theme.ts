export type TogstrekThemePreference = "light" | "dark" | "system";

export const TOGSTREK_THEME_STORAGE_KEY = "togstrek-theme";

export function isTogstrekThemePreference(
  value: unknown,
): value is TogstrekThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

export function getTogstrekThemeFromDocument(): TogstrekThemePreference {
  if (typeof document === "undefined") return "system";
  const raw = document.documentElement.getAttribute("data-theme");
  if (raw === "dark") return "dark";
  if (raw === "light") return "light";
  return "system";
}

