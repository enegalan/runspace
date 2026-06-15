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
  { action: "New file", keys: [mod, "N"] },
  { action: "New folder", keys: [mod, "Shift", "N"] },
  { action: "New terminal", keys: [mod, "Shift", "T"] },
  { action: "Toggle sidebar", keys: [mod, "B"] },
  { action: "Toggle output panel", keys: [mod, "J"] },
  { action: "Settings", keys: [mod, ","] },
  { action: "Close window", keys: [mod, "W"] },
];
