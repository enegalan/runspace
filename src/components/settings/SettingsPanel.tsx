import { useState } from "react";
import { IconButton } from "../ui/IconButton";
import { IconClose, IconPlay, IconSettings } from "../ui/icons";
import { EnvironmentsSettings } from "./EnvironmentsSettings";
import { GeneralSettings } from "./GeneralSettings";

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

type SettingsTab = "general" | "environments";

const NAV_ITEMS: {
  id: SettingsTab;
  label: string;
  icon: typeof IconSettings;
}[] = [
  { id: "general", label: "General", icon: IconSettings },
  { id: "environments", label: "Environments", icon: IconPlay },
];

export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const [tab, setTab] = useState<SettingsTab>("general");

  if (!open) {
    return null;
  }

  return (
    <div className="settings-overlay" data-testid="settings-panel">
      <div className="settings-overlay__backdrop" onClick={onClose} aria-hidden="true" />
      <div className="settings-panel" role="dialog" aria-label="Settings">
        <aside className="settings-panel__sidebar">
          <div className="settings-panel__sidebar-header">
            <h1 className="settings-panel__title">Settings</h1>
          </div>
          <nav className="settings-panel__nav" aria-label="Settings sections">
            {NAV_ITEMS.map(({ id, label, icon: NavIcon }) => (
              <button
                key={id}
                type="button"
                className={`settings-panel__nav-item${
                  tab === id ? " settings-panel__nav-item--active" : ""
                }`}
                onClick={() => setTab(id)}
              >
                <NavIcon size={16} className="settings-panel__nav-icon" />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="settings-panel__main">
          <header className="settings-panel__toolbar">
            <span className="settings-panel__toolbar-spacer" aria-hidden="true" />
            <IconButton label="Close settings" onClick={onClose}>
              <IconClose size={18} />
            </IconButton>
          </header>
          <div className="settings-panel__body">
            {tab === "general" && <GeneralSettings />}
            {tab === "environments" && <EnvironmentsSettings />}
          </div>
        </div>
      </div>
    </div>
  );
}
