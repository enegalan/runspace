import { create } from "zustand";
import { runspaceInvoke } from "../core/api/runspaceInvoke";
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
    try {
      const [environments, available, selected] = await Promise.all([
        runspaceInvoke<Environment[]>("list_environments"),
        runspaceInvoke<EnvironmentDefinition[]>("list_available_environments"),
        runspaceInvoke<Environment>("get_selected_environment"),
      ]);
      set({
        environments,
        available,
        selectedId: selected.definition.id as EnvironmentId,
        loaded: true,
      });
    } catch {
      set({ loaded: true });
    }
  },

  select: async (id) => {
    await runspaceInvoke("set_selected_environment", { environmentId: id });
    set({ selectedId: id });
    await get().refresh();
  },

  install: async (id) => {
    await runspaceInvoke("install_environment", { environmentId: id });
    await get().refresh();
    const selected = await runspaceInvoke<Environment>("get_selected_environment");
    set({ selectedId: selected.definition.id as EnvironmentId });
  },

  uninstall: async (id) => {
    await runspaceInvoke("uninstall_environment", { environmentId: id });
    const [environments, available, selected] = await Promise.all([
      runspaceInvoke<Environment[]>("list_environments"),
      runspaceInvoke<EnvironmentDefinition[]>("list_available_environments"),
      runspaceInvoke<Environment>("get_selected_environment"),
    ]);
    set({
      environments,
      available,
      selectedId: selected.definition.id as EnvironmentId,
    });
  },

  refresh: async () => {
    const [environments, available] = await Promise.all([
      runspaceInvoke<Environment[]>("list_environments"),
      runspaceInvoke<EnvironmentDefinition[]>("list_available_environments"),
    ]);
    set({ environments, available });
  },
}));
