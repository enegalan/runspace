import { useCallback, useMemo, useRef, useState, type CSSProperties } from "react";
import { getRunGuardian } from "../../core/execution/runGuardian";
import { useExecution } from "../../hooks/useExecution";
import { useAppBootstrap } from "../../hooks/useAppBootstrap";
import { useAppShellActions } from "../../hooks/useAppShellActions";
import { useNewFile } from "../../hooks/useNewFile";
import { useNewFolder } from "../../hooks/useNewFolder";
import { useOnboardingVisibility } from "../../hooks/useOnboardingVisibility";
import { usePanelLayoutHandlers } from "../../hooks/usePanelLayoutHandlers";
import { useRunOnTabChange } from "../../hooks/useRunOnTabChange";
import { isTauri } from "../../core/platform/isTauri";
import { appShellDesktopClass, isMacOS } from "../../core/platform/windowChrome";
import { EditorTabs } from "../editor/EditorTabs";
import { useEditorTabsStore } from "../../stores/editorTabsStore";
import { useEnvironmentStore } from "../../stores/environmentStore";
import { useSettingsStore, getAppSettings } from "../../stores/settingsStore";
import { useSettingsUiStore } from "../../stores/settingsUiStore";
import { useWorkspaceStore } from "../../stores/workspaceStore";
import { AboutDialog } from "../about/AboutDialog";
import { KeyboardShortcutsDialog } from "../about/KeyboardShortcutsDialog";
import { OutputPanel } from "../output/OutputPanel";
import { SettingsPanel } from "../settings/SettingsPanel";
import { ActivityBar } from "./ActivityBar";
import { EditorArea } from "./EditorArea";
import { Sidebar } from "./Sidebar";
import { StatusBar } from "./StatusBar";
import { AppDialogs } from "../ui/AppDialogs";
import { TerminalPanel } from "../terminal/TerminalPanel";
import { WelcomeScreen } from "../welcome/WelcomeScreen";
import { AppLoadingScreen } from "./AppLoadingScreen";

/**
 * The AppShell component.
 * @returns The AppShell component.
 */
export function AppShell() {
  const workspace = useWorkspaceStore((state) => state.workspace);
  const mainRowRef = useRef<HTMLDivElement>(null);

  const { appReady } = useAppBootstrap();
  const { showWelcome } = useOnboardingVisibility();

  const tabsLoaded = useEditorTabsStore((state) => state.loaded);
  const activePath = useEditorTabsStore((state) => state.activePath);

  const environments = useEnvironmentStore((state) => state.environments);
  const selectedId = useEnvironmentStore((state) => state.selectedId);
  const layoutSettings = useSettingsStore((state) => state.settings.layout);
  const executionSettings = useSettingsStore((state) => state.settings.execution);
  const updateSettings = useSettingsStore((state) => state.update);

  const [aboutOpen, setAboutOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const settingsOpen = useSettingsUiStore((state) => state.open);
  const openSettings = useSettingsUiStore((state) => state.openSettings);
  const closeSettings = useSettingsUiStore((state) => state.closeSettings);

  const { createAndOpenFile } = useNewFile();
  const { createNewFolder } = useNewFolder();

  const {
    stdout,
    stderr,
    status,
    phase,
    exitCode,
    timedOut,
    error,
    lastRunDurationMs,
    run,
    stop,
    clear,
  } = useExecution();

  const selectedEnvironment = useMemo(
    () => environments.find((env) => env.definition.id === selectedId),
    [environments, selectedId],
  );

  const runGuardian = useMemo(
    () =>
      getRunGuardian({
        workspace,
        environmentId: selectedId,
        selectedEnvironment,
        activePath,
      }),
    [workspace, selectedEnvironment, activePath, selectedId],
  );
  const runDisabled = runGuardian.disabled;
  const runDisabledReason = runGuardian.disabled ? runGuardian.reason : undefined;

  const isRunning = status === "running";

  const handleRun = useCallback(() => {
    void (async () => {
      const guardian = getRunGuardian({
        workspace: useWorkspaceStore.getState().workspace,
        environmentId: useEnvironmentStore.getState().selectedId,
        selectedEnvironment: useEnvironmentStore
          .getState()
          .environments.find(
            (env) => env.definition.id === useEnvironmentStore.getState().selectedId,
          ),
        activePath: useEditorTabsStore.getState().activePath,
      });
      if (guardian.disabled) {
        return;
      }

      const { environmentId, workspace: workspaceState, filePath } = guardian.snapshot;

      await useEditorTabsStore.getState().saveActiveFile();
      if (
        useWorkspaceStore.getState().workspace?.id !== workspaceState.id ||
        useEnvironmentStore.getState().selectedId !== environmentId ||
        useEditorTabsStore.getState().activePath !== filePath
      ) {
        return;
      }

      const settings = getAppSettings().execution;
      await run({
        environmentId,
        file: filePath,
        timeoutSecs: settings.runTimeoutSecs,
        compileTimeoutSecs: settings.compileTimeoutSecs,
      });
    })();
  }, [run]);

  useRunOnTabChange({
    tabsLoaded,
    activePath,
    isRunning,
    runOnTabChange: executionSettings.runOnTabChange,
    runDisabled,
    handleRun,
    stop,
    clear,
  });

  const {
    previewSidebarWidth,
    previewOutputWidth,
    handleSidebarWidthChange,
    handleOutputWidthChange,
    handleTerminalHeightChange,
    handleToggleTerminal,
    handleToggleSidebar,
    handleToggleOutput,
  } = usePanelLayoutHandlers({
    mainRowRef,
    layoutSettings,
    updateSettings,
  });

  const { handleSave } = useAppShellActions({
    workspace,
    selectedId,
    selectedEnvironment,
    runDisabled,
    isRunning,
    runOnSave: executionSettings.runOnSave,
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
  });

  if (!appReady) {
    return (
      <div
        className={`app-shell app-shell--loading${appShellDesktopClass()}`}
        data-testid="app-shell"
      >
        {isTauri() && (
          <div className="app-loading__titlebar" data-tauri-drag-region aria-hidden="true" />
        )}
        <AppLoadingScreen />
        <AppDialogs />
      </div>
    );
  }

  if (showWelcome) {
    return (
      <div
        className={`app-shell app-shell--welcome${appShellDesktopClass()}`}
        data-testid="app-shell"
      >
        <WelcomeScreen />
        <AppDialogs />
      </div>
    );
  }

  const mainRowClass = [
    "main-row",
    isTauri() ? "main-row--desktop" : "",
    !layoutSettings.sidebarVisible ? "main-row--sidebar-hidden" : "",
    !layoutSettings.outputVisible ? "main-row--output-hidden" : "",
    !layoutSettings.terminalVisible ? "main-row--terminal-hidden" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const mainRowStyle = {
    "--rs-sidebar-width": `${layoutSettings.sidebarWidth}px`,
    "--rs-output-width": `${layoutSettings.outputWidth}px`,
  } as CSSProperties;

  return (
    <div className={`app-shell${appShellDesktopClass()}`} data-testid="app-shell">
      <div className={mainRowClass} ref={mainRowRef} style={mainRowStyle}>
        {isTauri() && isMacOS() && (
          <div className="traffic-light-zone" data-tauri-drag-region aria-hidden="true" />
        )}
        {isTauri() && layoutSettings.sidebarVisible && (
          <div className="sidebar-titlebar-zone" data-tauri-drag-region aria-hidden="true" />
        )}
        <ActivityBar
          status={status}
          runDisabled={runDisabled}
          runDisabledReason={runDisabledReason}
          terminalVisible={layoutSettings.terminalVisible}
          onRun={handleRun}
          onStop={stop}
          onToggleTerminal={handleToggleTerminal}
          onOpenSettings={() => openSettings()}
        />
        {layoutSettings.sidebarVisible && (
          <Sidebar
            width={layoutSettings.sidebarWidth}
            onWidthChange={previewSidebarWidth}
            onWidthCommit={handleSidebarWidthChange}
          />
        )}
        <div className="editor-column">
          {workspace && <EditorTabs inTitlebar={isTauri()} />}
          {!workspace && isTauri() && (
            <div className="editor-titlebar-zone" data-tauri-drag-region aria-hidden="true" />
          )}
          <EditorArea onSave={handleSave} />
          {layoutSettings.terminalVisible && (
            <TerminalPanel
              height={layoutSettings.terminalHeight}
              onHeightChange={handleTerminalHeightChange}
              workspaceId={workspace?.id}
              environmentId={selectedId ?? undefined}
              configured={Boolean(selectedEnvironment?.configured)}
              disabledReason={runDisabledReason}
            />
          )}
        </div>
        {layoutSettings.outputVisible && (
          <OutputPanel
            stdout={stdout}
            stderr={stderr}
            status={status}
            phase={phase}
            timedOut={timedOut}
            error={error}
            width={layoutSettings.outputWidth}
            onWidthChange={previewOutputWidth}
            onWidthCommit={handleOutputWidthChange}
            onClear={clear}
            autoScrollEnabled={executionSettings.autoScrollOutput}
          />
        )}
      </div>
      <StatusBar
        status={status}
        phase={phase}
        exitCode={exitCode}
        timedOut={timedOut}
        lastRunDurationMs={lastRunDurationMs}
      />
      <SettingsPanel open={settingsOpen} onClose={closeSettings} />
      <AboutDialog open={aboutOpen} onClose={() => setAboutOpen(false)} />
      <KeyboardShortcutsDialog open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      <AppDialogs />
    </div>
  );
}
