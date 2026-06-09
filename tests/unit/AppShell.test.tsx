import { render, screen, waitFor } from "@testing-library/react";
import { invoke } from "@tauri-apps/api/core";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ENVIRONMENT_CATALOG } from "../../src/core/constants/environmentCatalog";
import { AppShell } from "../../src/components/layout/AppShell";

function mockInstalledEnvironment(id: string, configured = false) {
  const definition = ENVIRONMENT_CATALOG.find((d) => d.id === id)!;
  return {
    definition,
    user_config: { paths: {}, env_vars: {} },
    configured,
    version: null,
  };
}

describe("AppShell", () => {
  beforeEach(() => {
    vi.mocked(invoke).mockImplementation((cmd) => {
      if (cmd === "read_snippet") {
        return Promise.resolve({
          code: 'console.log("Hello, Runspace!");',
          language: "javascript",
          updated_at: "",
        });
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
    expect(screen.getByTestId("output-panel")).toBeInTheDocument();
    expect(screen.getByTestId("status-bar")).toBeInTheDocument();
    expect(screen.getByTestId("environment-select")).toBeInTheDocument();
    expect(screen.getByTestId("run-button")).toBeInTheDocument();
    expect(screen.getByTestId("stop-button")).toBeInTheDocument();
    expect(screen.getByTestId("clear-button")).toBeInTheDocument();
    expect(screen.getByTestId("settings-button")).toBeInTheDocument();
  });
});
