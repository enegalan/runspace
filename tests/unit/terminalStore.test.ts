import { describe, expect, it } from "vitest";
import { useTerminalStore } from "../../src/stores/terminalStore";
import { terminalContextKey } from "../../src/core/types/terminal";

describe("terminalStore", () => {
  it("tracks multiple tabs per workspace and environment context", () => {
    useTerminalStore.setState({
      tabs: {},
      tabOrderByContext: {},
      activeTabIdByContext: {},
    });

    const store = useTerminalStore.getState();
    const firstTabId = store.addTab("ws-1", "nodejs");
    const secondTabId = store.addTab("ws-1", "nodejs");

    store.setSession(firstTabId, "session-1");
    store.setSession(secondTabId, "session-2");

    const tabs = store.getTabsForContext("ws-1", "nodejs");
    expect(tabs).toHaveLength(2);
    expect(tabs[0]?.sessionId).toBe("session-1");
    expect(tabs[1]?.sessionId).toBe("session-2");
    expect(
      useTerminalStore.getState().activeTabIdByContext[terminalContextKey("ws-1", "nodejs")],
    ).toBe(secondTabId);
    expect(terminalContextKey("ws-1", "nodejs")).toBe("ws-1:nodejs");
  });

  it("marks session as exited and removes tab on demand", () => {
    useTerminalStore.setState({
      tabs: {},
      tabOrderByContext: {},
      activeTabIdByContext: {},
    });
    const store = useTerminalStore.getState();
    const tabId = store.addTab("ws-1", "php");
    store.setSession(tabId, "session-php");
    store.setExited("session-php");

    expect(store.getTab(tabId)?.status).toBe("exited");

    store.removeTab(tabId);
    expect(store.getTab(tabId)).toBeUndefined();
    expect(store.getTabsForContext("ws-1", "php")).toHaveLength(0);
  });

  it("creates a default tab when context has none", () => {
    useTerminalStore.setState({
      tabs: {},
      tabOrderByContext: {},
      activeTabIdByContext: {},
    });

    const tabId = useTerminalStore.getState().ensureDefaultTab("ws-2", "laravel");
    const tabs = useTerminalStore.getState().getTabsForContext("ws-2", "laravel");

    expect(tabId).toBeTruthy();
    expect(tabs).toHaveLength(1);
    expect(tabs[0]?.tabId).toBe(tabId);
  });
});
