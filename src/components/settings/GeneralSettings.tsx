import { useState } from "react";
import { SHORTCUT_ACTIONS } from "../../core/constants/keyboardShortcuts";
import { EDITOR_FONT_OPTIONS } from "../../core/constants/settingsDefaults";
import { matchesSettingsSearch } from "../../core/settings/search";
import type { TabSize, ThemeMode, UiDensity } from "../../core/types/settings";
import { useSettingsStore } from "../../stores/settingsStore";
import { ShortcutsSettingsCard } from "./ShortcutsSettings";
import {
  SettingsCard,
  SettingsDivider,
  SettingsNumberInput,
  SettingsPageHeader,
  SettingsRow,
  SettingsSearchInput,
  SettingsSegmented,
  SettingsSelect,
  SettingsToggleRow,
} from "./SettingsUi";

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
  { value: "system", label: "System" },
];

const DENSITY_OPTIONS: { value: UiDensity; label: string }[] = [
  { value: "comfortable", label: "Comfortable" },
  { value: "compact", label: "Compact" },
];

const TAB_SIZE_OPTIONS: { value: TabSize; label: string }[] = [
  { value: 2, label: "2" },
  { value: 4, label: "4" },
  { value: 8, label: "8" },
];

const APPEARANCE_SEARCH =
  "Appearance theme density typography font size font family dark light system comfortable compact";
const EDITOR_SEARCH =
  "Editor tab size word wrap minimap scroll beyond last line insert spaces auto-save";
const EXECUTION_SEARCH =
  "Execution run timeout compile timeout auto-clear output auto-scroll output run on save run on tab change";
const LAYOUT_SEARCH =
  "Layout sidebar output panel restore last workspace confirm before closing unsaved tabs";
const SHORTCUTS_SEARCH = [
  "Keyboard shortcuts",
  ...SHORTCUT_ACTIONS.map((action) => action.label),
].join(" ");

export function GeneralSettings() {
  const settings = useSettingsStore((state) => state.settings);
  const update = useSettingsStore((state) => state.update);
  const [search, setSearch] = useState("");

  const showAppearance = matchesSettingsSearch(search, APPEARANCE_SEARCH);
  const showEditor = matchesSettingsSearch(search, EDITOR_SEARCH);
  const showExecution = matchesSettingsSearch(search, EXECUTION_SEARCH);
  const showLayout = matchesSettingsSearch(search, LAYOUT_SEARCH);
  const showShortcuts = matchesSettingsSearch(search, SHORTCUTS_SEARCH);
  const hasSearch = search.trim().length > 0;
  const hasVisibleResults =
    showAppearance || showEditor || showExecution || showLayout || showShortcuts;

  return (
    <div className="settings-page general-settings" data-testid="general-settings">
      <SettingsPageHeader
        title="General"
        description="Appearance, editor, execution, and layout preferences."
      />

      <SettingsSearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search settings..."
        testId="general-settings-search"
      />

      {hasSearch && !hasVisibleResults ? (
        <p className="general-settings__empty" data-testid="general-settings-no-results">
          No settings match your search.
        </p>
      ) : (
        <>
          {showAppearance && (
            <SettingsCard title="Appearance" description="Theme, density, and typography.">
              <SettingsRow label="Theme">
                <SettingsSegmented
                  name="Theme"
                  testId="setting-theme"
                  value={settings.appearance.theme}
                  options={THEME_OPTIONS}
                  onChange={(theme) => void update({ appearance: { theme } })}
                />
              </SettingsRow>

              <SettingsDivider />

              <SettingsRow label="UI density" hint="Spacing across the shell and panels.">
                <SettingsSegmented
                  name="UI density"
                  testId="setting-ui-density"
                  value={settings.appearance.uiDensity}
                  options={DENSITY_OPTIONS}
                  onChange={(uiDensity) => void update({ appearance: { uiDensity } })}
                />
              </SettingsRow>

              <SettingsDivider />

              <SettingsRow label="Font size" htmlFor="setting-editor-font-size">
                <SettingsNumberInput
                  id="setting-editor-font-size"
                  min={10}
                  max={20}
                  value={settings.appearance.editorFontSize}
                  onChange={(event) =>
                    void update({
                      appearance: { editorFontSize: Number(event.target.value) },
                    })
                  }
                  data-testid="setting-editor-font-size"
                />
              </SettingsRow>

              <SettingsDivider />

              <SettingsRow label="Font family" htmlFor="setting-editor-font-family">
                <SettingsSelect
                  id="setting-editor-font-family"
                  value={settings.appearance.editorFontFamily}
                  onChange={(event) =>
                    void update({
                      appearance: { editorFontFamily: event.target.value },
                    })
                  }
                  data-testid="setting-editor-font-family"
                >
                  {EDITOR_FONT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </SettingsSelect>
              </SettingsRow>
            </SettingsCard>
          )}

          {showEditor && (
            <SettingsCard title="Editor" description="Monaco editor behavior.">
              <SettingsRow label="Tab size">
                <SettingsSegmented
                  name="Tab size"
                  testId="setting-tab-size"
                  value={settings.editor.tabSize}
                  options={TAB_SIZE_OPTIONS}
                  onChange={(tabSize) => void update({ editor: { tabSize } })}
                />
              </SettingsRow>

              <SettingsDivider />

              <SettingsToggleRow
                label="Word wrap"
                description="Wrap long lines in the editor."
                checked={settings.editor.wordWrap}
                onChange={(event) => void update({ editor: { wordWrap: event.target.checked } })}
                data-testid="setting-word-wrap"
              />
              <SettingsToggleRow
                label="Minimap"
                description="Show the code overview strip on the right."
                checked={settings.editor.minimap}
                onChange={(event) => void update({ editor: { minimap: event.target.checked } })}
                data-testid="setting-minimap"
              />
              <SettingsToggleRow
                label="Scroll beyond last line"
                description="Allow scrolling past the final line of code."
                checked={settings.editor.scrollBeyondLastLine}
                onChange={(event) =>
                  void update({ editor: { scrollBeyondLastLine: event.target.checked } })
                }
                data-testid="setting-scroll-beyond"
              />
              <SettingsToggleRow
                label="Insert spaces"
                description="Use spaces instead of tab characters."
                checked={settings.editor.insertSpaces}
                onChange={(event) =>
                  void update({ editor: { insertSpaces: event.target.checked } })
                }
                data-testid="setting-insert-spaces"
              />
              <SettingsToggleRow
                label="Auto-save"
                description="Save the active file when the editor loses focus."
                checked={settings.editor.autoSave}
                onChange={(event) => void update({ editor: { autoSave: event.target.checked } })}
                data-testid="setting-auto-save"
              />
            </SettingsCard>
          )}

          {showExecution && (
            <SettingsCard title="Execution" description="Run behavior and output handling.">
              <SettingsRow label="Run timeout" hint="Seconds before stopping interpreted runs.">
                <SettingsNumberInput
                  min={5}
                  max={300}
                  value={settings.execution.runTimeoutSecs}
                  onChange={(event) =>
                    void update({
                      execution: { runTimeoutSecs: Number(event.target.value) },
                    })
                  }
                  data-testid="setting-run-timeout"
                />
              </SettingsRow>

              <SettingsDivider />

              <SettingsRow label="Compile timeout" hint="Seconds before aborting C/C++ compile.">
                <SettingsNumberInput
                  min={5}
                  max={120}
                  value={settings.execution.compileTimeoutSecs}
                  onChange={(event) =>
                    void update({
                      execution: { compileTimeoutSecs: Number(event.target.value) },
                    })
                  }
                  data-testid="setting-compile-timeout"
                />
              </SettingsRow>

              <SettingsDivider />

              <SettingsToggleRow
                label="Auto-clear output on run"
                description="Clear the output panel when a new run starts."
                checked={settings.execution.autoClearOutput}
                onChange={(event) =>
                  void update({ execution: { autoClearOutput: event.target.checked } })
                }
                data-testid="setting-auto-clear-output"
              />
              <SettingsToggleRow
                label="Auto-scroll output"
                description="Follow new output unless you scroll up."
                checked={settings.execution.autoScrollOutput}
                onChange={(event) =>
                  void update({ execution: { autoScrollOutput: event.target.checked } })
                }
                data-testid="setting-auto-scroll-output"
              />
              <SettingsToggleRow
                label="Run on save"
                description="Run the active file after saving."
                checked={settings.execution.runOnSave}
                onChange={(event) =>
                  void update({ execution: { runOnSave: event.target.checked } })
                }
                data-testid="setting-run-on-save"
              />
              <SettingsToggleRow
                label="Run on tab change"
                description="Run the active file when switching editor tabs."
                checked={settings.execution.runOnTabChange}
                onChange={(event) =>
                  void update({ execution: { runOnTabChange: event.target.checked } })
                }
                data-testid="setting-run-on-tab-change"
              />
            </SettingsCard>
          )}

          {showLayout && (
            <SettingsCard title="Layout" description="Panels and workspace restore.">
              <SettingsToggleRow
                label="Show sidebar"
                checked={settings.layout.sidebarVisible}
                onChange={(event) =>
                  void update({ layout: { sidebarVisible: event.target.checked } })
                }
                data-testid="setting-sidebar-visible"
              />
              <SettingsToggleRow
                label="Show output panel"
                checked={settings.layout.outputVisible}
                onChange={(event) =>
                  void update({ layout: { outputVisible: event.target.checked } })
                }
                data-testid="setting-output-visible"
              />

              <SettingsDivider />

              <SettingsToggleRow
                label="Restore last workspace on launch"
                description="Reopen your previous workspace when the app starts."
                checked={settings.layout.restoreLastWorkspace}
                onChange={(event) =>
                  void update({ layout: { restoreLastWorkspace: event.target.checked } })
                }
                data-testid="setting-restore-workspace"
              />
              <SettingsToggleRow
                label="Confirm before closing unsaved tabs"
                checked={settings.layout.confirmCloseUnsavedTab}
                onChange={(event) =>
                  void update({ layout: { confirmCloseUnsavedTab: event.target.checked } })
                }
                data-testid="setting-confirm-close"
              />
            </SettingsCard>
          )}

          {showShortcuts && <ShortcutsSettingsCard />}
        </>
      )}
    </div>
  );
}
