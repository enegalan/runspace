export type ShortcutActionId =
  | "run"
  | "stop"
  | "save"
  | "newFile"
  | "newFolder"
  | "newTerminal"
  | "toggleSidebar"
  | "toggleOutput"
  | "openSettings";

export interface ShortcutBinding {
  key: string;
  mod: boolean;
  shift: boolean;
  alt: boolean;
}

export type ShortcutSettings = Record<ShortcutActionId, ShortcutBinding>;

export interface ShortcutActionMeta {
  id: ShortcutActionId;
  label: string;
}
