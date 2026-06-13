import { render, screen, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TerminalPanel } from "../../src/components/terminal/TerminalPanel";
import { useTerminalStore } from "../../src/stores/terminalStore";

vi.mock("../../src/components/terminal/TerminalTabView", () => ({
  TerminalTabView: ({ tabId }: { tabId: string }) => (
    <div data-testid={`terminal-tab-view-${tabId}`} />
  ),
}));

describe("TerminalPanel", () => {
  beforeEach(() => {
    useTerminalStore.setState({
      tabs: {},
      tabOrderByContext: {},
      activeTabIdByContext: {},
    });
  });

  it("shows placeholder when environment is not configured", () => {
    render(
      <TerminalPanel
        height={200}
        onHeightChange={() => {}}
        workspaceId="ws-1"
        environmentId="nodejs"
        configured={false}
        disabledReason="Configure in Settings → Environments"
      />,
    );

    expect(screen.getByTestId("terminal-placeholder")).toHaveTextContent(
      "Configure in Settings → Environments",
    );
  });

  it("supports multiple terminal tabs in the same environment", () => {
    render(
      <TerminalPanel
        height={200}
        onHeightChange={() => {}}
        workspaceId="ws-1"
        environmentId="nodejs"
        configured
      />,
    );

    expect(screen.getByTestId("terminal-tabs")).toBeInTheDocument();
    expect(screen.getByTestId("terminal-tab-1")).toBeInTheDocument();
    expect(screen.queryByTestId("terminal-tab-close-1")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("terminal-new-tab-button"));

    expect(screen.getByTestId("terminal-tab-1")).toBeInTheDocument();
    expect(screen.getByTestId("terminal-tab-2")).toBeInTheDocument();
    expect(screen.getByTestId("terminal-tab-close-1")).toBeInTheDocument();
    expect(screen.getByTestId("terminal-tab-close-2")).toBeInTheDocument();
    expect(useTerminalStore.getState().getTabsForContext("ws-1", "nodejs")).toHaveLength(2);
  });
});
