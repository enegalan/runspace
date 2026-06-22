/**
 * Checks if the current environment is a Tauri desktop app.
 * @returns `true` if the current environment is a Tauri desktop app, `false` otherwise.
 */
export function isTauri(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return "__TAURI_INTERNALS__" in window || "__TAURI__" in window;
}
