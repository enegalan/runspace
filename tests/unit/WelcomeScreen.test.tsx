import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WelcomeScreen } from "../../src/components/welcome/WelcomeScreen";
import { ENVIRONMENT_CATALOG } from "../../src/core/constants/environmentCatalog";
import { useEnvironmentStore } from "../../src/stores/environmentStore";
import { useWorkspaceStore } from "../../src/stores/workspaceStore";

function mockInstalledEnvironment(id: string, configured = true) {
  const definition = ENVIRONMENT_CATALOG.find((item) => item.id === id)!;
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
      available: ENVIRONMENT_CATALOG.filter((definition) => definition.id !== "nodejs"),
      selectedId: "nodejs",
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
    fireEvent.click(screen.getByRole("button", { name: "Create my first project" }));

    expect(screen.getByText("Create your first project")).toBeInTheDocument();
    expect(
      screen.getByText(/Runspace needs at least one project to open the editor/i),
    ).toBeInTheDocument();
  });
});
