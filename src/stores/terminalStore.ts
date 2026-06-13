import { create } from "zustand";
import type { TerminalStatus } from "../core/types/terminal";
import {
  createTerminalTabId,
  terminalContextKey,
} from "../core/types/terminal";

export interface TerminalTabState {
  tabId: string;
  sessionId: string;
  workspaceId: string;
  environmentId: string;
  status: TerminalStatus;
  error: string | null;
}

interface TerminalStoreState {
  tabs: Record<string, TerminalTabState>;
  tabOrderByContext: Record<string, string[]>;
  activeTabIdByContext: Record<string, string | undefined>;
  addTab: (workspaceId: string, environmentId: string) => string;
  ensureDefaultTab: (workspaceId: string, environmentId: string) => string;
  setActiveTab: (
    workspaceId: string,
    environmentId: string,
    tabId: string,
  ) => void;
  setConnecting: (tabId: string, workspaceId: string, environmentId: string) => void;
  setSession: (tabId: string, sessionId: string) => void;
  setExited: (sessionId: string) => void;
  setError: (tabId: string, message: string) => void;
  removeTab: (tabId: string) => void;
  getTab: (tabId: string) => TerminalTabState | undefined;
  getTabsForContext: (
    workspaceId: string,
    environmentId: string,
  ) => TerminalTabState[];
  getActiveTabId: (
    workspaceId: string,
    environmentId: string,
  ) => string | undefined;
}

export const useTerminalStore = create<TerminalStoreState>((set, get) => ({
  tabs: {},
  tabOrderByContext: {},
  activeTabIdByContext: {},

  addTab: (workspaceId, environmentId) => {
    const tabId = createTerminalTabId();
    const contextKey = terminalContextKey(workspaceId, environmentId);

    set((state) => {
      const order = state.tabOrderByContext[contextKey] ?? [];
      return {
        tabs: {
          ...state.tabs,
          [tabId]: {
            tabId,
            sessionId: "",
            workspaceId,
            environmentId,
            status: "connecting",
            error: null,
          },
        },
        tabOrderByContext: {
          ...state.tabOrderByContext,
          [contextKey]: [...order, tabId],
        },
        activeTabIdByContext: {
          ...state.activeTabIdByContext,
          [contextKey]: tabId,
        },
      };
    });

    return tabId;
  },

  ensureDefaultTab: (workspaceId, environmentId) => {
    const contextKey = terminalContextKey(workspaceId, environmentId);
    const state = get();
    const order = state.tabOrderByContext[contextKey] ?? [];

    if (order.length > 0) {
      const activeId = state.activeTabIdByContext[contextKey] ?? order[0];
      if (activeId && state.tabs[activeId]) {
        return activeId;
      }
      return order[0];
    }

    return get().addTab(workspaceId, environmentId);
  },

  setActiveTab: (workspaceId, environmentId, tabId) => {
    const contextKey = terminalContextKey(workspaceId, environmentId);
    set((state) => ({
      activeTabIdByContext: {
        ...state.activeTabIdByContext,
        [contextKey]: tabId,
      },
    }));
  },

  setConnecting: (tabId, workspaceId, environmentId) => {
    set((state) => ({
      tabs: {
        ...state.tabs,
        [tabId]: {
          tabId,
          sessionId: state.tabs[tabId]?.sessionId ?? "",
          workspaceId,
          environmentId,
          status: "connecting",
          error: null,
        },
      },
    }));
  },

  setSession: (tabId, sessionId) => {
    set((state) => {
      const existing = state.tabs[tabId];
      if (!existing) {
        return state;
      }
      return {
        tabs: {
          ...state.tabs,
          [tabId]: {
            ...existing,
            sessionId,
            status: "running",
            error: null,
          },
        },
      };
    });
  },

  setExited: (sessionId) => {
    set((state) => {
      const nextTabs = { ...state.tabs };
      for (const [tabId, tab] of Object.entries(nextTabs)) {
        if (tab.sessionId === sessionId) {
          nextTabs[tabId] = { ...tab, status: "exited" };
        }
      }
      return { tabs: nextTabs };
    });
  },

  setError: (tabId, message) => {
    set((state) => {
      const existing = state.tabs[tabId];
      if (!existing) {
        return state;
      }
      return {
        tabs: {
          ...state.tabs,
          [tabId]: {
            ...existing,
            status: "error",
            error: message,
          },
        },
      };
    });
  },

  removeTab: (tabId) => {
    set((state) => {
      const tab = state.tabs[tabId];
      if (!tab) {
        return state;
      }

      const contextKey = terminalContextKey(tab.workspaceId, tab.environmentId);
      const order = (state.tabOrderByContext[contextKey] ?? []).filter(
        (id) => id !== tabId,
      );
      const nextTabs = { ...state.tabs };
      delete nextTabs[tabId];

      let nextActive = state.activeTabIdByContext[contextKey];
      if (nextActive === tabId) {
        nextActive = order[order.length - 1];
      }

      return {
        tabs: nextTabs,
        tabOrderByContext: {
          ...state.tabOrderByContext,
          [contextKey]: order,
        },
        activeTabIdByContext: {
          ...state.activeTabIdByContext,
          [contextKey]: nextActive,
        },
      };
    });
  },

  getTab: (tabId) => get().tabs[tabId],

  getTabsForContext: (workspaceId, environmentId) => {
    const contextKey = terminalContextKey(workspaceId, environmentId);
    const order = get().tabOrderByContext[contextKey] ?? [];
    return order
      .map((tabId) => get().tabs[tabId])
      .filter((tab): tab is TerminalTabState => tab !== undefined);
  },

  getActiveTabId: (workspaceId, environmentId) => {
    const contextKey = terminalContextKey(workspaceId, environmentId);
    return get().activeTabIdByContext[contextKey];
  },
}));
