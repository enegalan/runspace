import type {
  ShortcutActionId,
  ShortcutActionMeta,
  ShortcutBinding,
  ShortcutSettings,
} from "../types/shortcuts";

export interface AppShortcut {
  action: string;
  keys: string[];
}

export const SHORTCUT_ACTIONS: ShortcutActionMeta[] = [
  { id: "run", label: "Run" },
  { id: "stop", label: "Stop" },
  { id: "save", label: "Save file" },
  { id: "newFile", label: "New file" },
  { id: "newFolder", label: "New folder" },
  { id: "newTerminal", label: "New terminal" },
  { id: "toggleSidebar", label: "Toggle sidebar" },
  { id: "toggleOutput", label: "Toggle output panel" },
  { id: "openSettings", label: "Settings" },
];

export const DEFAULT_SHORTCUT_SETTINGS: ShortcutSettings = {
  run: { key: "enter", mod: true, shift: false, alt: false },
  stop: { key: ".", mod: true, shift: false, alt: false },
  save: { key: "s", mod: true, shift: false, alt: false },
  newFile: { key: "n", mod: true, shift: false, alt: false },
  newFolder: { key: "n", mod: true, shift: true, alt: false },
  newTerminal: { key: "t", mod: true, shift: true, alt: false },
  toggleSidebar: { key: "b", mod: true, shift: false, alt: false },
  toggleOutput: { key: "j", mod: true, shift: false, alt: false },
  openSettings: { key: ",", mod: true, shift: false, alt: false },
};

const CLOSE_WINDOW_BINDING: ShortcutBinding = { key: "w", mod: true, shift: false, alt: false };

export function isMacPlatform(): boolean {
  return (
    typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform)
  );
}

export function normalizeShortcutKey(key: string): string {
  if (key === "Enter") {
    return "enter";
  }
  return key.toLowerCase();
}

export function bindingsEqual(a: ShortcutBinding, b: ShortcutBinding): boolean {
  return (
    a.key === b.key &&
    a.mod === b.mod &&
    a.shift === b.shift &&
    a.alt === b.alt
  );
}

export function normalizeShortcutBinding(binding: ShortcutBinding): ShortcutBinding {
  return {
    key: normalizeShortcutKey(binding.key),
    mod: binding.mod,
    shift: binding.shift ?? false,
    alt: binding.alt ?? false,
  };
}

export function bindingFromKeyboardEvent(
  event: KeyboardEvent,
): ShortcutBinding | null {
  const key = normalizeShortcutKey(event.key);
  if (key === "control" || key === "meta" || key === "shift" || key === "alt") {
    return null;
  }

  const mod = event.metaKey || event.ctrlKey;
  if (!mod) {
    return null;
  }

  return {
    key,
    mod: true,
    shift: event.shiftKey,
    alt: event.altKey,
  };
}

export function matchesShortcut(
  event: KeyboardEvent,
  binding: ShortcutBinding,
): boolean {
  const mod = event.metaKey || event.ctrlKey;
  if (binding.mod !== mod) {
    return false;
  }
  if (binding.shift !== event.shiftKey) {
    return false;
  }
  if (binding.alt !== event.altKey) {
    return false;
  }
  return normalizeShortcutKey(event.key) === binding.key;
}

function formatKeyLabel(key: string): string {
  if (key === "enter") {
    return "↵";
  }
  if (key === ",") {
    return ",";
  }
  if (key === ".") {
    return ".";
  }
  return key.length === 1 ? key.toUpperCase() : key;
}

export function formatShortcutBinding(binding: ShortcutBinding): string[] {
  const modLabel = isMacPlatform() ? "⌘" : "Ctrl";
  const keys: string[] = [];
  if (binding.mod) {
    keys.push(modLabel);
  }
  if (binding.shift) {
    keys.push("Shift");
  }
  if (binding.alt) {
    keys.push(isMacPlatform() ? "⌥" : "Alt");
  }
  keys.push(formatKeyLabel(binding.key));
  return keys;
}

export function formatShortcutCompact(binding: ShortcutBinding): string {
  if (isMacPlatform()) {
    let label = "";
    if (binding.mod) {
      label += "⌘";
    }
    if (binding.shift) {
      label += "⇧";
    }
    if (binding.alt) {
      label += "⌥";
    }
    label += formatKeyLabel(binding.key);
    return label;
  }

  const parts: string[] = [];
  if (binding.mod) {
    parts.push("Ctrl");
  }
  if (binding.shift) {
    parts.push("Shift");
  }
  if (binding.alt) {
    parts.push("Alt");
  }
  parts.push(formatKeyLabel(binding.key));
  return parts.join("+");
}

export function normalizeShortcutSettings(
  shortcuts: Partial<ShortcutSettings> | undefined,
): ShortcutSettings {
  const next = { ...DEFAULT_SHORTCUT_SETTINGS };
  if (!shortcuts) {
    return next;
  }

  for (const action of SHORTCUT_ACTIONS) {
    const binding = shortcuts[action.id];
    if (binding?.key && binding.mod) {
      next[action.id] = normalizeShortcutBinding(binding);
    }
  }

  return next;
}

export function findConflictingAction(
  shortcuts: ShortcutSettings,
  actionId: ShortcutActionId,
  binding: ShortcutBinding,
): ShortcutActionId | null {
  for (const action of SHORTCUT_ACTIONS) {
    if (action.id === actionId) {
      continue;
    }
    if (bindingsEqual(shortcuts[action.id], binding)) {
      return action.id;
    }
  }
  return null;
}

export function shortcutsToAppShortcuts(shortcuts: ShortcutSettings): AppShortcut[] {
  const items = SHORTCUT_ACTIONS.map((action) => ({
    action: action.label,
    keys: formatShortcutBinding(shortcuts[action.id]),
  }));

  items.push({
    action: "Close window",
    keys: formatShortcutBinding(CLOSE_WINDOW_BINDING),
  });

  return items;
}

export const APP_SHORTCUTS: AppShortcut[] = shortcutsToAppShortcuts(
  DEFAULT_SHORTCUT_SETTINGS,
);
