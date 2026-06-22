import {
  DEFAULT_SHORTCUT_SETTINGS,
  findConflictingAction,
  SHORTCUT_ACTIONS,
} from "../../core/constants/keyboardShortcuts";
import type { ShortcutActionId, ShortcutBinding } from "../../core/types/shortcuts";
import { useSettingsStore } from "../../stores/settingsStore";
import { ShortcutRecorder } from "./ShortcutRecorder";
import { SettingsCard } from "./SettingsUi";

/**
 * The ShortcutsSettingsCard component.
 * @returns The ShortcutsSettingsCard component.
 */
export function ShortcutsSettingsCard() {
  const shortcuts = useSettingsStore((state) => state.settings.shortcuts);
  const update = useSettingsStore((state) => state.update);

  const handleChange = (actionId: ShortcutActionId, binding: ShortcutBinding) => {
    const conflictId = findConflictingAction(shortcuts, actionId, binding);
    if (conflictId) {
      return;
    }

    void update({
      shortcuts: {
        [actionId]: binding,
      },
    });
  };

  const handleReset = () => {
    void update({ shortcuts: DEFAULT_SHORTCUT_SETTINGS });
  };

  return (
    <SettingsCard
      title="Keyboard shortcuts"
      description="Click a shortcut, then press the new key combination. Cmd/Ctrl is required."
      headerAction={
        <button
          type="button"
          className="settings-card__action"
          onClick={handleReset}
          data-testid="shortcuts-reset-defaults"
        >
          Reset defaults
        </button>
      }
    >
      <ul className="shortcuts-settings__list">
        {SHORTCUT_ACTIONS.map((action) => {
          const binding = shortcuts[action.id];
          const conflictId = findConflictingAction(shortcuts, action.id, binding);
          const conflictLabel = conflictId
            ? SHORTCUT_ACTIONS.find((item) => item.id === conflictId)?.label
            : undefined;

          return (
            <li
              key={action.id}
              className={`shortcuts-settings__item${
                conflictLabel ? " shortcuts-settings__item--conflict" : ""
              }`}
            >
              <span className="shortcuts-settings__label">{action.label}</span>
              <div className="shortcuts-settings__control">
                <ShortcutRecorder
                  value={binding}
                  onChange={(next) => handleChange(action.id, next)}
                  testId={`shortcut-recorder-${action.id}`}
                />
                {conflictLabel && (
                  <span className="shortcuts-settings__error" role="alert">
                    Already used by {conflictLabel}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </SettingsCard>
  );
}
