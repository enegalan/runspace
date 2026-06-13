import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearOnboardingComplete } from "../../src/core/onboarding/onboardingState";
import { AppShell } from "../../src/components/layout/AppShell";
import { runspaceInvoke } from "../../src/core/api/runspaceInvoke";
import { ENVIRONMENT_CATALOG } from "../../src/core/constants/environmentCatalog";
import { useEditorTabsStore } from "../../src/stores/editorTabsStore";
import { useSettingsStore } from "../../src/stores/settingsStore";
import { DEFAULT_APP_SETTINGS } from "../../src/core/constants/settingsDefaults";
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
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    clearOnboardingComplete();
    useWorkspaceStore.setState({
      workspace: null,
      workspaces: [],
      rootFiles: [],
      expandedDirs: new Set(),
      loaded: false,
      onboardingRequired: false,
      onboardingComplete: false,
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
    useSettingsStore.setState({
      settings: DEFAULT_APP_SETTINGS,
      loaded: false,
    });

    vi.mocked(runspaceInvoke).mockImplementation((cmd) => {
      if (cmd === "read_settings") {
        return Promise.resolve(DEFAULT_APP_SETTINGS);
      }
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
      if (cmd === "spawn_terminal") {
        return Promise.resolve({
          sessionId: "session-test",
          workspaceId: "ws-test",
          environmentId: "nodejs",
        });
      }
      return Promise.resolve(undefined);
    });
  });

  it("renders all layout zones", async () => {
    render(<AppShell />);

    await waitFor(() => {
      expect(screen.getByTestId("activity-bar")).toBeInTheDocument();
    });

    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("editor-area")).toBeInTheDocument();
    expect(screen.getByTestId("file-tree")).toBeInTheDocument();
    expect(screen.getByTestId("environment-indicator")).toBeInTheDocument();
    expect(screen.getByTestId("workspace-switcher")).toBeInTheDocument();
    expect(screen.getByTestId("editor-tabs")).toBeInTheDocument();
    expect(screen.getByTestId("output-panel")).toBeInTheDocument();
    expect(screen.getByTestId("terminal-panel")).toBeInTheDocument();
    expect(screen.getByTestId("terminal-toggle-button")).toBeInTheDocument();
    expect(screen.getByTestId("status-bar")).toBeInTheDocument();
    expect(screen.getByTestId("activity-bar")).toBeInTheDocument();
    expect(screen.getByTestId("run-button")).toBeDisabled();
    expect(screen.getByTestId("stop-button")).toBeInTheDocument();
    expect(screen.getByTestId("clear-button")).toBeInTheDocument();
    expect(screen.getByTestId("settings-button")).toBeInTheDocument();
  });

  it("shows welcome onboarding when no projects exist", async () => {
    vi.mocked(runspaceInvoke).mockReset();
    vi.mocked(runspaceInvoke).mockImplementation((cmd) => {
      if (cmd === "read_settings") {
        return Promise.resolve(DEFAULT_APP_SETTINGS);
      }
      if (cmd === "list_environments") {
        return Promise.resolve([mockInstalledEnvironment("nodejs", true)]);
      }
      if (cmd === "list_available_environments") {
        return Promise.resolve(
          ENVIRONMENT_CATALOG.filter((definition) => definition.id !== "nodejs"),
        );
      }
      if (cmd === "get_selected_environment") {
        return Promise.resolve(mockInstalledEnvironment("nodejs", true));
      }
      if (cmd === "list_workspaces") {
        return Promise.resolve([]);
      }
      if (cmd === "read_session") {
        return Promise.resolve({ environments: {}, last_runtime_id: "nodejs" });
      }
      return Promise.resolve(undefined);
    });

    render(<AppShell />);

    await waitFor(() => {
      expect(screen.getByTestId("welcome-screen")).toBeInTheDocument();
    });

    expect(screen.getByText("Welcome to Runspace")).toBeInTheDocument();
    expect(screen.queryByTestId("activity-bar")).not.toBeInTheDocument();
  });

  it("shows the main shell when onboarding was already completed", async () => {
    localStorage.setItem("runspace.onboarding.complete", "1");
    useWorkspaceStore.setState({ onboardingComplete: true });

    vi.mocked(runspaceInvoke).mockReset();
    vi.mocked(runspaceInvoke).mockImplementation((cmd) => {
      if (cmd === "read_settings") {
        return Promise.resolve(DEFAULT_APP_SETTINGS);
      }
      if (cmd === "list_environments") {
        return Promise.resolve([mockInstalledEnvironment("nodejs", true)]);
      }
      if (cmd === "list_available_environments") {
        return Promise.resolve([]);
      }
      if (cmd === "get_selected_environment") {
        return Promise.resolve(mockInstalledEnvironment("nodejs", true));
      }
      if (cmd === "list_workspaces") {
        return Promise.resolve([]);
      }
      if (cmd === "read_session") {
        return Promise.resolve({ environments: {}, last_runtime_id: "nodejs" });
      }
      return Promise.resolve(undefined);
    });

    render(<AppShell />);

    await waitFor(() => {
      expect(screen.getByTestId("activity-bar")).toBeInTheDocument();
    });

    expect(screen.queryByTestId("welcome-screen")).not.toBeInTheDocument();
    expect(screen.getByText("No project open")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create project" })).toBeInTheDocument();
  });

  it("keeps the main shell visible after deleting the last project", async () => {
    localStorage.setItem("runspace.onboarding.complete", "1");
    useWorkspaceStore.setState({
      workspace: mockWorkspace,
      workspaces: [mockWorkspace],
      loaded: true,
      onboardingComplete: true,
      onboardingRequired: false,
    });
    useEditorTabsStore.setState({
      openFiles: [],
      activePath: null,
      loaded: true,
    });
    useEnvironmentStore.setState({
      environments: [mockInstalledEnvironment("nodejs", true)],
      available: [],
      selectedId: "nodejs",
      loaded: true,
    });

    vi.mocked(runspaceInvoke).mockImplementation((cmd) => {
      if (cmd === "read_settings") {
        return Promise.resolve(DEFAULT_APP_SETTINGS);
      }
      if (cmd === "list_environments") {
        return Promise.resolve([mockInstalledEnvironment("nodejs", true)]);
      }
      if (cmd === "list_available_environments") {
        return Promise.resolve([]);
      }
      if (cmd === "get_selected_environment") {
        return Promise.resolve(mockInstalledEnvironment("nodejs", true));
      }
      if (cmd === "list_workspaces") {
        return Promise.resolve([]);
      }
      if (cmd === "read_session") {
        return Promise.resolve({
          environments: {},
          last_runtime_id: "nodejs",
          onboarding_complete: true,
        });
      }
      if (cmd === "delete_workspace") {
        return Promise.resolve(undefined);
      }
      if (cmd === "write_session") {
        return Promise.resolve(undefined);
      }
      if (cmd === "set_selected_environment") {
        return Promise.resolve(undefined);
      }
      if (cmd === "spawn_terminal") {
        return Promise.resolve({
          sessionId: "session-test",
          workspaceId: mockWorkspace.id,
          environmentId: "nodejs",
        });
      }
      return Promise.resolve(undefined);
    });

    render(<AppShell />);

    await waitFor(() => {
      expect(screen.getByTestId("activity-bar")).toBeInTheDocument();
    });

    await useWorkspaceStore.getState().deleteProject(mockWorkspace.id);

    await waitFor(() => {
      expect(screen.getByText("No project open")).toBeInTheDocument();
    });

    expect(screen.queryByTestId("welcome-screen")).not.toBeInTheDocument();
    expect(screen.getByTestId("activity-bar")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create project" })).toBeInTheDocument();
    expect(screen.getByTestId("run-button")).toBeDisabled();
  });
});
