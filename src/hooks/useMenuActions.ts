import { listen } from "@tauri-apps/api/event";
import { useEffect } from "react";
import { isTauri } from "../core/platform/isTauri";

export type MenuAction =
  | "new_workspace"
  | "save"
  | "close_tab"
  | "run"
  | "stop"
  | "clear_output"
  | "welcome"
  | "keyboard_shortcuts"
  | "about";

interface MenuActionHandlers {
  onAction: (action: MenuAction) => void;
}

export function useMenuActions({ onAction }: MenuActionHandlers) {
  useEffect(() => {
    if (!isTauri()) {
      return;
    }

    let unlisten: (() => void) | undefined;

    void listen<MenuAction>("menu-action", (event) => {
      onAction(event.payload);
    }).then((fn) => {
      unlisten = fn;
    });

    return () => {
      unlisten?.();
    };
  }, [onAction]);
}
