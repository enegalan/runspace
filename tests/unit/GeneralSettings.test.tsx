import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GeneralSettings } from "../../src/components/settings/GeneralSettings";
import { DEFAULT_APP_SETTINGS } from "../../src/core/constants/settingsDefaults";
import { useSettingsStore } from "../../src/stores/settingsStore";

vi.mock("../../src/core/api/runspaceInvoke", () => ({
  runspaceInvoke: vi.fn(),
}));

describe("GeneralSettings", () => {
  beforeEach(() => {
    useSettingsStore.setState({
      settings: DEFAULT_APP_SETTINGS,
      loaded: true,
    });
  });

  it("renders all settings sections", () => {
    render(<GeneralSettings />);

    expect(screen.getByTestId("general-settings")).toBeInTheDocument();
    expect(screen.getByText("Appearance")).toBeInTheDocument();
    expect(screen.getByText("Editor")).toBeInTheDocument();
    expect(screen.getByText("Execution")).toBeInTheDocument();
    expect(screen.getByText("Layout")).toBeInTheDocument();
    expect(screen.getByText("Keyboard shortcuts")).toBeInTheDocument();
    expect(screen.getByTestId("shortcuts-reset-defaults")).toBeInTheDocument();
    expect(screen.getByTestId("shortcut-recorder-run")).toBeInTheDocument();
    expect(screen.getByTestId("setting-theme")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dark" })).toBeInTheDocument();
    expect(screen.getByText("Show sidebar")).toBeInTheDocument();
    expect(screen.getByText("Show output panel")).toBeInTheDocument();
  });
});
