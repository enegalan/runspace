import { isTauri } from "./isTauri";

/**
 * Suppresses the native webview context menu (Reload, Inspect Element, etc.)
 * in desktop builds.
 *
 * Custom context menus must call `event.preventDefault()` on `contextmenu`
 * so this handler does not cancel them.
 */
export function suppressNativeContextMenu(): void {
  if (! isTauri()) {
    return;
  }

  document.addEventListener("contextmenu", (event) => {
    if (! event.defaultPrevented) {
      event.preventDefault();
    }
  });
}
