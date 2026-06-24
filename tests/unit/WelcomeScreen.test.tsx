import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WelcomeScreen } from "../../src/components/welcome/WelcomeScreen";
import {
  TEST_DEFAULT_ENVIRONMENT_ID,
  TEST_ENVIRONMENT_CATALOG,
} from "../fixtures/environmentCatalog";
import { useEnvironmentStore } from "../../src/stores/environmentStore";
import { useWorkspaceStore } from "../../src/stores/workspaceStore";

function mockInstalledEnvironment(id: string, configured = true) {
  const definition = TEST_ENVIRONMENT_CATALOG.find((item) => item.id === id)!;
  return {
    definition,
    user_config: {
      paths: configured ? { node_path: "/usr/local/bin/node" } : {},
      env_vars: {},
    },
    configured,
    version: configured ? "v22.0.0" : null,
  };
}

describe("WelcomeScreen", () => {
  beforeEach(() => {
    useEnvironmentStore.setState({
      environments: [mockInstalledEnvironment("nodejs")],
      available: TEST_ENVIRONMENT_CATALOG.filter((definition) => definition.id !== "nodejs"),
      selectedId: "nodejs",
      defaultEnvironmentId: TEST_DEFAULT_ENVIRONMENT_ID,
      loaded: true,
    });
    useWorkspaceStore.setState({
      onboardingRequired: true,
      onboardingComplete: false,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("walks through onboarding steps", () => {
    render(<WelcomeScreen />);

    expect(screen.getByText("Welcome to Runspace")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Get started" }));

    expect(screen.getByText("How Runspace works")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Create my first workspace" }));

    expect(screen.getByText("Create your first workspace")).toBeInTheDocument();
    expect(
      screen.getByText(/Runspace needs at least one workspace to open the editor/i),
    ).toBeInTheDocument();
  });
});
