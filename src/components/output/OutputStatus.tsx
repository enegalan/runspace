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
