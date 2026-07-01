import { useEffect } from "react";
import { isTauri } from "../../core/platform/isTauri";
import { useSettingsStore } from "../../stores/settingsStore";
import { useSettingsUiStore, type SettingsTab } from "../../stores/settingsUiStore";
import { IconButton } from "../ui/IconButton";
import { IconClose, IconKeyboard, IconPlay, IconRefresh, IconSettings } from "../ui/icons";
import { EnvironmentsSettings } from "./EnvironmentsSettings";
import { GeneralSettings } from "./GeneralSettings";
import { ShortcutsSettings } from "./ShortcutsSettings";

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
  { id: "shortcuts", label: "Shortcuts", icon: IconKeyboard },
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

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="settings-overlay" data-testid="settings-panel">
      {isTauri() && (
        <div className="settings-overlay__titlebar" data-tauri-drag-region aria-hidden="true" />
      )}
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
          <div className="settings-panel__sidebar-footer">
            <button
              type="button"
              className="settings-panel__reset"
              onClick={() => void reset()}
              data-testid="settings-reset-all"
            >
              <IconRefresh size={14} className="settings-panel__reset-icon" />
              Reset all defaults
            </button>
          </div>
        </aside>

        <div className="settings-panel__main">
          <header
            className={`settings-panel__toolbar${isTauri() ? " settings-panel__toolbar--titlebar" : ""}`}
            {...(isTauri() ? { "data-tauri-drag-region": true } : {})}
          >
            <IconButton label="Close settings" onClick={onClose}>
              <IconClose size={18} />
            </IconButton>
          </header>
          <div className="settings-panel__body">
            <div key={tab} className="settings-panel__tab-content">
              {tab === "general" && <GeneralSettings />}
              {tab === "environments" && <EnvironmentsSettings />}
              {tab === "shortcuts" && <ShortcutsSettings />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
