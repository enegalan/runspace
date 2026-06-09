import type { ExecutionStatus } from "../../core/types/execution";
import { EnvironmentSelector } from "../environment/EnvironmentSelector";

interface ToolbarProps {
  status: ExecutionStatus;
  runDisabled: boolean;
  runDisabledReason?: string;
  onRun: () => void;
  onStop: () => void;
  onClear: () => void;
  onOpenSettings: () => void;
}

const isMac =
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
const runShortcut = isMac ? "⌘↵" : "Ctrl+↵";

export function Toolbar({
  status,
  runDisabled,
  runDisabledReason,
  onRun,
  onStop,
  onClear,
  onOpenSettings,
}: ToolbarProps) {
  const isRunning = status === "running";
  const runBlocked = isRunning || runDisabled;

  return (
    <header className="toolbar" data-testid="toolbar">
      <div className="toolbar__brand">
        <div className="toolbar__logo" aria-hidden="true" />
        <span className="toolbar__title">Runspace</span>
      </div>

      <div className="toolbar__controls">
        <EnvironmentSelector disabled={isRunning} />

        <button
          type="button"
          className={`btn btn--primary${isRunning ? " btn--running" : ""}`}
          onClick={onRun}
          disabled={runBlocked}
          title={runDisabled && runDisabledReason ? runDisabledReason : undefined}
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

        <button
          type="button"
          className="btn toolbar__settings-btn"
          onClick={onOpenSettings}
          aria-label="Settings"
          data-testid="settings-button"
        >
          ⚙
        </button>
      </div>
    </header>
  );
}
