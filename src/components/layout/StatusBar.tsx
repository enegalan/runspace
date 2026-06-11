import type { ExecutionPhase, ExecutionStatus } from "../../core/types/execution";

interface StatusBarProps {
  status: ExecutionStatus;
  phase: ExecutionPhase | null;
  exitCode: number | null;
  timedOut: boolean;
  lastRunDurationMs: number | null;
  environmentName: string;
}

function statusLabel(
  status: ExecutionStatus,
  phase: ExecutionPhase | null,
  exitCode: number | null,
  timedOut: boolean,
): string {
  if (status === "running") {
    if (phase === "compile") {
      return "Compiling...";
    }
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

function statusClass(status: ExecutionStatus): string {
  if (status === "running") {
    return "status-bar__item--running";
  }
  if (status === "success") {
    return "status-bar__item--success";
  }
  if (status === "error" || status === "timeout") {
    return "status-bar__item--error";
  }
  return "";
}

export function StatusBar({
  status,
  phase,
  exitCode,
  timedOut,
  lastRunDurationMs,
  environmentName,
}: StatusBarProps) {
  return (
    <footer className="status-bar" data-testid="status-bar">
      <span
        className={`status-bar__item ${statusClass(status)}`}
        data-testid="status-bar-state"
      >
        {statusLabel(status, phase, exitCode, timedOut)}
      </span>
      <span className="status-bar__separator">·</span>
      <span className="status-bar__env-chip" data-testid="status-bar-environment">
        {environmentName}
      </span>
      {lastRunDurationMs !== null && (
        <>
          <span className="status-bar__separator">·</span>
          <span className="status-bar__item" data-testid="status-bar-duration">
            Last run: {lastRunDurationMs}ms
          </span>
        </>
      )}
    </footer>
  );
}
