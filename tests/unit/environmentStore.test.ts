import { beforeEach, describe, expect, it, vi } from "vitest";
import { runspaceInvoke } from "../../src/core/api/runspaceInvoke";
import {
  TEST_DEFAULT_ENVIRONMENT_ID,
  TEST_ENVIRONMENT_CATALOG,
} from "../fixtures/environmentCatalog";
import { useEnvironmentStore } from "../../src/stores/environmentStore";

function mockInstalledEnvironment(id: string, configured = false) {
  const definition = TEST_ENVIRONMENT_CATALOG.find((d) => d.id === id)!;
  return {
    definition,
    user_config: { paths: {}, env_vars: {} },
    configured,
    version: null,
  };
}

function mockEnvironmentInvoke(handlers: Partial<Record<string, () => Promise<unknown>>>): void {
  vi.mocked(runspaceInvoke).mockImplementation((cmd) => {
    const handler = handlers[cmd];
    if (handler) {
      return handler();
    }
    if (cmd === "get_default_environment_id") {
      return Promise.resolve(TEST_DEFAULT_ENVIRONMENT_ID);
    }
    return Promise.resolve(undefined);
  });
}

describe("environmentStore", () => {
  beforeEach(() => {
    useEnvironmentStore.setState({
      environments: [],
      available: [],
      selectedId: null,
      defaultEnvironmentId: null,
      loaded: false,
    });
    vi.mocked(runspaceInvoke).mockReset();
  });

  it("loads installed and available environments", async () => {
    const installed = [mockInstalledEnvironment("nodejs")];
    const available: typeof TEST_ENVIRONMENT_CATALOG = [];
    mockEnvironmentInvoke({
      list_environments: () => Promise.resolve(installed),
      list_available_environments: () => Promise.resolve(available),
      get_selected_environment: () => Promise.resolve(mockInstalledEnvironment("nodejs")),
    });

    await useEnvironmentStore.getState().load();

    expect(useEnvironmentStore.getState().loaded).toBe(true);
    expect(useEnvironmentStore.getState().environments).toHaveLength(1);
    expect(useEnvironmentStore.getState().available).toHaveLength(0);
    expect(useEnvironmentStore.getState().selectedId).toBe("nodejs");
    expect(useEnvironmentStore.getState().defaultEnvironmentId).toBe(TEST_DEFAULT_ENVIRONMENT_ID);
  });

  it("loads with no installed environments", async () => {
    mockEnvironmentInvoke({
      list_environments: () => Promise.resolve([]),
      list_available_environments: () => Promise.resolve(TEST_ENVIRONMENT_CATALOG),
      get_selected_environment: () => Promise.resolve(null),
    });

    await useEnvironmentStore.getState().load();

    expect(useEnvironmentStore.getState().environments).toHaveLength(0);
    expect(useEnvironmentStore.getState().available).toHaveLength(TEST_ENVIRONMENT_CATALOG.length);
    expect(useEnvironmentStore.getState().selectedId).toBeNull();
    expect(useEnvironmentStore.getState().defaultEnvironmentId).toBe(TEST_DEFAULT_ENVIRONMENT_ID);
  });

  it("refreshes installed and available lists", async () => {
    mockEnvironmentInvoke({
      list_environments: () => Promise.resolve([mockInstalledEnvironment("nodejs", true)]),
      list_available_environments: () => Promise.resolve([]),
    });

    await useEnvironmentStore.getState().refresh();

    expect(useEnvironmentStore.getState().environments).toHaveLength(1);
    expect(useEnvironmentStore.getState().available).toHaveLength(0);
    expect(useEnvironmentStore.getState().defaultEnvironmentId).toBe(TEST_DEFAULT_ENVIRONMENT_ID);
  });
});
