import type { ExecutionStatus } from "../../core/types/execution";

interface StatusBarProps {
  status: ExecutionStatus;
  exitCode: number | null;
  timedOut: boolean;
}

function statusLabel(status: ExecutionStatus, exitCode: number | null, timedOut: boolean) {
  if (status === "running") {
    return "Running...";
  }
  if (timedOut) {
    return "Timed out";
  }
  if (status === "done" && exitCode !== null) {
    return `Done (exit ${exitCode})`;
  }
  if (status === "done") {
    return "Done";
  }
  return "Ready";
}

export function StatusBar({ status, exitCode, timedOut }: StatusBarProps) {
  return (
    <footer className="status-bar" data-testid="status-bar">
      {statusLabel(status, exitCode, timedOut)}
    </footer>
  );
}
