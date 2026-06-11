export interface AppShortcut {
  action: string;
  keys: string[];
}

const isMac =
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
const mod = isMac ? "⌘" : "Ctrl";

export const APP_SHORTCUTS: AppShortcut[] = [
  { action: "Run", keys: [mod, "↵"] },
  { action: "Stop", keys: [mod, "."] },
  { action: "Save file", keys: [mod, "S"] },
  { action: "New workspace", keys: [mod, "N"] },
  { action: "Close tab", keys: [mod, "W"] },
  { action: "Settings", keys: [mod, ","] },
];
