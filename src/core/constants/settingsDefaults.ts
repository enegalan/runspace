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
      editorFontSize: Math.min(24, Math.max(10, settings.appearance.editorFontSize)),
    },
    editor: {
      ...settings.editor,
      tabSize: settings.editor.tabSize === 4 ? 4 : settings.editor.tabSize === 8 ? 8 : 2,
    },
    execution: {
      ...settings.execution,
      runTimeoutSecs: Math.min(300, Math.max(5, settings.execution.runTimeoutSecs)),
      compileTimeoutSecs: Math.min(120, Math.max(5, settings.execution.compileTimeoutSecs)),
    },
    layout: {
      ...settings.layout,
      sidebarWidth: Math.min(
        SIDEBAR_WIDTH_MAX,
        Math.max(SIDEBAR_WIDTH_MIN, settings.layout.sidebarWidth),
      ),
      outputWidth: Math.min(
        OUTPUT_WIDTH_MAX,
        Math.max(OUTPUT_WIDTH_MIN, settings.layout.outputWidth),
      ),
      terminalHeight: Math.min(
        TERMINAL_HEIGHT_MAX,
        Math.max(TERMINAL_HEIGHT_MIN, settings.layout.terminalHeight),
      ),
    },
    shortcuts: normalizeShortcutSettings(settings.shortcuts),
  };
}

export function mergeAppSettings(
  current: AppSettings,
  patch: AppSettingsPatch,
): AppSettings {
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
