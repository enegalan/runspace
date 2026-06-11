import { useState } from "react";
import { IconButton } from "../ui/IconButton";
import { Kbd } from "../ui/Kbd";
import { IconClose } from "../ui/icons";
import { EnvironmentsSettings } from "./EnvironmentsSettings";

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

type SettingsTab = "general" | "environments";

export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const [tab, setTab] = useState<SettingsTab>("general");

  if (!open) {
    return null;
  }

  return (
    <div className="settings-overlay" data-testid="settings-panel">
      <div className="settings-overlay__backdrop" onClick={onClose} aria-hidden="true" />
      <div className="settings-panel" role="dialog" aria-label="Settings">
        <header className="settings-panel__header">
          <h1 className="settings-panel__title">Settings</h1>
          <IconButton label="Close settings" onClick={onClose}>
            <IconClose size={18} />
          </IconButton>
        </header>
        <nav className="settings-panel__nav" aria-label="Settings sections">
          <button
            type="button"
            className={`settings-panel__nav-item${
              tab === "general" ? " settings-panel__nav-item--active" : ""
            }`}
            onClick={() => setTab("general")}
          >
            General
          </button>
          <button
            type="button"
            className={`settings-panel__nav-item${
              tab === "environments" ? " settings-panel__nav-item--active" : ""
            }`}
            onClick={() => setTab("environments")}
          >
            Environments
          </button>
        </nav>
        <div className="settings-panel__body">
          {tab === "general" && (
            <div className="settings-general">
              <h2 className="settings-general__title">General</h2>
              <p className="settings-general__description">
                Runspace v0.1.0 — desktop sandbox for multiple runtimes. Open settings anytime
                with <Kbd>Cmd+,</Kbd> on macOS.
              </p>
              <p className="settings-general__coming-soon">
                More general options — appearance, editor preferences, and keyboard shortcuts —
                will be added here in a future release.
              </p>
            </div>
          )}
          {tab === "environments" && <EnvironmentsSettings />}
        </div>
      </div>
    </div>
  );
}
