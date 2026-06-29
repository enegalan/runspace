import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EnvironmentInstallDialog } from "../../src/components/environment/EnvironmentInstallDialog";
import { useEnvironmentStore } from "../../src/stores/environmentStore";

describe("EnvironmentInstallDialog", () => {
  it("renders while an environment is being installed", () => {
    useEnvironmentStore.setState({
      installingEnvironment: { id: "laravel", name: "Laravel" },
    });

    render(<EnvironmentInstallDialog />);

    expect(screen.getByTestId("environment-install-dialog")).toBeInTheDocument();
    expect(screen.getByText("Preparing Laravel")).toBeInTheDocument();
    expect(
      screen.getByText(/Generating the framework sandbox and installing dependencies/i),
    ).toBeInTheDocument();
  });

  it("renders nothing when no install is in progress", () => {
    useEnvironmentStore.setState({ installingEnvironment: null });

    const { container } = render(<EnvironmentInstallDialog />);

    expect(container).toBeEmptyDOMElement();
  });
});
