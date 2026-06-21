import { applyAppSettings } from "../core/settings/applyAppSettings";
import { runspaceInvoke } from "../core/api/runspaceInvoke";
import { shouldUseHttpApi } from "../core/api/backendTransport";
import {
  DEFAULT_APP_SETTINGS,
  mergeAppSettings,
  normalizeAppSettings,
} from "../core/constants/settingsDefaults";
import type { AppSettings, AppSettingsPatch } from "../core/types/settings";
import { create } from "zustand";

interface SettingsStore {
  settings: AppSettings;
  loaded: boolean;
  load: () => Promise<void>;
  update: (patch: AppSettingsPatch) => Promise<void>;
  reset: () => Promise<void>;
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

async function persistSettings(settings: AppSettingsPatch | AppSettings): Promise<AppSettings> {
  const payload = settings as unknown as Record<string, unknown>;
  const args = shouldUseHttpApi() ? payload : { patch: payload };
  return runspaceInvoke<AppSettings>("update_settings", args);
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: DEFAULT_APP_SETTINGS,
  loaded: false,

  load: async () => {
    try {
      const settings = normalizeAppSettings(await runspaceInvoke<AppSettings>("read_settings"));
      set({ settings, loaded: true });
      applyAppSettings(settings);
    } catch {
      set({ settings: DEFAULT_APP_SETTINGS, loaded: true });
      applyAppSettings(DEFAULT_APP_SETTINGS);
    }
  },

  update: async (patch) => {
    const next = mergeAppSettings(get().settings, patch);
    set({ settings: next });
    if (patch.appearance !== undefined) {
      applyAppSettings(next);
    }

    if (saveTimer) {
      clearTimeout(saveTimer);
    }

    saveTimer = setTimeout(() => {
      saveTimer = null;
      void persistSettings(get().settings)
        .then((saved) => {
          set({ settings: normalizeAppSettings(saved) });
        })
        .catch(() => {
          // Keep local state when persistence fails.
        });
    }, 300);
  },

  reset: async () => {
    if (saveTimer) {
      clearTimeout(saveTimer);
      saveTimer = null;
    }

    const next = normalizeAppSettings(DEFAULT_APP_SETTINGS);
    set({ settings: next });
    applyAppSettings(next);

    try {
      const saved = normalizeAppSettings(await persistSettings(DEFAULT_APP_SETTINGS));
      set({ settings: saved });
      applyAppSettings(saved);
    } catch {
      // Keep local defaults when persistence fails.
    }
  },
}));

export function getAppSettings(): AppSettings {
  return useSettingsStore.getState().settings;
}
