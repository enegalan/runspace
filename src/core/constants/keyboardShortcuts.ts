import type {
  ShortcutActionId,
  ShortcutActionMeta,
  ShortcutBinding,
  ShortcutSettings,
} from "../types/shortcuts";
import { isMacOS } from "../platform/windowChrome";

export interface AppShortcut {
  action: string;
  keys: string[];
}

/**
 * The shortcut actions.
 * @returns The shortcut actions.
 */
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

/**
 * The default shortcut settings.
 * @returns The default shortcut settings.
 */
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

/**
 * Normalizes the given shortcut key.
 * @param key - The key to normalize.
 * @returns The normalized key.
 */
export function normalizeShortcutKey(key: string): string {
  if (key === "Enter") {
    return "enter";
  }
  return key.toLowerCase();
}

/**
 * Checks if the given bindings are equal.
 * @param a - The first binding.
 * @param b - The second binding.
 * @returns `true` if the bindings are equal, `false` otherwise.
 */
export function bindingsEqual(a: ShortcutBinding, b: ShortcutBinding): boolean {
  return a.key === b.key && a.mod === b.mod && a.shift === b.shift && a.alt === b.alt;
}

/**
 * Normalizes the given shortcut binding.
 * @param binding - The binding to normalize.
 * @returns The normalized binding.
 */
export function normalizeShortcutBinding(binding: ShortcutBinding): ShortcutBinding {
  return {
    key: normalizeShortcutKey(binding.key),
    mod: binding.mod,
    shift: binding.shift ?? false,
    alt: binding.alt ?? false,
  };
}

/**
 * Converts the given keyboard event into a shortcut binding.
 * @param event - The keyboard event to convert.
 * @returns The shortcut binding.
 */
export function bindingFromKeyboardEvent(event: KeyboardEvent): ShortcutBinding | null {
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

/**
 * Checks if the given keyboard event matches the given shortcut binding.
 * @param event - The keyboard event to check.
 * @param binding - The shortcut binding to check.
 * @returns `true` if the keyboard event matches the shortcut binding, `false` otherwise.
 */
export function matchesShortcut(event: KeyboardEvent, binding: ShortcutBinding): boolean {
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

/**
 * Formats the given key label.
 * @param key - The key to format.
 * @returns The formatted key label.
 */
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

/**
 * Formats the given shortcut binding.
 * @param binding - The shortcut binding to format.
 * @returns The formatted shortcut binding.
 */
export function formatShortcutBinding(binding: ShortcutBinding): string[] {
  const modLabel = isMacOS() ? "⌘" : "Ctrl";
  const keys: string[] = [];
  if (binding.mod) {
    keys.push(modLabel);
  }
  if (binding.shift) {
    keys.push("Shift");
  }
  if (binding.alt) {
    keys.push(isMacOS() ? "⌥" : "Alt");
  }
  keys.push(formatKeyLabel(binding.key));
  return keys;
}

/**
 * Formats the given shortcut binding in compact form.
 * @param binding - The shortcut binding to format.
 * @returns The formatted shortcut binding.
 */
export function formatShortcutCompact(binding: ShortcutBinding): string {
  if (isMacOS()) {
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

/**
 * Normalizes the given shortcut settings.
 * @param shortcuts - The shortcut settings to normalize.
 * @returns The normalized shortcut settings.
 */
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

/**
 * Finds the conflicting action for the given shortcut settings.
 * @param shortcuts - The shortcut settings to find the conflicting action for.
 * @param actionId - The action ID to find the conflicting action for.
 * @param binding - The binding to find the conflicting action for.
 * @returns The conflicting action ID, or `null` if there is no conflicting action.
 */
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

/**
 * Converts the given shortcut settings to app shortcuts.
 * @param shortcuts - The shortcut settings to convert.
 * @returns The app shortcuts.
 */
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
