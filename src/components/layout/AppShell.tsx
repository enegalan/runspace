import { getCurrentWindow } from "@tauri-apps/api/window";
import { useEffect, useMemo, useState } from "react";
import { waitForBackendReady } from "../../core/api/fetchBackend";
import { useExecution } from "../../hooks/useExecution";
import { isTauri } from "../../core/platform/isTauri";
import { useEditorStore } from "../../stores/editorStore";
import { useEnvironmentStore } from "../../stores/environmentStore";
import { OutputPanel } from "../output/OutputPanel";
import { SettingsPanel } from "../settings/SettingsPanel";
import { EditorArea } from "./EditorArea";
import { Sidebar } from "./Sidebar";
import { StatusBar } from "./StatusBar";
import { Toolbar } from "./Toolbar";

export function AppShell() {
  const loadFromDisk = useEditorStore((state) => state.loadFromDisk);
  const saveToDisk = useEditorStore((state) => state.saveToDisk);
  const code = useEditorStore((state) => state.code);
  const loaded = useEditorStore((state) => state.loaded);

  const environments = useEnvironmentStore((state) => state.environments);
  const selectedId = useEnvironmentStore((state) => state.selectedId);
  const envLoaded = useEnvironmentStore((state) => state.loaded);
  const loadEnvironments = useEnvironmentStore((state) => state.load);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [backendReady, setBackendReady] = useState(isTauri());

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
    void loadFromDisk();
    void loadEnvironments();
  }, [backendReady, loadFromDisk, loadEnvironments]);

  useEffect(() => {
    if (!isTauri()) {
      return;
    }

    let unlisten: (() => void) | undefined;

    void getCurrentWindow()
      .onCloseRequested(() => {
        void saveToDisk();
      })
      .then((fn) => {
        unlisten = fn;
      });

    return () => {
      unlisten?.();
    };
  }, [saveToDisk]);

  if (!backendReady || !loaded || !envLoaded) {
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
        onRun={() => run(code, { environmentId: selectedId })}
        onStop={stop}
        onClear={clear}
        onOpenSettings={() => setSettingsOpen(true)}
      />
      <div className="main-row">
        <Sidebar />
        <EditorArea
          onRun={(editorCode) => run(editorCode, { environmentId: selectedId })}
          onSave={saveToDisk}
        />
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
    </div>
  );
}
