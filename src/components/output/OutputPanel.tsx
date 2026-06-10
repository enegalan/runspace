import type { ExecutionPhase, ExecutionStatus } from "../../core/types/execution";
import { DurationBadge, ExitCodeBadge, OutputStatus } from "./OutputStatus";
import { OutputStream } from "./OutputStream";

interface OutputPanelProps {
  stdout: string;
  stderr: string;
  status: ExecutionStatus;
  phase: ExecutionPhase | null;
  exitCode: number | null;
  timedOut: boolean;
  error: string | null;
  durationMs: number | null;
}

export function OutputPanel({
  stdout,
  stderr,
  status,
  phase,
  exitCode,
  timedOut,
  error,
  durationMs,
}: OutputPanelProps) {
  const isRunning = status === "running";
  const hasContent =
    stdout.length > 0 ||
    stderr.length > 0 ||
    error !== null ||
    timedOut ||
    isRunning;

  return (
    <aside className="output-panel" data-testid="output-panel">
      <div className="output-panel__header">
        <h2 className="output-panel__title">Output</h2>
        <div className="output-panel__badges">
          <OutputStatus status={status} />
          <ExitCodeBadge exitCode={exitCode} />
          <DurationBadge durationMs={durationMs} />
        </div>
      </div>
      <div className="output-panel__body">
        {hasContent ? (
          <OutputStream
            stdout={stdout}
            stderr={stderr}
            error={error}
            timedOut={timedOut}
            isRunning={isRunning}
            phase={phase}
          />
        ) : (
          <p className="output-panel__placeholder">No output yet</p>
        )}
      </div>
    </aside>
  );
}
