import { create } from "zustand";

export type SettingsTab = "general" | "environments";

interface SettingsUiStore {
  open: boolean;
  tab: SettingsTab;
  openSettings: (tab?: SettingsTab) => void;
  closeSettings: () => void;
  setTab: (tab: SettingsTab) => void;
}

export const useSettingsUiStore = create<SettingsUiStore>((set) => ({
  open: false,
  tab: "general",
  openSettings: (tab = "general") => set({ open: true, tab }),
  closeSettings: () => set({ open: false }),
  setTab: (tab) => set({ tab }),
}));
