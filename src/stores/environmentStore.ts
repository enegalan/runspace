import { invoke } from "@tauri-apps/api/core";
import { create } from "zustand";
import { DEFAULT_ENVIRONMENT_ID } from "../core/constants/environmentCatalog";
import type {
  Environment,
  EnvironmentDefinition,
  EnvironmentId,
} from "../core/types/environment";

interface EnvironmentStore {
  environments: Environment[];
  available: EnvironmentDefinition[];
  selectedId: EnvironmentId;
  loaded: boolean;
  load: () => Promise<void>;
  select: (id: EnvironmentId) => Promise<void>;
  install: (id: EnvironmentId) => Promise<void>;
  uninstall: (id: EnvironmentId) => Promise<void>;
  refresh: () => Promise<void>;
}

export const useEnvironmentStore = create<EnvironmentStore>((set, get) => ({
  environments: [],
  available: [],
  selectedId: DEFAULT_ENVIRONMENT_ID,
  loaded: false,

  load: async () => {
    const [environments, available, selected] = await Promise.all([
      invoke<Environment[]>("list_environments"),
      invoke<EnvironmentDefinition[]>("list_available_environments"),
      invoke<Environment>("get_selected_environment"),
    ]);
    set({
      environments,
      available,
      selectedId: selected.definition.id as EnvironmentId,
      loaded: true,
    });
  },

  select: async (id) => {
    await invoke("set_selected_environment", { environmentId: id });
    set({ selectedId: id });
    await get().refresh();
  },

  install: async (id) => {
    await invoke("install_environment", { environmentId: id });
    await get().refresh();
    const selected = await invoke<Environment>("get_selected_environment");
    set({ selectedId: selected.definition.id as EnvironmentId });
  },

  uninstall: async (id) => {
    await invoke("uninstall_environment", { environmentId: id });
    const [environments, available, selected] = await Promise.all([
      invoke<Environment[]>("list_environments"),
      invoke<EnvironmentDefinition[]>("list_available_environments"),
      invoke<Environment>("get_selected_environment"),
    ]);
    set({
      environments,
      available,
      selectedId: selected.definition.id as EnvironmentId,
    });
  },

  refresh: async () => {
    const [environments, available] = await Promise.all([
      invoke<Environment[]>("list_environments"),
      invoke<EnvironmentDefinition[]>("list_available_environments"),
    ]);
    set({ environments, available });
  },
}));
