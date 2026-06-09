import type { ExecutionStatus } from "../../core/types/execution";

interface OutputStatusProps {
  status: ExecutionStatus;
}

const STATUS_LABELS: Record<ExecutionStatus, string> = {
  idle: "idle",
  running: "running",
  success: "success",
  error: "error",
  timeout: "timeout",
};

export function OutputStatus({ status }: OutputStatusProps) {
  return (
    <span
      className={`output-status output-status--${status}`}
      data-testid="output-status"
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export function ExitCodeBadge({ exitCode }: { exitCode: number | null }) {
  if (exitCode === null) {
    return null;
  }

  return (
    <span className="output-badge" data-testid="exit-code-badge">
      exit code: {exitCode}
    </span>
  );
}

export function DurationBadge({ durationMs }: { durationMs: number | null }) {
  if (durationMs === null) {
    return null;
  }

  return (
    <span className="output-badge" data-testid="duration-badge">
      {durationMs}ms
    </span>
  );
}
