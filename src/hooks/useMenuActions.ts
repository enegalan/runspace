import { listen } from "@tauri-apps/api/event";
import { useEffect } from "react";
import { isTauri } from "../core/platform/isTauri";

export type MenuAction =
  | "about"
  | "keyboard_shortcuts"
  | "settings"
  | "new_file"
  | "new_folder"
  | "save"
  | "run"
  | "stop"
  | "clear_output"
  | "toggle_sidebar"
  | "toggle_output"
  | "new_terminal";

interface MenuActionHandlers {
  onAction: (action: MenuAction) => void;
}

export function useMenuActions({ onAction }: MenuActionHandlers) {
  useEffect(() => {
    if (! isTauri()) {
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
