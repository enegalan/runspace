import type { AppSettings, ThemeMode } from "../types/settings";

function resolveTheme(theme: ThemeMode): "dark" | "light" {
  if (theme === "system" && typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return theme === "light" ? "light" : "dark";
}

let systemThemeListener: (() => void) | null = null;

function bindSystemThemeListener(settings: AppSettings) {
  if (typeof window === "undefined" || settings.appearance.theme !== "system") {
    return;
  }

  if (systemThemeListener) {
    return;
  }

  const media = window.matchMedia("(prefers-color-scheme: dark)");
  systemThemeListener = () => {
    document.documentElement.dataset.theme = resolveTheme("system");
  };
  media.addEventListener("change", systemThemeListener);
}

export function applyAppSettings(settings: AppSettings): void {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.dataset.theme = resolveTheme(settings.appearance.theme);
  document.documentElement.dataset.density = settings.appearance.uiDensity;
  bindSystemThemeListener(settings);
}

export function getResolvedTheme(settings: AppSettings): "dark" | "light" {
  return resolveTheme(settings.appearance.theme);
}

export function getMonacoThemeId(settings: AppSettings): string {
  return getResolvedTheme(settings) === "light" ? "runspace-light" : "runspace-dark";
}
