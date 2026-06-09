import { useExecution } from "../../hooks/useExecution";
import { EditorArea } from "./EditorArea";
import { OutputPanel } from "./OutputPanel";
import { Sidebar } from "./Sidebar";
import { StatusBar } from "./StatusBar";
import { Toolbar } from "./Toolbar";

export function AppShell() {
  const { stdout, stderr, status, exitCode, timedOut, error, run, stop } =
    useExecution();

  return (
    <div className="app-shell" data-testid="app-shell">
      <Toolbar />
      <div className="main-row">
        <Sidebar />
        <EditorArea status={status} onRun={run} onStop={stop} />
        <OutputPanel
          stdout={stdout}
          stderr={stderr}
          timedOut={timedOut}
          error={error}
        />
      </div>
      <StatusBar status={status} exitCode={exitCode} timedOut={timedOut} />
    </div>
  );
}
