import { create } from "zustand";
import { runspaceInvoke } from "../core/api/runspaceInvoke";
import type { Environment, EnvironmentDefinition, EnvironmentId } from "../core/types/environment";
import { useEditorTabsStore } from "./editorTabsStore";
import { useWorkspaceStore } from "./workspaceStore";

interface EnvironmentStore {
  environments: Environment[];
  available: EnvironmentDefinition[];
  selectedId: EnvironmentId | null;
  defaultEnvironmentId: EnvironmentId | null;
  loaded: boolean;
  load: () => Promise<void>;
  select: (id: EnvironmentId) => Promise<void>;
  install: (id: EnvironmentId) => Promise<void>;
  uninstall: (id: EnvironmentId) => Promise<void>;
  refresh: () => Promise<void>;
}

type EnvironmentState = Pick<
  EnvironmentStore,
  "environments" | "available" | "selectedId" | "defaultEnvironmentId"
>;

/**
 * The selectedIdFrom function.
 * @param selected - The selected environment.
 * @returns The selected ID.
 */
function selectedIdFrom(selected: Environment | null): EnvironmentId | null {
  return (selected?.definition.id as EnvironmentId | undefined) ?? null;
}

/**
 * The fetchEnvironmentState function.
 * @returns The environment state.
 */
async function fetchEnvironmentState(): Promise<EnvironmentState> {
  const [environments, available, selected, defaultEnvironmentId] = await Promise.all([
    runspaceInvoke<Environment[]>("list_environments"),
    runspaceInvoke<EnvironmentDefinition[]>("list_available_environments"),
    runspaceInvoke<Environment | null>("get_selected_environment"),
    runspaceInvoke<EnvironmentId>("get_default_environment_id"),
  ]);

  return {
    environments,
    available,
    selectedId: selectedIdFrom(selected),
    defaultEnvironmentId,
  };
}

/**
 * The useEnvironmentStore hook.
 * @returns The useEnvironmentStore hook.
 */
export const useEnvironmentStore = create<EnvironmentStore>((set, get) => ({
  environments: [],
  available: [],
  selectedId: null,
  defaultEnvironmentId: null,
  loaded: false,

  load: async () => {
    try {
      set({ ...(await fetchEnvironmentState()), loaded: true });
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
    const state = await fetchEnvironmentState();
    set({ ...state, selectedId: state.selectedId ?? id });
  },

  uninstall: async (id) => {
    const resetWorkspace = useWorkspaceStore.getState().workspace?.runtime_id === id;

    await runspaceInvoke("uninstall_environment", { environmentId: id });
    set(await fetchEnvironmentState());

    if (resetWorkspace) {
      useEditorTabsStore.getState().clearTabs();
      await useWorkspaceStore.getState().initialize(get().selectedId);
    }
  },

  refresh: async () => {
    const { environments, available, defaultEnvironmentId } = await fetchEnvironmentState();
    set({ environments, available, defaultEnvironmentId });
  },
}));
