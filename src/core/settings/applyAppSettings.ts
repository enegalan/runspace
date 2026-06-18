import { editorFontFamilyCss } from "../constants/settingsDefaults";
import type { AppSettings, ThemeMode } from "../types/settings";

const BASE_FONT_SIZES = {
  xs: 11,
  sm: 12,
  md: 14,
  lg: 16,
};

/**
 * Resolves the theme based on the settings.
 * @param theme - The theme mode.
 * @returns The resolved theme.
 */
function resolveTheme(theme: ThemeMode): "dark" | "light" {
  if (theme === "system" && typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return theme === "light" ? "light" : "dark";
}

let systemThemeListener: (() => void) | null = null;

let systemThemeMedia: MediaQueryList | null = null;

/**
 * Unbinds the system theme listener from the document element.
 */
function unbindSystemThemeListener() {
  if (systemThemeMedia && systemThemeListener) {
    systemThemeMedia.removeEventListener("change", systemThemeListener);
  }
  systemThemeMedia = null;
  systemThemeListener = null;
}

/**
 * Binds the system theme listener to the document element.
 * @param settings - The application settings.
 */
function bindSystemThemeListener(settings: AppSettings) {
  if (typeof window === "undefined") {
    return;
  }
  if (settings.appearance.theme !== "system") {
    unbindSystemThemeListener();
    return;
  }

  if (systemThemeListener) {
    return;
  }

  const media = window.matchMedia("(prefers-color-scheme: dark)");
  systemThemeMedia = media;
  systemThemeListener = () => {
    document.documentElement.dataset.theme = resolveTheme("system");
  };
  media.addEventListener("change", systemThemeListener);
}

/**
 * Applies the application settings to the document element.
 * @param settings - The application settings.
 */
export function applyAppSettings(settings: AppSettings): void {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.dataset.theme = resolveTheme(settings.appearance.theme);
  document.documentElement.dataset.density = settings.appearance.uiDensity;

  const scale = settings.appearance.editorFontSize / 13;
  for (const [token, baseSize] of Object.entries(BASE_FONT_SIZES)) {
    document.documentElement.style.setProperty(`--rs-font-size-${token}`, `${Math.round(baseSize * scale)}px`);
  }
  document.documentElement.style.setProperty(
    "--rs-font-mono",
    editorFontFamilyCss(settings.appearance.editorFontFamily),
  );

  bindSystemThemeListener(settings);
}

/**
 * Gets the Monaco theme ID based on the theme mode.
 * @param theme - The theme mode.
 * @returns The Monaco theme ID.
 */
export function getMonacoThemeId(theme: ThemeMode): string {
  return resolveTheme(theme) === "light" ? "runspace-light" : "runspace-dark";
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

/**
 * Reads the terminal theme from the document element.
 * @returns The terminal theme colors.
 */
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
