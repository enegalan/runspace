import { isTauri } from "./isTauri";

export function isMacOS(): boolean {
  return typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
}

export function isWindows(): boolean {
  return typeof navigator !== "undefined" && /Win/.test(navigator.platform);
}

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
