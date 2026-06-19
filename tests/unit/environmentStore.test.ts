import { beforeEach, describe, expect, it, vi } from "vitest";
import { runspaceInvoke } from "../../src/core/api/runspaceInvoke";
import { ENVIRONMENT_CATALOG } from "../../src/core/constants/environmentCatalog";
import { useEnvironmentStore } from "../../src/stores/environmentStore";

function mockInstalledEnvironment(id: string, configured = false) {
  const definition = ENVIRONMENT_CATALOG.find((d) => d.id === id) !;
  return {
    definition,
    user_config: { paths: {}, env_vars: {} },
    configured,
    version: null,
  };
}

describe("environmentStore", () => {
  beforeEach(() => {
    useEnvironmentStore.setState({
      environments: [],
      available: [],
      selectedId: "nodejs",
      loaded: false,
    });
    vi.mocked(runspaceInvoke).mockReset();
  });

  it("loads installed and available environments", async () => {
    const installed = [mockInstalledEnvironment("nodejs")];
    const available: typeof ENVIRONMENT_CATALOG = [];
    vi.mocked(runspaceInvoke).mockImplementation((cmd) => {
      if (cmd === "list_environments") {
        return Promise.resolve(installed);
      }
      if (cmd === "list_available_environments") {
        return Promise.resolve(available);
      }
      if (cmd === "get_selected_environment") {
        return Promise.resolve(mockInstalledEnvironment("nodejs"));
      }
      return Promise.resolve(undefined);
    });

    await useEnvironmentStore.getState().load();

    expect(useEnvironmentStore.getState().loaded).toBe(true);
    expect(useEnvironmentStore.getState().environments).toHaveLength(1);
    expect(useEnvironmentStore.getState().available).toHaveLength(0);
    expect(useEnvironmentStore.getState().selectedId).toBe("nodejs");
  });

  it("loads with no installed environments", async () => {
    vi.mocked(runspaceInvoke).mockImplementation((cmd) => {
      if (cmd === "list_environments") {
        return Promise.resolve([]);
      }
      if (cmd === "list_available_environments") {
        return Promise.resolve(ENVIRONMENT_CATALOG);
      }
      if (cmd === "get_selected_environment") {
        return Promise.resolve(null);
      }
      return Promise.resolve(undefined);
    });

    await useEnvironmentStore.getState().load();

    expect(useEnvironmentStore.getState().environments).toHaveLength(0);
    expect(useEnvironmentStore.getState().available).toHaveLength(ENVIRONMENT_CATALOG.length);
    expect(useEnvironmentStore.getState().selectedId).toBeNull();
  });

  it("refreshes installed and available lists", async () => {
    vi.mocked(runspaceInvoke).mockImplementation((cmd) => {
      if (cmd === "list_environments") {
        return Promise.resolve([mockInstalledEnvironment("nodejs", true)]);
      }
      if (cmd === "list_available_environments") {
        return Promise.resolve([]);
      }
      return Promise.resolve(undefined);
    });

    await useEnvironmentStore.getState().refresh();

    expect(useEnvironmentStore.getState().environments).toHaveLength(1);
    expect(useEnvironmentStore.getState().available).toHaveLength(0);
  });
});
