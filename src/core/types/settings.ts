import type { ShortcutSettings } from "./shortcuts";

export type ThemeMode = "dark" | "light" | "system";
export type UiDensity = "comfortable" | "compact";
export type TabSize = 2 | 4 | 8;

export interface AppearanceSettings {
  theme: ThemeMode;
  uiDensity: UiDensity;
  editorFontSize: number;
  editorFontFamily: string;
}

export interface EditorSettings {
  tabSize: TabSize;
  wordWrap: boolean;
  minimap: boolean;
  scrollBeyondLastLine: boolean;
  insertSpaces: boolean;
  autoSave: boolean;
}

export interface ExecutionSettings {
  runTimeoutSecs: number;
  compileTimeoutSecs: number;
  autoClearOutput: boolean;
  autoScrollOutput: boolean;
}

export interface LayoutSettings {
  sidebarWidth: number;
  outputWidth: number;
  terminalHeight: number;
  sidebarVisible: boolean;
  outputVisible: boolean;
  terminalVisible: boolean;
  restoreLastWorkspace: boolean;
  confirmCloseUnsavedTab: boolean;
}

export interface AppSettings {
  appearance: AppearanceSettings;
  editor: EditorSettings;
  execution: ExecutionSettings;
  layout: LayoutSettings;
  shortcuts: ShortcutSettings;
}

export type AppSettingsPatch = {
  appearance?: Partial<AppearanceSettings>;
  editor?: Partial<EditorSettings>;
  execution?: Partial<ExecutionSettings>;
  layout?: Partial<LayoutSettings>;
  shortcuts?: Partial<ShortcutSettings>;
};
