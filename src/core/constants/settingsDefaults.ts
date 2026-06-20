import { clamp } from "../clamp";
import { DEFAULT_SHORTCUT_SETTINGS, normalizeShortcutSettings } from "./keyboardShortcuts";
import {
  OUTPUT_WIDTH_DEFAULT,
  OUTPUT_WIDTH_MAX,
  OUTPUT_WIDTH_MIN,
  SIDEBAR_WIDTH_DEFAULT,
  SIDEBAR_WIDTH_MAX,
  SIDEBAR_WIDTH_MIN,
  TERMINAL_HEIGHT_DEFAULT,
  TERMINAL_HEIGHT_MAX,
  TERMINAL_HEIGHT_MIN,
} from "../layout/panelLayout";
import type { AppSettings, AppSettingsPatch } from "../types/settings";

export const EDITOR_FONT_OPTIONS = [
  { label: "JetBrains Mono", value: "JetBrains Mono" },
  { label: "SF Mono", value: "SF Mono" },
  { label: "Menlo", value: "Menlo" },
  { label: "Fira Code", value: "Fira Code" },
  { label: "Consolas", value: "Consolas" },
  { label: "System", value: "ui-monospace, SFMono-Regular, Menlo, monospace" },
] as const;

export const DEFAULT_APP_SETTINGS: AppSettings = {
  appearance: {
    theme: "dark",
    uiDensity: "comfortable",
    editorFontSize: 13,
    editorFontFamily: "JetBrains Mono",
  },
  editor: {
    tabSize: 2,
    wordWrap: true,
    minimap: false,
    scrollBeyondLastLine: false,
    insertSpaces: true,
    autoSave: true,
  },
  execution: {
    runTimeoutSecs: 30,
    compileTimeoutSecs: 15,
    autoClearOutput: true,
    autoScrollOutput: true,
    runOnSave: true,
    runOnTabChange: true,
  },
  layout: {
    sidebarWidth: SIDEBAR_WIDTH_DEFAULT,
    outputWidth: OUTPUT_WIDTH_DEFAULT,
    terminalHeight: TERMINAL_HEIGHT_DEFAULT,
    sidebarVisible: true,
    outputVisible: true,
    terminalVisible: true,
    restoreLastWorkspace: true,
    confirmCloseUnsavedTab: true,
  },
  shortcuts: DEFAULT_SHORTCUT_SETTINGS,
};

export function normalizeAppSettings(settings: AppSettings): AppSettings {
  return {
    appearance: {
      ...settings.appearance,
      editorFontSize: clamp(settings.appearance.editorFontSize, 10, 20),
    },
    editor: {
      ...settings.editor,
      tabSize: settings.editor.tabSize === 4 ? 4 : settings.editor.tabSize === 8 ? 8 : 2,
    },
    execution: {
      ...settings.execution,
      runTimeoutSecs: clamp(settings.execution.runTimeoutSecs, 5, 300),
      compileTimeoutSecs: clamp(settings.execution.compileTimeoutSecs, 5, 120),
    },
    layout: {
      ...settings.layout,
      sidebarWidth: clamp(settings.layout.sidebarWidth, SIDEBAR_WIDTH_MIN, SIDEBAR_WIDTH_MAX),
      outputWidth: clamp(settings.layout.outputWidth, OUTPUT_WIDTH_MIN, OUTPUT_WIDTH_MAX),
      terminalHeight: clamp(
        settings.layout.terminalHeight,
        TERMINAL_HEIGHT_MIN,
        TERMINAL_HEIGHT_MAX,
      ),
    },
    shortcuts: normalizeShortcutSettings(settings.shortcuts),
  };
}

export function mergeAppSettings(current: AppSettings, patch: AppSettingsPatch): AppSettings {
  return normalizeAppSettings({
    appearance: { ...current.appearance, ...patch.appearance },
    editor: { ...current.editor, ...patch.editor },
    execution: { ...current.execution, ...patch.execution },
    layout: { ...current.layout, ...patch.layout },
    shortcuts: { ...current.shortcuts, ...patch.shortcuts },
  });
}

export function editorFontFamilyCss(family: string): string {
  if (family.includes(",")) {
    return family;
  }
  return `"${family}", ui-monospace, SFMono-Regular, Menlo, monospace`;
}
