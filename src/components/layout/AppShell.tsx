import { getCurrentWindow } from "@tauri-apps/api/window";
import { useEffect, useState } from "react";
import { DEFAULT_RUNTIME_ID } from "../../core/runtimes";
import type { RuntimeId } from "../../core/types/runtime";
import { useExecution } from "../../hooks/useExecution";
import { useEditorStore } from "../../stores/editorStore";
import { OutputPanel } from "../output/OutputPanel";
import { EditorArea } from "./EditorArea";
import { Sidebar } from "./Sidebar";
import { StatusBar } from "./StatusBar";
import { Toolbar } from "./Toolbar";

export function AppShell() {
  const loadFromDisk = useEditorStore((state) => state.loadFromDisk);
  const saveToDisk = useEditorStore((state) => state.saveToDisk);
  const code = useEditorStore((state) => state.code);
  const loaded = useEditorStore((state) => state.loaded);
  const [runtime, setRuntime] = useState<RuntimeId>(DEFAULT_RUNTIME_ID);

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

  useEffect(() => {
    void loadFromDisk();
  }, [loadFromDisk]);

  useEffect(() => {
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

  if (!loaded) {
    return (
      <div className="app-shell app-shell--loading" data-testid="app-shell">
        <div className="app-shell__loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="app-shell" data-testid="app-shell">
      <Toolbar
        status={status}
        runtime={runtime}
        onRuntimeChange={setRuntime}
        onRun={() => run(code, { runtime })}
        onStop={stop}
        onClear={clear}
      />
      <div className="main-row">
        <Sidebar />
        <EditorArea
          onRun={(editorCode) => run(editorCode, { runtime })}
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
      />
    </div>
  );
}
