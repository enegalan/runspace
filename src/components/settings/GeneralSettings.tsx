import { EDITOR_FONT_OPTIONS } from "../../core/constants/settingsDefaults";
import type { TabSize, ThemeMode, UiDensity } from "../../core/types/settings";
import { useSettingsStore } from "../../stores/settingsStore";
import { ShortcutsSettingsCard } from "./ShortcutsSettings";
import {
  SettingsCard,
  SettingsDivider,
  SettingsNumberInput,
  SettingsPageHeader,
  SettingsRow,
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

export function GeneralSettings() {
  const settings = useSettingsStore((state) => state.settings);
  const update = useSettingsStore((state) => state.update);

  return (
    <div className="settings-page" data-testid="general-settings">
      <SettingsPageHeader
        title="General"
        description="Appearance, editor, execution, and layout preferences."
      />

      <SettingsCard
        title="Appearance"
        description="Theme, density, and editor typography."
      >
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
            max={24}
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
          onChange={(event) =>
            void update({ editor: { wordWrap: event.target.checked } })
          }
          data-testid="setting-word-wrap"
        />
        <SettingsToggleRow
          label="Minimap"
          description="Show the code overview strip on the right."
          checked={settings.editor.minimap}
          onChange={(event) =>
            void update({ editor: { minimap: event.target.checked } })
          }
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
      </SettingsCard>

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
      </SettingsCard>

      <SettingsCard title="Layout" description="Panels and workspace restore.">
        <SettingsRow label="Sidebar width" hint="260–480 px">
          <SettingsNumberInput
            min={260}
            max={480}
            value={settings.layout.sidebarWidth}
            onChange={(event) =>
              void update({
                layout: { sidebarWidth: Number(event.target.value) },
              })
            }
            data-testid="setting-sidebar-width"
          />
        </SettingsRow>

        <SettingsDivider />

        <SettingsRow label="Output width" hint="200–560 px">
          <SettingsNumberInput
            min={200}
            max={560}
            value={settings.layout.outputWidth}
            onChange={(event) =>
              void update({
                layout: { outputWidth: Number(event.target.value) },
              })
            }
            data-testid="setting-output-width"
          />
        </SettingsRow>

        <SettingsDivider />

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
          description="Reopen your previous project when the app starts."
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

      <ShortcutsSettingsCard />
    </div>
  );
}
