import { EnvironmentsSettings } from "./EnvironmentsSettings";

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="settings-overlay" data-testid="settings-panel">
      <div className="settings-overlay__backdrop" onClick={onClose} aria-hidden="true" />
      <div className="settings-panel" role="dialog" aria-label="Settings">
        <header className="settings-panel__header">
          <h1 className="settings-panel__title">Settings</h1>
          <button
            type="button"
            className="settings-panel__close"
            onClick={onClose}
            aria-label="Close settings"
          >
            ×
          </button>
        </header>
        <div className="settings-panel__body">
          <EnvironmentsSettings />
        </div>
      </div>
    </div>
  );
}
