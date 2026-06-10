import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppShell } from "../../src/components/layout/AppShell";
import { runspaceInvoke } from "../../src/core/api/runspaceInvoke";
import { ENVIRONMENT_CATALOG } from "../../src/core/constants/environmentCatalog";
import { useEditorTabsStore } from "../../src/stores/editorTabsStore";
import { useEnvironmentStore } from "../../src/stores/environmentStore";
import { useWorkspaceStore } from "../../src/stores/workspaceStore";

function mockInstalledEnvironment(id: string, configured = false) {
  const definition = ENVIRONMENT_CATALOG.find((d) => d.id === id)!;
  return {
    definition,
    user_config: { paths: {}, env_vars: {} },
    configured,
    version: null,
  };
}

const mockWorkspace = {
  id: "ws-test",
  name: "Untitled",
  runtime_id: "nodejs",
  entry_file: "main.js",
};

describe("AppShell", () => {
  beforeEach(() => {
    useWorkspaceStore.setState({
      workspace: null,
      workspaces: [],
      rootFiles: [],
      expandedDirs: new Set(),
      loaded: false,
    });
    useEditorTabsStore.setState({
      openFiles: [],
      activePath: null,
      loaded: false,
    });
    useEnvironmentStore.setState({
      environments: [],
      available: [],
      selectedId: "nodejs",
      loaded: false,
    });

    vi.mocked(runspaceInvoke).mockImplementation((cmd) => {
      if (cmd === "list_environments") {
        return Promise.resolve([mockInstalledEnvironment("nodejs")]);
      }
      if (cmd === "list_available_environments") {
        return Promise.resolve([]);
      }
      if (cmd === "get_selected_environment") {
        return Promise.resolve(mockInstalledEnvironment("nodejs"));
      }
      if (cmd === "initialize_workspace") {
        return Promise.resolve(mockWorkspace);
      }
      if (cmd === "list_workspaces") {
        return Promise.resolve([mockWorkspace]);
      }
      if (cmd === "list_files") {
        return Promise.resolve([
          { name: "main.js", path: "main.js", is_directory: false },
        ]);
      }
      if (cmd === "read_session") {
        return Promise.resolve({ environments: {}, last_runtime_id: "nodejs" });
      }
      if (cmd === "set_selected_environment") {
        return Promise.resolve(undefined);
      }
      if (cmd === "read_file") {
        return Promise.resolve('console.log("Hello, Runspace!");');
      }
      if (cmd === "write_session") {
        return Promise.resolve(undefined);
      }
      return Promise.resolve(undefined);
    });
  });

  it("renders all layout zones", async () => {
    render(<AppShell />);

    await waitFor(() => {
      expect(screen.getByTestId("toolbar")).toBeInTheDocument();
    });

    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("editor-area")).toBeInTheDocument();
    expect(screen.getByTestId("file-tree")).toBeInTheDocument();
    expect(screen.getByTestId("environment-indicator")).toBeInTheDocument();
    expect(screen.getByTestId("workspace-switcher")).toBeInTheDocument();
    expect(screen.getByTestId("editor-tabs")).toBeInTheDocument();
    expect(screen.getByTestId("output-panel")).toBeInTheDocument();
    expect(screen.getByTestId("status-bar")).toBeInTheDocument();
    expect(screen.getByTestId("environment-select")).toBeInTheDocument();
    expect(screen.getByTestId("run-button")).toBeInTheDocument();
    expect(screen.getByTestId("stop-button")).toBeInTheDocument();
    expect(screen.getByTestId("clear-button")).toBeInTheDocument();
    expect(screen.getByTestId("settings-button")).toBeInTheDocument();
  });
});
