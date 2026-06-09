import type { ExecutionStatus } from "../../core/types/execution";

interface StatusBarProps {
  status: ExecutionStatus;
  exitCode: number | null;
  timedOut: boolean;
  lastRunDurationMs: number | null;
}

function statusLabel(
  status: ExecutionStatus,
  exitCode: number | null,
  timedOut: boolean,
): string {
  if (status === "running") {
    return "Running...";
  }
  if (timedOut || status === "timeout") {
    return "Timed out";
  }
  if (status === "error" && exitCode !== null) {
    return `Error (${exitCode})`;
  }
  if (status === "error") {
    return "Error";
  }
  if (status === "success" && exitCode !== null) {
    return `Finished (${exitCode})`;
  }
  if (status === "success") {
    return "Finished";
  }
  return "Ready";
}

export function StatusBar({
  status,
  exitCode,
  timedOut,
  lastRunDurationMs,
}: StatusBarProps) {
  return (
    <footer className="status-bar" data-testid="status-bar">
      <span className="status-bar__item" data-testid="status-bar-state">
        {statusLabel(status, exitCode, timedOut)}
      </span>
      <span className="status-bar__separator">|</span>
      <span className="status-bar__item">Node.js</span>
      {lastRunDurationMs !== null && (
        <>
          <span className="status-bar__separator">|</span>
          <span className="status-bar__item" data-testid="status-bar-duration">
            Last run: {lastRunDurationMs}ms
          </span>
        </>
      )}
    </footer>
  );
}
