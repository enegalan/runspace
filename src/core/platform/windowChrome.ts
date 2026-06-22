import { isTauri } from "./isTauri";

/**
 * Checks if the current environment is macOS.
 * @returns `true` if the current environment is macOS, `false` otherwise.
 */
export function isMacOS(): boolean {
  return typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
}

/**
 * Checks if the current environment is Windows.
 * @returns `true` if the current environment is Windows, `false` otherwise.
 */
function isWindows(): boolean {
  return typeof navigator !== "undefined" && /Win/.test(navigator.platform);
}

/**
 * Gets the desktop class for the app shell.
 * @returns The desktop class for the app shell.
 */
export function appShellDesktopClass(): string {
  if (!isTauri()) {
    return "";
  }

  if (isMacOS()) {
    return " app-shell--desktop app-shell--macos";
  }

  if (isWindows()) {
    return " app-shell--desktop app-shell--windows";
  }

  return " app-shell--desktop";
}
