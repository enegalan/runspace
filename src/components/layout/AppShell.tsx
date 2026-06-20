import { getCurrentWindow } from "@tauri-apps/api/window";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { waitForBackendReady } from "../../core/api/fetchBackend";
import {
  isOnboardingComplete,
  syncOnboardingFromSession,
} from "../../core/onboarding/onboardingState";
import { runspaceInvoke } from "../../core/api/runspaceInvoke";
import { flushSessionState } from "../../core/workspace/flushSession";
import type { SessionData, WorkspaceInfo } from "../../core/types/workspace";
import type { EnvironmentId } from "../../core/types/environment";
import { useExecution } from "../../hooks/useExecution";
import { useAppShortcuts } from "../../hooks/useAppShortcuts";
import type { MenuAction } from "../../hooks/useMenuActions";
import { useMenuActions } from "../../hooks/useMenuActions";
import { useNewFile } from "../../hooks/useNewFile";
import { useNewFolder } from "../../hooks/useNewFolder";
import { clamp } from "../../core/clamp";
import {
  OUTPUT_WIDTH_MAX,
  OUTPUT_WIDTH_MIN,
  SIDEBAR_WIDTH_MAX,
  SIDEBAR_WIDTH_MIN,
  TERMINAL_HEIGHT_MAX,
  TERMINAL_HEIGHT_MIN,
} from "../../core/layout/panelLayout";
import { isTauri } from "../../core/platform/isTauri";
import { appShellDesktopClass, isMacOS } from "../../core/platform/windowChrome";
import { EditorTabs } from "../editor/EditorTabs";
import { useEditorTabsStore } from "../../stores/editorTabsStore";
import { useEnvironmentStore } from "../../stores/environmentStore";
import { useSettingsStore, getAppSettings } from "../../stores/settingsStore";
import { useSettingsUiStore } from "../../stores/settingsUiStore";
import { useTerminalStore } from "../../stores/terminalStore";
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

export function AppShell() {
  const workspace = useWorkspaceStore((state) => state.workspace);
  const workspaceLoaded = useWorkspaceStore((state) => state.loaded);
  const onboardingRequired = useWorkspaceStore((state) => state.onboardingRequired);
  const onboardingComplete = useWorkspaceStore((state) => state.onboardingComplete);
  const bootstrapStarted = useRef(false);
  const tabChangeReadyRef = useRef(false);
  const prevActivePathRef = useRef<string | null>(null);
  const hasEnteredMainShell = useRef(
    useWorkspaceStore.getState().onboardingComplete || isOnboardingComplete(),
  );

  const tabsLoaded = useEditorTabsStore((state) => state.loaded);
  const activePath = useEditorTabsStore((state) => state.activePath);
  const selectEnvironment = useEnvironmentStore((state) => state.select);

  const environments = useEnvironmentStore((state) => state.environments);
  const selectedId = useEnvironmentStore((state) => state.selectedId);
  const envLoaded = useEnvironmentStore((state) => state.loaded);
  const loadEnvironments = useEnvironmentStore((state) => state.load);
  const layoutSettings = useSettingsStore((state) => state.settings.layout);
  const executionSettings = useSettingsStore((state) => state.settings.execution);
  const updateSettings = useSettingsStore((state) => state.update);

  const [aboutOpen, setAboutOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const settingsOpen = useSettingsUiStore((state) => state.open);
  const openSettings = useSettingsUiStore((state) => state.openSettings);
  const closeSettings = useSettingsUiStore((state) => state.closeSettings);
  const [backendReady, setBackendReady] = useState(isTauri() && !import.meta.env.DEV);

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

  const runDisabled = !workspace || !selectedEnvironment?.configured || !activePath;
  const runDisabledReason = !workspace
    ? "Create a workspace to run code"
    : !selectedEnvironment
      ? "Add an environment in Settings"
      : !selectedEnvironment.configured
        ? "Configure in Settings → Environments"
        : !activePath
          ? "Open a file to run"
          : undefined;

  const isRunning = status === "running";

  useEffect(() => {
    let cancelled = false;

    void waitForBackendReady()
      .then(() => {
        if (!cancelled) {
          setBackendReady(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setBackendReady(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (workspace !== null || onboardingComplete || isOnboardingComplete()) {
      hasEnteredMainShell.current = true;
    }
  }, [workspace, onboardingComplete]);

  useEffect(() => {
    if (!backendReady || bootstrapStarted.current) {
      return;
    }
    bootstrapStarted.current = true;

    let cancelled = false;

    const bootstrap = async () => {
      try {
        await loadEnvironments();
        if (cancelled) {
          return;
        }

        const session = await runspaceInvoke<SessionData>("read_session");
        const onboardingComplete = syncOnboardingFromSession(session);
        useWorkspaceStore.setState({
          onboardingComplete,
          onboardingRequired: onboardingComplete
            ? false
            : useWorkspaceStore.getState().onboardingRequired,
        });
        const storedRuntimeId = session.last_runtime_id;
        const { selectedId, environments } = useEnvironmentStore.getState();
        const runtimeId =
          storedRuntimeId && environments.some((env) => env.definition.id === storedRuntimeId)
            ? (storedRuntimeId as EnvironmentId)
            : selectedId;

        if (runtimeId && storedRuntimeId === runtimeId && storedRuntimeId !== selectedId) {
          await selectEnvironment(runtimeId);
        }

        await useWorkspaceStore.getState().initialize(runtimeId);
      } catch (error) {
        console.error("App bootstrap failed:", error);
        try {
          const runtimeId = useEnvironmentStore.getState().selectedId;
          const active = await runspaceInvoke<WorkspaceInfo | null>("get_active_workspace");
          if (active) {
            useWorkspaceStore.setState({ workspace: active, loaded: true });
            if (runtimeId) {
              await useWorkspaceStore.getState().loadWorkspaces(runtimeId);
              await useWorkspaceStore.getState().refreshFiles();
            }
          } else {
            useWorkspaceStore.setState({ loaded: true });
          }
        } catch (recoveryError) {
          console.error("Workspace recovery failed:", recoveryError);
          useWorkspaceStore.setState({ loaded: true });
        }
        useEnvironmentStore.setState({ loaded: true });
      } finally {
        if (!cancelled) {
          useEditorTabsStore.setState({ loaded: true });
        }
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [backendReady, loadEnvironments, selectEnvironment]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        void flushSessionState();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  useEffect(() => {
    if (!isTauri()) {
      return;
    }

    let unlisten: (() => void) | undefined;

    void getCurrentWindow()
      .onCloseRequested((event) => {
        event.preventDefault();
        void flushSessionState().finally(() => {
          void getCurrentWindow().destroy();
        });
      })
      .then((fn) => {
        unlisten = fn;
      });

    return () => {
      unlisten?.();
    };
  }, []);

  const handleRun = useCallback(() => {
    void (async () => {
      const workspaceState = useWorkspaceStore.getState().workspace;
      const environmentId = useEnvironmentStore.getState().selectedId;
      const filePath = useEditorTabsStore.getState().activePath;
      if (!environmentId || !workspaceState || !filePath) {
        return;
      }

      const workspaceId = workspaceState.id;
      await useEditorTabsStore.getState().saveActiveFile();
      if (
        useWorkspaceStore.getState().workspace?.id !== workspaceId ||
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

  useEffect(() => {
    if (!tabsLoaded) {
      return;
    }
    if (!tabChangeReadyRef.current) {
      tabChangeReadyRef.current = true;
      prevActivePathRef.current = activePath;
      return;
    }
    if (prevActivePathRef.current === activePath) {
      return;
    }
    prevActivePathRef.current = activePath;
    void (async () => {
      if (isRunning) {
        await stop();
      }
      clear();
      if (executionSettings.runOnTabChange && activePath && !runDisabled) {
        handleRun();
      }
    })();
  }, [
    tabsLoaded,
    activePath,
    clear,
    stop,
    isRunning,
    executionSettings.runOnTabChange,
    runDisabled,
    handleRun,
  ]);

  const handleSidebarWidthChange = useCallback(
    (width: number) => {
      void updateSettings({
        layout: {
          sidebarWidth: clamp(width, SIDEBAR_WIDTH_MIN, SIDEBAR_WIDTH_MAX),
        },
      });
    },
    [updateSettings],
  );

  const handleOutputWidthChange = useCallback(
    (width: number) => {
      void updateSettings({
        layout: {
          outputWidth: clamp(width, OUTPUT_WIDTH_MIN, OUTPUT_WIDTH_MAX),
        },
      });
    },
    [updateSettings],
  );

  const handleTerminalHeightChange = useCallback(
    (height: number) => {
      void updateSettings({
        layout: {
          terminalHeight: clamp(height, TERMINAL_HEIGHT_MIN, TERMINAL_HEIGHT_MAX),
        },
      });
    },
    [updateSettings],
  );

  const handleToggleTerminal = useCallback(() => {
    void updateSettings({
      layout: { terminalVisible: !layoutSettings.terminalVisible },
    });
  }, [layoutSettings.terminalVisible, updateSettings]);

  const handleToggleSidebar = useCallback(() => {
    void updateSettings({
      layout: { sidebarVisible: !layoutSettings.sidebarVisible },
    });
  }, [layoutSettings.sidebarVisible, updateSettings]);

  const handleToggleOutput = useCallback(() => {
    void updateSettings({
      layout: { outputVisible: !layoutSettings.outputVisible },
    });
  }, [layoutSettings.outputVisible, updateSettings]);

  const handleSave = useCallback(
    (autoRun = false) => {
      if (!autoRun && executionSettings.runOnSave && !runDisabled && !isRunning) {
        handleRun();
        return;
      }
      void useEditorTabsStore.getState().saveActiveFile();
    },
    [executionSettings.runOnSave, runDisabled, isRunning, handleRun],
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

  if (!backendReady || !workspaceLoaded || !envLoaded || !tabsLoaded) {
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

  const showWelcome =
    onboardingRequired &&
    !onboardingComplete &&
    !isOnboardingComplete() &&
    !hasEnteredMainShell.current;

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

  return (
    <div className={`app-shell${appShellDesktopClass()}`} data-testid="app-shell">
      <div className={mainRowClass}>
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
          <Sidebar width={layoutSettings.sidebarWidth} onWidthChange={handleSidebarWidthChange} />
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
            onWidthChange={handleOutputWidthChange}
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
