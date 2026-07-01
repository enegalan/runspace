import { useState } from "react";
import {
  DEFAULT_SHORTCUT_SETTINGS,
  findConflictingAction,
  SHORTCUT_ACTIONS,
} from "../../core/constants/keyboardShortcuts";
import type { ShortcutActionId, ShortcutBinding } from "../../core/types/shortcuts";
import { matchesQuery } from "../../core/search/matchesQuery";
import { useSettingsStore } from "../../stores/settingsStore";
import { ShortcutRecorder } from "./ShortcutRecorder";
import {
  SettingsCard,
  SettingsCardAction,
  SettingsEmptyState,
  SettingsPageHeader,
  SettingsSearchInput,
} from "./SettingsUi";

const SHORTCUTS_SEARCH = [
  "Keyboard shortcuts",
  ...SHORTCUT_ACTIONS.map((action) => action.label),
].join(" ");

/**
 * The ShortcutsSettings component.
 * @returns The ShortcutsSettings component.
 */
export function ShortcutsSettings() {
  const shortcuts = useSettingsStore((state) => state.settings.shortcuts);
  const update = useSettingsStore((state) => state.update);
  const [search, setSearch] = useState("");

  const filteredActions = SHORTCUT_ACTIONS.filter((action) =>
    matchesQuery(search, action.label, SHORTCUTS_SEARCH),
  );
  const hasSearch = search.trim().length > 0;

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
    <div className="settings-page shortcuts-settings" data-testid="shortcuts-settings">
      <SettingsPageHeader
        title="Keyboard shortcuts"
        description="Click a shortcut, then press the new key combination. Cmd/Ctrl is required."
      />

      <SettingsSearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search shortcuts..."
        testId="shortcuts-settings-search"
      />

      {hasSearch && filteredActions.length === 0 ? (
        <SettingsEmptyState
          message="No shortcuts match your search."
          testId="shortcuts-settings-no-results"
        />
      ) : (
        <SettingsCard
          title="Bindings"
          description="Conflicts are highlighted when two actions share the same keys."
          headerAction={
            <SettingsCardAction onClick={handleReset} data-testid="shortcuts-reset-defaults">
              Reset defaults
            </SettingsCardAction>
          }
        >
          <ul className="shortcuts-settings__list">
            {filteredActions.map((action) => {
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
      )}
    </div>
  );
}
