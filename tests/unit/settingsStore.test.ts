import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_APP_SETTINGS,
  mergeAppSettings,
  normalizeAppSettings,
} from "../../src/core/constants/settingsDefaults";
import { applyAppSettings } from "../../src/core/settings/applyAppSettings";
import type { AppSettings } from "../../src/core/types/settings";
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

  it("persists merged layout sizes after rapid panel resizes", async () => {
    vi.useFakeTimers();
    mockedInvoke.mockImplementation(async (_cmd, payload) => {
      return normalizeAppSettings(payload as typeof DEFAULT_APP_SETTINGS);
    });

    await useSettingsStore.getState().update({
      layout: { sidebarWidth: 350 },
    });
    await useSettingsStore.getState().update({
      layout: { outputWidth: 420 },
    });

    await vi.advanceTimersByTimeAsync(300);

    expect(mockedInvoke).toHaveBeenCalledWith(
      "update_settings",
      expect.objectContaining({
        layout: expect.objectContaining({
          sidebarWidth: 350,
          outputWidth: 420,
        }),
      }),
    );

    vi.useRealTimers();
  });

  it("ignores stale persist responses from earlier save cycles", async () => {
    vi.useFakeTimers();
    let resolveFirst: ((value: AppSettings) => void) | undefined;
    const firstPersist = new Promise<AppSettings>((resolve) => {
      resolveFirst = resolve;
    });

    mockedInvoke
      .mockImplementationOnce(() => firstPersist)
      .mockImplementationOnce(async (_cmd, payload) => {
        return normalizeAppSettings(payload as AppSettings);
      });

    await useSettingsStore.getState().update({
      editor: { tabSize: 4 },
    });
    await vi.advanceTimersByTimeAsync(300);

    await useSettingsStore.getState().update({
      editor: { tabSize: 2 },
    });
    await vi.advanceTimersByTimeAsync(300);

    resolveFirst?.({
      ...DEFAULT_APP_SETTINGS,
      editor: { ...DEFAULT_APP_SETTINGS.editor, tabSize: 4 },
    });
    await Promise.resolve();

    expect(useSettingsStore.getState().settings.editor.tabSize).toBe(2);

    vi.useRealTimers();
  });

  it("resets all settings to defaults", async () => {
    useSettingsStore.setState({
      settings: mergeAppSettings(DEFAULT_APP_SETTINGS, {
        appearance: { theme: "light" },
        execution: { runTimeoutSecs: 99 },
        editor: { tabSize: 8 },
      }),
      loaded: true,
    });
    mockedInvoke.mockResolvedValueOnce(DEFAULT_APP_SETTINGS);

    await useSettingsStore.getState().reset();

    expect(useSettingsStore.getState().settings).toEqual(DEFAULT_APP_SETTINGS);
    expect(mockedInvoke).toHaveBeenCalledWith("update_settings", DEFAULT_APP_SETTINGS);
  });
});

describe("settingsDefaults", () => {
  it("normalizes out-of-range values", () => {
    const normalized = normalizeAppSettings({
      ...DEFAULT_APP_SETTINGS,
      appearance: { ...DEFAULT_APP_SETTINGS.appearance, editorFontSize: 99 },
      execution: { ...DEFAULT_APP_SETTINGS.execution, runTimeoutSecs: 999 },
    });

    expect(normalized.appearance.editorFontSize).toBe(20);
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

  it("applies font size and family to the document root", () => {
    applyAppSettings({
      ...DEFAULT_APP_SETTINGS,
      appearance: {
        ...DEFAULT_APP_SETTINGS.appearance,
        editorFontSize: 16,
        editorFontFamily: "Fira Code",
      },
    });

    const styles = getComputedStyle(document.documentElement);
    expect(styles.getPropertyValue("--rs-font-size-md").trim()).toBe("17px");
    expect(styles.getPropertyValue("--rs-font-mono")).toContain("Fira Code");
  });
});
