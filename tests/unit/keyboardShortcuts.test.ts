import { describe, expect, it } from "vitest";
import {
  bindingFromKeyboardEvent,
  bindingsEqual,
  DEFAULT_SHORTCUT_SETTINGS,
  findConflictingAction,
  formatShortcutBinding,
  matchesShortcut,
  normalizeShortcutBinding,
  normalizeShortcutSettings,
} from "../../src/core/constants/keyboardShortcuts";

describe("keyboardShortcuts", () => {
  it("matches default run shortcut", () => {
    const event = {
      key: "Enter",
      metaKey: true,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
    } as KeyboardEvent;

    expect(matchesShortcut(event, DEFAULT_SHORTCUT_SETTINGS.run)).toBe(true);
  });

  it("distinguishes new file from new folder", () => {
    const newFileEvent = {
      key: "n",
      metaKey: true,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
    } as KeyboardEvent;
    const newFolderEvent = {
      key: "N",
      metaKey: true,
      ctrlKey: false,
      shiftKey: true,
      altKey: false,
    } as KeyboardEvent;

    expect(matchesShortcut(newFileEvent, DEFAULT_SHORTCUT_SETTINGS.newFile)).toBe(true);
    expect(matchesShortcut(newFileEvent, DEFAULT_SHORTCUT_SETTINGS.newFolder)).toBe(false);
    expect(matchesShortcut(newFolderEvent, DEFAULT_SHORTCUT_SETTINGS.newFolder)).toBe(true);
  });

  it("parses keyboard events into bindings", () => {
    const event = {
      key: "s",
      metaKey: true,
      ctrlKey: false,
      shiftKey: true,
      altKey: false,
    } as KeyboardEvent;

    expect(bindingFromKeyboardEvent(event)).toEqual({
      key: "s",
      mod: true,
      shift: true,
      alt: false,
    });
  });

  it("clears modifiers when re-binding with fewer keys", () => {
    const threeKeyBinding = {
      key: "s",
      mod: true,
      shift: true,
      alt: true,
    };
    const twoKeyEvent = {
      key: "s",
      metaKey: true,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
    } as KeyboardEvent;

    expect(bindingFromKeyboardEvent(twoKeyEvent)).toEqual({
      key: "s",
      mod: true,
      shift: false,
      alt: false,
    });
    expect(normalizeShortcutBinding(bindingFromKeyboardEvent(twoKeyEvent) !)).not.toEqual(
      threeKeyBinding,
    );
  });

  it("detects conflicting shortcuts", () => {
    const conflict = findConflictingAction(DEFAULT_SHORTCUT_SETTINGS, "run", {
      key: "s",
      mod: true,
      shift: false,
      alt: false,
    });

    expect(conflict).toBe("save");
  });

  it("normalizes partial shortcut settings", () => {
    const normalized = normalizeShortcutSettings({
      run: { key: "Enter", mod: true },
    });

    expect(normalized.run).toEqual({
      key: "enter",
      mod: true,
      shift: false,
      alt: false,
    });
    expect(normalized.save).toEqual(DEFAULT_SHORTCUT_SETTINGS.save);
  });

  it("formats bindings for display", () => {
    expect(formatShortcutBinding(DEFAULT_SHORTCUT_SETTINGS.run)).toContain("↵");
    expect(bindingsEqual(DEFAULT_SHORTCUT_SETTINGS.save, DEFAULT_SHORTCUT_SETTINGS.save)).toBe(
      true,
    );
  });
});
