import { useEffect } from "react";

interface AppShortcutHandlers {
  onRun?: () => void;
  onStop?: () => void;
  onSave?: () => void;
  onNewWorkspace?: () => void;
  onOpenSettings?: () => void;
  isRunning?: boolean;
  runDisabled?: boolean;
}

export function useAppShortcuts({
  onRun,
  onStop,
  onSave,
  onNewWorkspace,
  onOpenSettings,
  isRunning = false,
  runDisabled = false,
}: AppShortcutHandlers) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey;
      if (!mod) {
        return;
      }

      const key = event.key.toLowerCase();

      if (key === "enter" && onRun && !isRunning && !runDisabled) {
        event.preventDefault();
        onRun();
        return;
      }

      if (key === "." && onStop && isRunning) {
        event.preventDefault();
        onStop();
        return;
      }

      if (key === "s" && onSave) {
        event.preventDefault();
        onSave();
        return;
      }

      if (key === "n" && onNewWorkspace) {
        event.preventDefault();
        onNewWorkspace();
        return;
      }

      if (key === "," && onOpenSettings) {
        event.preventDefault();
        onOpenSettings();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    onRun,
    onStop,
    onSave,
    onNewWorkspace,
    onOpenSettings,
    isRunning,
    runDisabled,
  ]);
}
