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

export interface TerminalThemeColors {
  background: string;
  foreground: string;
  cursor: string;
  cursorAccent: string;
  selectionBackground: string;
}

const DEFAULT_TERMINAL_THEME: TerminalThemeColors = {
  background: "#1e1e1e",
  foreground: "#f2f3f5",
  cursor: "#f2f3f5",
  cursorAccent: "#1e1e1e",
  selectionBackground: "rgba(88, 101, 242, 0.35)",
};

export function readTerminalTheme(): TerminalThemeColors {
  if (typeof document === "undefined") {
    return DEFAULT_TERMINAL_THEME;
  }

  const styles = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) =>
    styles.getPropertyValue(name).trim() || fallback;

  return {
    background: read("--rs-terminal-bg", DEFAULT_TERMINAL_THEME.background),
    foreground: read("--rs-terminal-fg", DEFAULT_TERMINAL_THEME.foreground),
    cursor: read("--rs-terminal-cursor", DEFAULT_TERMINAL_THEME.cursor),
    cursorAccent: read(
      "--rs-terminal-cursor-accent",
      DEFAULT_TERMINAL_THEME.cursorAccent,
    ),
    selectionBackground: read(
      "--rs-terminal-selection",
      DEFAULT_TERMINAL_THEME.selectionBackground,
    ),
  };
}
