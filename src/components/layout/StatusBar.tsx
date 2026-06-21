import type { ExecutionPhase, ExecutionStatus } from "../../core/types/execution";

interface StatusBarProps {
  status: ExecutionStatus;
  phase: ExecutionPhase | null;
  exitCode: number | null;
  timedOut: boolean;
  lastRunDurationMs: number | null;
}

/**
 * Get the status label.
 * @param status - The status.
 * @param phase - The phase.
 * @param exitCode - The exit code.
 * @param timedOut - Whether the execution timed out.
 * @returns The status label.
 */
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

/**
 * Get the status class.
 * @param status - The status.
 * @returns The status class.
 */
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

/**
 * The StatusBar component.
 * @param status - The status.
 * @param phase - The phase.
 * @param exitCode - The exit code.
 * @param timedOut - Whether the execution timed out.
 * @param lastRunDurationMs - The last run duration in milliseconds.
 * @returns The StatusBar component.
 */
export function StatusBar({
  status,
  phase,
  exitCode,
  timedOut,
  lastRunDurationMs,
}: StatusBarProps) {
  return (
    <footer className="status-bar" data-testid="status-bar">
      <span className={`status-bar__item ${statusClass(status)}`} data-testid="status-bar-state">
        {statusLabel(status, phase, exitCode, timedOut)}
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
