import type { ExecutionStatus } from "../../core/types/execution";
import { IconButton } from "../ui/IconButton";
import { IconPlay, IconSettings, IconStop } from "../ui/icons";

interface ActivityBarProps {
  status: ExecutionStatus;
  runDisabled: boolean;
  runDisabledReason?: string;
  onRun: () => void;
  onStop: () => void;
  onOpenSettings: () => void;
}

const isMac =
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
const runShortcut = isMac ? "⌘↵" : "Ctrl+↵";
const stopShortcut = isMac ? "⌘." : "Ctrl+.";

export function ActivityBar({
  status,
  runDisabled,
  runDisabledReason,
  onRun,
  onStop,
  onOpenSettings,
}: ActivityBarProps) {
  const isRunning = status === "running";
  const runBlocked = isRunning || runDisabled;
  const runTitle =
    runDisabled && runDisabledReason ? runDisabledReason : `Run (${runShortcut})`;
  const stopTitle = `Stop (${stopShortcut})`;

  return (
    <nav className="activity-bar" data-testid="activity-bar" aria-label="Main actions">
      <div className="activity-bar__top">
        <IconButton
          label="Run"
          title={runTitle}
          className={`activity-bar__btn activity-bar__btn--run${isRunning ? " activity-bar__btn--running" : ""}`}
          onClick={onRun}
          disabled={runBlocked}
          data-testid="run-button"
        >
          <IconPlay size={22} />
        </IconButton>
        <IconButton
          label="Stop"
          title={stopTitle}
          className={`activity-bar__btn activity-bar__btn--stop${isRunning ? " activity-bar__btn--stop-active" : ""}`}
          onClick={onStop}
          disabled={!isRunning}
          data-testid="stop-button"
        >
          <IconStop size={20} />
        </IconButton>
      </div>
      <div className="activity-bar__bottom">
        <IconButton
          label="Settings"
          title="Settings (⌘,)"
          className="activity-bar__btn"
          onClick={onOpenSettings}
          data-testid="settings-button"
        >
          <IconSettings size={22} />
        </IconButton>
      </div>
    </nav>
  );
}
