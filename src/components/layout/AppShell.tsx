import { getCurrentWindow } from "@tauri-apps/api/window";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { waitForBackendReady } from "../../core/api/fetchBackend";
import {
  isOnboardingComplete,
  syncOnboardingFromSession,
} from "../../core/onboarding/onboardingState";
import { runspaceInvoke } from "../../core/api/runspaceInvoke";
import { flushSessionState } from "../../core/workspace/flushSession";
import { requireProjectName } from "../../core/workspace/promptProjectName";
import type { SessionData, WorkspaceInfo } from "../../core/types/workspace";
import type { EnvironmentId } from "../../core/types/environment";
import { useExecution } from "../../hooks/useExecution";
import { useAppShortcuts } from "../../hooks/useAppShortcuts";
import { useMenuActions } from "../../hooks/useMenuActions";
import {
  clampPanelSize,
  OUTPUT_WIDTH_MAX,
  OUTPUT_WIDTH_MIN,
  SIDEBAR_WIDTH_MAX,
  SIDEBAR_WIDTH_MIN,
} from "../../core/layout/panelLayout";
import { isTauri } from "../../core/platform/isTauri";
import { appShellDesktopClass, isMacOS } from "../../core/platform/windowChrome";
import { EditorTabs } from "../editor/EditorTabs";
import { useEditorTabsStore } from "../../stores/editorTabsStore";
import { useEnvironmentStore } from "../../stores/environmentStore";
import { useSettingsStore } from "../../stores/settingsStore";
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
import { WelcomeScreen } from "../welcome/WelcomeScreen";

export function AppShell() {
  const workspace = useWorkspaceStore((state) => state.workspace);
  const workspaceLoaded = useWorkspaceStore((state) => state.loaded);
  const onboardingRequired = useWorkspaceStore((state) => state.onboardingRequired);
  const onboardingComplete = useWorkspaceStore((state) => state.onboardingComplete);
  const createProject = useWorkspaceStore((state) => state.createProject);
  const bootstrapStarted = useRef(false);
  const hasEnteredMainShell = useRef(
    useWorkspaceStore.getState().onboardingComplete || isOnboardingComplete(),
  );

  const tabsLoaded = useEditorTabsStore((state) => state.loaded);
  const activePath = useEditorTabsStore((state) => state.activePath);
  const closeFile = useEditorTabsStore((state) => state.closeFile);
  const selectEnvironment = useEnvironmentStore((state) => state.select);

  const environments = useEnvironmentStore((state) => state.environments);
  const selectedId = useEnvironmentStore((state) => state.selectedId);
  const envLoaded = useEnvironmentStore((state) => state.loaded);
  const loadEnvironments = useEnvironmentStore((state) => state.load);
  const settingsLoaded = useSettingsStore((state) => state.loaded);
  const loadSettings = useSettingsStore((state) => state.load);
  const layoutSettings = useSettingsStore((state) => state.settings.layout);
  const executionSettings = useSettingsStore((state) => state.settings.execution);
  const updateSettings = useSettingsStore((state) => state.update);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [backendReady, setBackendReady] = useState(isTauri() && !import.meta.env.DEV);

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

  const runDisabled =
    !workspace || !selectedEnvironment?.configured || !activePath;
  const runDisabledReason = !workspace
    ? "Create a project to run code"
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
        await Promise.all([loadSettings(), loadEnvironments()]);
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
          storedRuntimeId &&
          environments.some((env) => env.definition.id === storedRuntimeId)
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
          const active = await runspaceInvoke<WorkspaceInfo | null>(
            "get_active_workspace",
          );
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
  }, [backendReady, loadEnvironments, loadSettings, selectEnvironment]);

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
    if (!selectedId || !workspace || !activePath) {
      return;
    }

    void (async () => {
      await useEditorTabsStore.getState().saveActiveFile();
      await run({
        environmentId: selectedId,
        entryFile: activePath,
        timeoutSecs: executionSettings.runTimeoutSecs,
        compileTimeoutSecs: executionSettings.compileTimeoutSecs,
      });
    })();
  }, [selectedId, workspace, activePath, run, executionSettings]);

  const handleSidebarWidthChange = useCallback(
    (width: number) => {
      void updateSettings({
        layout: {
          sidebarWidth: clampPanelSize(width, SIDEBAR_WIDTH_MIN, SIDEBAR_WIDTH_MAX),
        },
      });
    },
    [updateSettings],
  );

  const handleOutputWidthChange = useCallback(
    (width: number) => {
      void updateSettings({
        layout: {
          outputWidth: clampPanelSize(width, OUTPUT_WIDTH_MIN, OUTPUT_WIDTH_MAX),
        },
      });
    },
    [updateSettings],
  );

  const handleSave = useCallback(() => {
    void useEditorTabsStore.getState().saveActiveFile();
  }, []);

  const handleNewWorkspace = useCallback(async () => {
    if (!selectedId) {
      return;
    }
    const projectName = await requireProjectName("Name for the new project");
    if (projectName) {
      await createProject(selectedId, projectName);
    }
  }, [selectedId, createProject]);

  const handleMenuAction = useCallback(
    (action: string) => {
      switch (action) {
        case "new_workspace":
          void handleNewWorkspace();
          break;
        case "save":
          handleSave();
          break;
        case "close_tab":
          if (activePath) {
            void closeFile(activePath);
          }
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
        case "keyboard_shortcuts":
          setShortcutsOpen(true);
          break;
        case "about":
          setAboutOpen(true);
          break;
        default:
          break;
      }
    },
    [
      handleNewWorkspace,
      handleSave,
      activePath,
      closeFile,
      handleRun,
      runDisabled,
      stop,
      clear,
    ],
  );

  useMenuActions({ onAction: handleMenuAction });

  useAppShortcuts({
    onRun: handleRun,
    onStop: stop,
    onSave: handleSave,
    onNewWorkspace: () => void handleNewWorkspace(),
    onOpenSettings: () => setSettingsOpen(true),
    isRunning,
    runDisabled,
  });

  if (!backendReady || !workspaceLoaded || !envLoaded || !tabsLoaded || !settingsLoaded) {
    return (
      <div className="app-shell app-shell--loading" data-testid="app-shell">
        <div className="app-shell__loading">
          {!backendReady && !isTauri() ? "Starting backend..." : "Loading..."}
        </div>
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
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={`app-shell${appShellDesktopClass()}`}
      data-testid="app-shell"
    >
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
          onRun={handleRun}
          onStop={stop}
          onOpenSettings={() => setSettingsOpen(true)}
        />
        {layoutSettings.sidebarVisible && (
          <Sidebar
            width={layoutSettings.sidebarWidth}
            onWidthChange={handleSidebarWidthChange}
          />
        )}
        <div className="editor-column">
          {workspace && <EditorTabs inTitlebar={isTauri()} />}
          {!workspace && isTauri() && (
            <div className="editor-titlebar-zone" data-tauri-drag-region aria-hidden="true" />
          )}
          <EditorArea onRun={handleRun} onSave={handleSave} />
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
        environmentName={selectedEnvironment?.definition.name ?? "—"}
      />
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <AboutDialog open={aboutOpen} onClose={() => setAboutOpen(false)} />
      <KeyboardShortcutsDialog
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
      <AppDialogs />
    </div>
  );
}
