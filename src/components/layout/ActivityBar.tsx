import type { ExecutionStatus } from "../../core/types/execution";
import { formatShortcutCompact } from "../../core/constants/keyboardShortcuts";
import { isTauri } from "../../core/platform/isTauri";
import { useSettingsStore } from "../../stores/settingsStore";
import { IconButton } from "../ui/IconButton";
import { IconPlay, IconSettings, IconStop, IconTerminal } from "../ui/icons";

interface ActivityBarProps {
  status: ExecutionStatus;
  runDisabled: boolean;
  runDisabledReason?: string;
  terminalVisible: boolean;
  onRun: () => void;
  onStop: () => void;
  onToggleTerminal: () => void;
  onOpenSettings: () => void;
}

export function ActivityBar({
  status,
  runDisabled,
  runDisabledReason,
  terminalVisible,
  onRun,
  onStop,
  onToggleTerminal,
  onOpenSettings,
}: ActivityBarProps) {
  const shortcuts = useSettingsStore((state) => state.settings.shortcuts);
  const isRunning = status === "running";
  const runBlocked = isRunning || runDisabled;
  const runShortcut = formatShortcutCompact(shortcuts.run);
  const stopShortcut = formatShortcutCompact(shortcuts.stop);
  const settingsShortcut = formatShortcutCompact(shortcuts.openSettings);
  const runTitle = runDisabled && runDisabledReason ? runDisabledReason : `Run (${runShortcut})`;
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
      {isTauri() && (
        <div className="activity-bar__drag-fill" data-tauri-drag-region aria-hidden="true" />
      )}
      <div className="activity-bar__bottom">
        <IconButton
          label="Terminal"
          title="Toggle terminal panel"
          className={`activity-bar__btn${terminalVisible ? " activity-bar__btn--active" : ""}`}
          onClick={onToggleTerminal}
          data-testid="terminal-toggle-button"
        >
          <IconTerminal size={16} />
        </IconButton>
        <IconButton
          label="Settings"
          title={`Settings (${settingsShortcut})`}
          className="activity-bar__btn"
          onClick={onOpenSettings}
          data-testid="settings-button"
        >
          <IconSettings size={16} />
        </IconButton>
      </div>
    </nav>
  );
}
