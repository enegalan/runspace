import type { ExecutionStatus } from "../../core/types/execution";
import type { RuntimeId } from "../../core/types/runtime";
import { RuntimeSelect } from "./RuntimeSelect";

interface ToolbarProps {
  status: ExecutionStatus;
  runtime: RuntimeId;
  onRuntimeChange: (runtime: RuntimeId) => void;
  onRun: () => void;
  onStop: () => void;
  onClear: () => void;
}

const isMac =
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
const runShortcut = isMac ? "⌘↵" : "Ctrl+↵";

export function Toolbar({
  status,
  runtime,
  onRuntimeChange,
  onRun,
  onStop,
  onClear,
}: ToolbarProps) {
  const isRunning = status === "running";

  return (
    <header className="toolbar" data-testid="toolbar">
      <div className="toolbar__brand">
        <div className="toolbar__logo" aria-hidden="true" />
        <span className="toolbar__title">Runspace</span>
      </div>

      <div className="toolbar__controls">
        <RuntimeSelect
          value={runtime}
          onChange={onRuntimeChange}
          disabled={isRunning}
        />

        <button
          type="button"
          className={`btn btn--primary${isRunning ? " btn--running" : ""}`}
          onClick={onRun}
          disabled={isRunning}
          data-testid="run-button"
        >
          <span className="btn__icon" aria-hidden="true">
            ▶
          </span>
          Run
          <span className="btn__shortcut">{runShortcut}</span>
        </button>

        <button
          type="button"
          className={`btn btn--danger${isRunning ? " btn--danger--active" : ""}`}
          onClick={onStop}
          disabled={!isRunning}
          data-testid="stop-button"
        >
          <span className="btn__icon" aria-hidden="true">
            ■
          </span>
          Stop
        </button>

        <button
          type="button"
          className="btn"
          onClick={onClear}
          data-testid="clear-button"
        >
          Clear
        </button>
      </div>
    </header>
  );
}
