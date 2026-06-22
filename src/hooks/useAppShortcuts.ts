import { useEffect } from "react";
import { matchesShortcut } from "../core/constants/keyboardShortcuts";
import type { ShortcutActionId } from "../core/types/shortcuts";
import { useSettingsStore } from "../stores/settingsStore";

interface AppShortcutHandlers {
  onRun?: () => void;
  onStop?: () => void;
  onSave?: () => void;
  onNewFile?: () => void;
  onNewFolder?: () => void;
  onNewTerminal?: () => void;
  onOpenSettings?: () => void;
  onToggleSidebar?: () => void;
  onToggleOutput?: () => void;
  isRunning?: boolean;
  runDisabled?: boolean;
}

/**
 * The action handlers.
 * @returns The action handlers.
 */
const ACTION_HANDLERS: Record<ShortcutActionId, keyof AppShortcutHandlers> = {
  run: "onRun",
  stop: "onStop",
  save: "onSave",
  newFile: "onNewFile",
  newFolder: "onNewFolder",
  newTerminal: "onNewTerminal",
  openSettings: "onOpenSettings",
  toggleSidebar: "onToggleSidebar",
  toggleOutput: "onToggleOutput",
};

/**
 * This hook is used to handle the app shortcuts.
 * @param handlers - The handlers for the shortcuts.
 */
export function useAppShortcuts(handlers: AppShortcutHandlers) {
  const shortcuts = useSettingsStore((state) => state.settings.shortcuts);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      for (const [actionId, handlerKey] of Object.entries(ACTION_HANDLERS) as [
        ShortcutActionId,
        keyof AppShortcutHandlers,
      ][]) {
        const binding = shortcuts[actionId];
        if (!binding || !matchesShortcut(event, binding)) {
          continue;
        }

        if (actionId === "run" && (handlers.isRunning || handlers.runDisabled)) {
          return;
        }
        if (actionId === "stop" && !handlers.isRunning) {
          return;
        }

        const handler = handlers[handlerKey];
        if (typeof handler !== "function") {
          return;
        }

        event.preventDefault();
        handler();
        return;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handlers, shortcuts]);
}
