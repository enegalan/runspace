import { getCurrentWindow } from "@tauri-apps/api/window";
import { useEffect, useMemo, useState } from "react";
import { waitForBackendReady } from "../../core/api/fetchBackend";
import { runspaceInvoke } from "../../core/api/runspaceInvoke";
import { flushSessionState } from "../../core/workspace/flushSession";
import type { SessionData, WorkspaceInfo } from "../../core/types/workspace";
import type { EnvironmentId } from "../../core/types/environment";
import { useExecution } from "../../hooks/useExecution";
import { isTauri } from "../../core/platform/isTauri";
import { useEditorTabsStore } from "../../stores/editorTabsStore";
import { useEnvironmentStore } from "../../stores/environmentStore";
import { useWorkspaceStore } from "../../stores/workspaceStore";
import { OutputPanel } from "../output/OutputPanel";
import { SettingsPanel } from "../settings/SettingsPanel";
import { EditorArea } from "./EditorArea";
import { Sidebar } from "./Sidebar";
import { StatusBar } from "./StatusBar";
import { Toolbar } from "./Toolbar";
import { AppDialogs } from "../ui/AppDialogs";

export function AppShell() {
  const workspace = useWorkspaceStore((state) => state.workspace);
  const workspaceLoaded = useWorkspaceStore((state) => state.loaded);

  const tabsLoaded = useEditorTabsStore((state) => state.loaded);
  const activePath = useEditorTabsStore((state) => state.activePath);
  const selectEnvironment = useEnvironmentStore((state) => state.select);

  const environments = useEnvironmentStore((state) => state.environments);
  const selectedId = useEnvironmentStore((state) => state.selectedId);
  const envLoaded = useEnvironmentStore((state) => state.loaded);
  const loadEnvironments = useEnvironmentStore((state) => state.load);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [backendReady, setBackendReady] = useState(isTauri() && !import.meta.env.DEV);

  const {
    stdout,
    stderr,
    status,
    exitCode,
    timedOut,
    error,
    durationMs,
    lastRunDurationMs,
    run,
    stop,
    clear,
  } = useExecution();

  const selectedEnvironment = useMemo(
    () => environments.find((env) => env.definition.id === selectedId),
    [environments, selectedId],
  );

  const runDisabled = !selectedEnvironment?.configured;
  const runDisabledReason = runDisabled
    ? "Configure in Settings → Environments"
    : undefined;

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
    if (!backendReady) {
      return;
    }

    let cancelled = false;

    const bootstrap = async () => {
      try {
        await loadEnvironments();
        if (cancelled) {
          return;
        }

        const session = await runspaceInvoke<SessionData>("read_session");
        const storedRuntimeId = session.last_runtime_id;
        const selectedId = useEnvironmentStore.getState().selectedId;
        const runtimeId = (storedRuntimeId ?? selectedId) as EnvironmentId;

        if (storedRuntimeId && storedRuntimeId !== selectedId) {
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
            await useWorkspaceStore.getState().loadWorkspaces(runtimeId);
            await useWorkspaceStore.getState().refreshFiles();
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

  const handleRun = () => {
    void (async () => {
      await useEditorTabsStore.getState().saveActiveFile();
      await run({
        environmentId: selectedId,
        entryFile: activePath ?? workspace?.entry_file,
      });
    })();
  };

  const handleSave = () => {
    void useEditorTabsStore.getState().saveActiveFile();
  };

  if (!backendReady || !workspaceLoaded || !envLoaded || !tabsLoaded) {
    return (
      <div className="app-shell app-shell--loading" data-testid="app-shell">
        <div className="app-shell__loading">
          {!backendReady && !isTauri() ? "Starting backend..." : "Loading..."}
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell" data-testid="app-shell">
      <Toolbar
        status={status}
        runDisabled={runDisabled}
        runDisabledReason={runDisabledReason}
        onRun={handleRun}
        onStop={stop}
        onClear={clear}
        onOpenSettings={() => setSettingsOpen(true)}
      />
      <div className="main-row">
        <Sidebar />
        <EditorArea onRun={handleRun} onSave={handleSave} />
        <OutputPanel
          stdout={stdout}
          stderr={stderr}
          status={status}
          exitCode={exitCode}
          timedOut={timedOut}
          error={error}
          durationMs={durationMs}
        />
      </div>
      <StatusBar
        status={status}
        exitCode={exitCode}
        timedOut={timedOut}
        lastRunDurationMs={lastRunDurationMs}
        environmentName={selectedEnvironment?.definition.name ?? "—"}
      />
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <AppDialogs />
    </div>
  );
}
