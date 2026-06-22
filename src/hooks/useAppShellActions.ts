import { useCallback } from "react";
import { useAppShortcuts } from "./useAppShortcuts";
import type { MenuAction } from "./useMenuActions";
import { useMenuActions } from "./useMenuActions";
import { useEditorTabsStore } from "../stores/editorTabsStore";
import { useTerminalStore } from "../stores/terminalStore";
import type { Environment } from "../core/types/environment";
import type { WorkspaceInfo } from "../core/types/workspace";

interface UseAppShellActionsOptions {
  workspace: WorkspaceInfo | null;
  selectedId: string | null;
  selectedEnvironment: Environment | undefined;
  runDisabled: boolean;
  isRunning: boolean;
  runOnSave: boolean;
  updateSettings: (partial: { layout: { terminalVisible?: boolean } }) => Promise<void>;
  createAndOpenFile: () => Promise<void>;
  createNewFolder: () => Promise<void>;
  handleRun: () => void;
  stop: () => Promise<void>;
  clear: () => void;
  handleToggleSidebar: () => void;
  handleToggleOutput: () => void;
  openSettings: () => void;
  setAboutOpen: (open: boolean) => void;
  setShortcutsOpen: (open: boolean) => void;
}

/**
 * This hook is used to handle the app shell actions.
 * @param options - The options for the hook.
 * @returns The app shell actions.
 */
export function useAppShellActions({
  workspace,
  selectedId,
  selectedEnvironment,
  runDisabled,
  isRunning,
  runOnSave,
  updateSettings,
  createAndOpenFile,
  createNewFolder,
  handleRun,
  stop,
  clear,
  handleToggleSidebar,
  handleToggleOutput,
  openSettings,
  setAboutOpen,
  setShortcutsOpen,
}: UseAppShellActionsOptions) {
  const handleSave = useCallback(
    (autoRun = false) => {
      if (!autoRun && runOnSave && !runDisabled && !isRunning) {
        handleRun();
        return;
      }
      void useEditorTabsStore.getState().saveActiveFile();
    },
    [runOnSave, runDisabled, isRunning, handleRun],
  );

  const handleNewTerminal = useCallback(() => {
    if (!workspace || !selectedId || !selectedEnvironment?.configured) {
      return;
    }
    void updateSettings({
      layout: { terminalVisible: true },
    });
    useTerminalStore.getState().addTab(workspace.id, selectedId);
  }, [workspace, selectedId, selectedEnvironment?.configured, updateSettings]);

  const handleMenuAction = useCallback(
    (action: MenuAction) => {
      switch (action) {
        case "about":
          setAboutOpen(true);
          break;
        case "keyboard_shortcuts":
          setShortcutsOpen(true);
          break;
        case "settings":
          openSettings();
          break;
        case "new_file":
          void createAndOpenFile();
          break;
        case "new_folder":
          void createNewFolder();
          break;
        case "save":
          handleSave();
          break;
        case "run":
          if (!runDisabled) {
            handleRun();
          }
          break;
        case "stop":
          stop();
          break;
        case "clear_output":
          clear();
          break;
        case "toggle_sidebar":
          handleToggleSidebar();
          break;
        case "toggle_output":
          handleToggleOutput();
          break;
        case "new_terminal":
          handleNewTerminal();
          break;
        default:
          break;
      }
    },
    [
      createAndOpenFile,
      createNewFolder,
      handleSave,
      handleRun,
      runDisabled,
      stop,
      clear,
      handleToggleSidebar,
      handleToggleOutput,
      handleNewTerminal,
      openSettings,
      setAboutOpen,
      setShortcutsOpen,
    ],
  );

  useMenuActions({ onAction: handleMenuAction });

  useAppShortcuts({
    onRun: handleRun,
    onStop: stop,
    onSave: handleSave,
    onNewFile: () => void createAndOpenFile(),
    onNewFolder: () => void createNewFolder(),
    onNewTerminal: handleNewTerminal,
    onOpenSettings: () => openSettings(),
    onToggleSidebar: handleToggleSidebar,
    onToggleOutput: handleToggleOutput,
    isRunning,
    runDisabled,
  });

  return { handleSave, handleNewTerminal };
}
