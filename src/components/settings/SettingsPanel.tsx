import { useSettingsStore } from "../../stores/settingsStore";
import { useSettingsUiStore, type SettingsTab } from "../../stores/settingsUiStore";
import { IconButton } from "../ui/IconButton";
import { IconClose, IconPlay, IconSettings } from "../ui/icons";
import { EnvironmentsSettings } from "./EnvironmentsSettings";
import { GeneralSettings } from "./GeneralSettings";

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

/**
 * The navigation items.
 * @returns The navigation items.
 */
const NAV_ITEMS: {
  id: SettingsTab;
  label: string;
  icon: typeof IconSettings;
}[] = [
  { id: "general", label: "General", icon: IconSettings },
  { id: "environments", label: "Environments", icon: IconPlay },
];

/**
 * The SettingsPanel component.
 * @param open - Whether the settings panel is open.
 * @param onClose - The function to call when the settings panel is closed.
 * @returns The SettingsPanel component.
 */
export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const tab = useSettingsUiStore((state) => state.tab);
  const setTab = useSettingsUiStore((state) => state.setTab);
  const reset = useSettingsStore((state) => state.reset);

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
                title={label}
              >
                <NavIcon size={16} className="settings-panel__nav-icon" />
                <span className="settings-panel__nav-label">{label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <div className="settings-panel__main">
          <header className="settings-panel__toolbar">
            <button
              type="button"
              className="settings-card__action"
              onClick={() => void reset()}
              data-testid="settings-reset-all"
            >
              Reset all defaults
            </button>
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
