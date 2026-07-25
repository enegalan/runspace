import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GeneralSettings } from "../../src/components/settings/GeneralSettings";
import { ShortcutsSettings } from "../../src/components/settings/ShortcutsSettings";
import { DEFAULT_APP_SETTINGS } from "../../src/core/constants/settingsDefaults";
import { useSettingsStore } from "../../src/stores/settingsStore";

vi.mock("../../src/core/api/runspaceInvoke", () => ({
  runspaceInvoke: vi.fn(),
}));

describe("GeneralSettings", () => {
  afterEach(() => {
    cleanup();
  });

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
    expect(screen.getByTestId("setting-theme")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dark" })).toBeInTheDocument();
    expect(screen.getByText("Show sidebar")).toBeInTheDocument();
    expect(screen.getByText("Show output panel")).toBeInTheDocument();
  });

  it("filters settings with the search input", () => {
    render(<GeneralSettings />);
    const page = within(screen.getByTestId("general-settings"));

    fireEvent.change(page.getByTestId("general-settings-search"), {
      target: { value: "word wrap" },
    });

    expect(page.queryByText("Appearance")).not.toBeInTheDocument();
    expect(page.getByText("Editor")).toBeInTheDocument();
    expect(page.getByText("Word wrap")).toBeInTheDocument();
    expect(page.getByText("Tab size")).toBeInTheDocument();
  });

  it("finds settings by common label terms", () => {
    render(<GeneralSettings />);
    const page = within(screen.getByTestId("general-settings"));

    fireEvent.change(page.getByTestId("general-settings-search"), {
      target: { value: "ui" },
    });
    expect(page.getByText("Appearance")).toBeInTheDocument();
    expect(page.getByText("UI density")).toBeInTheDocument();

    fireEvent.change(page.getByTestId("general-settings-search"), {
      target: { value: "show" },
    });
    expect(page.getByText("Layout")).toBeInTheDocument();
    expect(page.getByText("Show sidebar")).toBeInTheDocument();
    expect(page.getByText("Show output panel")).toBeInTheDocument();
  });

  it("shows an empty state when search has no matches", () => {
    render(<GeneralSettings />);
    const page = within(screen.getByTestId("general-settings"));

    fireEvent.change(page.getByTestId("general-settings-search"), {
      target: { value: "zzznomatch" },
    });

    expect(page.getByTestId("general-settings-no-results")).toBeInTheDocument();
    expect(page.queryByText("Appearance")).not.toBeInTheDocument();
  });
});

describe("ShortcutsSettings", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    useSettingsStore.setState({
      settings: DEFAULT_APP_SETTINGS,
      loaded: true,
    });
  });

  it("renders shortcut bindings", () => {
    render(<ShortcutsSettings />);

    expect(screen.getByTestId("shortcuts-settings")).toBeInTheDocument();
    expect(screen.getByTestId("shortcuts-reset-defaults")).toBeInTheDocument();
    expect(screen.getByTestId("shortcut-recorder-run")).toBeInTheDocument();
  });
});
