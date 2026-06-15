import { useEffect } from "react";

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

export function useAppShortcuts({
  onRun,
  onStop,
  onSave,
  onNewFile,
  onNewFolder,
  onNewTerminal,
  onOpenSettings,
  onToggleSidebar,
  onToggleOutput,
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
      const shift = event.shiftKey;

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

      if (key === "n" && shift && onNewFolder) {
        event.preventDefault();
        onNewFolder();
        return;
      }

      if (key === "n" && onNewFile) {
        event.preventDefault();
        onNewFile();
        return;
      }

      if (key === "t" && shift && onNewTerminal) {
        event.preventDefault();
        onNewTerminal();
        return;
      }

      if (key === "," && onOpenSettings) {
        event.preventDefault();
        onOpenSettings();
        return;
      }

      if (key === "b" && onToggleSidebar) {
        event.preventDefault();
        onToggleSidebar();
        return;
      }

      if (key === "j" && onToggleOutput) {
        event.preventDefault();
        onToggleOutput();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    onRun,
    onStop,
    onSave,
    onNewFile,
    onNewFolder,
    onNewTerminal,
    onOpenSettings,
    onToggleSidebar,
    onToggleOutput,
    isRunning,
    runDisabled,
  ]);
}
