import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_APP_SETTINGS,
  mergeAppSettings,
  normalizeAppSettings,
} from "../../src/core/constants/settingsDefaults";
import { applyAppSettings } from "../../src/core/settings/applyAppSettings";
import { useSettingsStore } from "../../src/stores/settingsStore";

vi.mock("../../src/core/api/runspaceInvoke", () => ({
  runspaceInvoke: vi.fn(),
}));

import { runspaceInvoke } from "../../src/core/api/runspaceInvoke";

const mockedInvoke = vi.mocked(runspaceInvoke);

describe("settingsStore", () => {
  beforeEach(() => {
    mockedInvoke.mockReset();
    useSettingsStore.setState({
      settings: DEFAULT_APP_SETTINGS,
      loaded: false,
    });
  });

  it("loads settings from backend", async () => {
    mockedInvoke.mockResolvedValueOnce({
      ...DEFAULT_APP_SETTINGS,
      execution: { ...DEFAULT_APP_SETTINGS.execution, runTimeoutSecs: 45 },
    });

    await useSettingsStore.getState().load();

    expect(useSettingsStore.getState().settings.execution.runTimeoutSecs).toBe(45);
    expect(useSettingsStore.getState().loaded).toBe(true);
  });

  it("merges partial updates locally", async () => {
    mockedInvoke.mockResolvedValue(DEFAULT_APP_SETTINGS);

    await useSettingsStore.getState().update({
      editor: { tabSize: 4 },
    });

    expect(useSettingsStore.getState().settings.editor.tabSize).toBe(4);
    expect(useSettingsStore.getState().settings.execution.runTimeoutSecs).toBe(30);
  });
});

describe("settingsDefaults", () => {
  it("normalizes out-of-range values", () => {
    const normalized = normalizeAppSettings({
      ...DEFAULT_APP_SETTINGS,
      appearance: { ...DEFAULT_APP_SETTINGS.appearance, editorFontSize: 99 },
      execution: { ...DEFAULT_APP_SETTINGS.execution, runTimeoutSecs: 999 },
    });

    expect(normalized.appearance.editorFontSize).toBe(24);
    expect(normalized.execution.runTimeoutSecs).toBe(300);
  });

  it("merges nested patches", () => {
    const merged = mergeAppSettings(DEFAULT_APP_SETTINGS, {
      layout: { sidebarVisible: false },
    });

    expect(merged.layout.sidebarVisible).toBe(false);
    expect(merged.layout.outputVisible).toBe(true);
  });
});

describe("applyAppSettings", () => {
  it("sets theme and density on document", () => {
    applyAppSettings({
      ...DEFAULT_APP_SETTINGS,
      appearance: {
        ...DEFAULT_APP_SETTINGS.appearance,
        theme: "light",
        uiDensity: "compact",
      },
    });

    expect(document.documentElement.dataset.theme).toBe("light");
    expect(document.documentElement.dataset.density).toBe("compact");
  });
});
