import { useCallback, useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { TERMINAL_HEIGHT_MAX, TERMINAL_HEIGHT_MIN } from "../../core/constants/panelLayout";
import { runspaceInvoke } from "../../core/api/runspaceInvoke";
import { terminalContextKey } from "../../core/types/terminal";
import { useVerticalDragResize } from "../../hooks/useVerticalDragResize";
import { useTerminalStore, type TerminalTabState } from "../../stores/terminalStore";
import { IconButton } from "../ui/IconButton";
import { IconClear, IconClose, IconPlus, IconTrash } from "../ui/icons";
import { ResizeHandle } from "../layout/ResizeHandle";
import { TerminalTabView } from "./TerminalTabView";

interface TerminalPanelProps {
  height: number;
  onHeightChange: (height: number) => void;
  onClose: () => void;
  workspaceId?: string;
  environmentId?: string;
  configured: boolean;
  disabledReason?: string;
}

/**
 * The TerminalPanel component.
 * @param height - The height.
 * @param onHeightChange - The function to call when the height changes.
 * @param workspaceId - The workspace ID.
 * @param environmentId - The environment ID.
 * @param configured - Whether the environment is configured.
 * @param disabledReason - The reason the terminal is disabled.
 * @returns The TerminalPanel component.
 */
export function TerminalPanel({
  height,
  onHeightChange,
  onClose,
  workspaceId,
  environmentId,
  configured,
  disabledReason,
}: TerminalPanelProps) {
  const enabled = Boolean(workspaceId && environmentId && configured);
  const clearActiveRef = useRef<(() => void) | null>(null);
  const ensureDefaultTab = useTerminalStore((state) => state.ensureDefaultTab);
  const addTab = useTerminalStore((state) => state.addTab);
  const removeTab = useTerminalStore((state) => state.removeTab);
  const setActiveTab = useTerminalStore((state) => state.setActiveTab);
  const tabs = useTerminalStore(
    useShallow((state) => {
      if (!workspaceId || !environmentId) {
        return [] as TerminalTabState[];
      }
      const contextKey = terminalContextKey(workspaceId, environmentId);
      const order = state.tabOrderByContext[contextKey] ?? [];
      return order
        .map((tabId) => state.tabs[tabId])
        .filter((tab): tab is TerminalTabState => tab !== undefined);
    }),
  );
  const activeTabId = useTerminalStore((state) => {
    if (!workspaceId || !environmentId) {
      return undefined;
    }
    return state.activeTabIdByContext[terminalContextKey(workspaceId, environmentId)];
  });
  const activeTab = tabs.find((tab) => tab.tabId === activeTabId) ?? tabs[0];

  useEffect(() => {
    if (enabled && workspaceId && environmentId) {
      ensureDefaultTab(workspaceId, environmentId);
    }
  }, [enabled, ensureDefaultTab, environmentId, workspaceId]);

  const { currentSize, onPointerDown } = useVerticalDragResize(
    height,
    {
      min: TERMINAL_HEIGHT_MIN,
      max: TERMINAL_HEIGHT_MAX,
    },
    onHeightChange,
  );

  const handleAddTab = useCallback(() => {
    if (!workspaceId || !environmentId) {
      return;
    }
    addTab(workspaceId, environmentId);
  }, [addTab, environmentId, workspaceId]);

  const closeTab = useCallback(
    async (tabId: string) => {
      if (!workspaceId || !environmentId) {
        return;
      }

      const tab = useTerminalStore.getState().getTab(tabId);
      if (tab?.sessionId && (tab.status === "running" || tab.status === "connecting")) {
        try {
          await runspaceInvoke("close_terminal", { sessionId: tab.sessionId });
        } catch {
          // Session may already be closed.
        }
      }

      removeTab(tabId);

      const remaining = useTerminalStore.getState().getTabsForContext(workspaceId, environmentId);
      if (remaining.length === 0) {
        addTab(workspaceId, environmentId);
      }
    },
    [addTab, environmentId, removeTab, workspaceId],
  );

  const handleClearActive = useCallback(() => {
    clearActiveRef.current?.();
  }, []);

  const bindClearActive = useCallback((clear: (() => void) | null) => {
    clearActiveRef.current = clear;
  }, []);

  const showPlaceholder = !enabled;

  return (
    <div
      className="terminal-shell"
      style={{
        height: currentSize,
        minHeight: currentSize,
        maxHeight: currentSize,
        flex: `0 0 ${currentSize}px`,
      }}
      data-testid="terminal-panel"
    >
      <ResizeHandle
        side="top"
        orientation="horizontal"
        onPointerDown={onPointerDown}
        data-testid="terminal-resize-handle"
      />
      <section className="terminal-panel">
        <div className="terminal-panel__header">
          {!showPlaceholder && (
            <div className="terminal-tabs__list" role="tablist" data-testid="terminal-tabs">
              {tabs.map((tab, index) => {
                const isActive = tab.tabId === activeTab?.tabId;
                const statusSuffix =
                  tab.status === "connecting"
                    ? "…"
                    : tab.status === "exited"
                      ? " (exited)"
                      : tab.status === "error"
                        ? " (error)"
                        : "";
                return (
                  <div
                    key={tab.tabId}
                    className={`terminal-tabs__tab${isActive ? " terminal-tabs__tab--active" : ""}`}
                    role="presentation"
                  >
                    <button
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      className="terminal-tabs__tab-button"
                      onClick={() => {
                        if (workspaceId && environmentId) {
                          setActiveTab(workspaceId, environmentId, tab.tabId);
                        }
                      }}
                      data-testid={`terminal-tab-${index + 1}`}
                    >
                      Terminal {index + 1}
                      {statusSuffix}
                    </button>
                    {tabs.length > 1 && (
                      <button
                        type="button"
                        className="terminal-tabs__close"
                        aria-label={`Close terminal ${index + 1}`}
                        onClick={() => void closeTab(tab.tabId)}
                        data-testid={`terminal-tab-close-${index + 1}`}
                      >
                        <IconClose size={14} />
                      </button>
                    )}
                  </div>
                );
              })}
              <button
                type="button"
                className="terminal-tabs__new"
                aria-label="New terminal"
                onClick={handleAddTab}
                data-testid="terminal-new-tab-button"
              >
                <IconPlus size={16} />
              </button>
            </div>
          )}
          <div className="terminal-panel__actions">
            <IconButton
              label="Clear terminal"
              onClick={handleClearActive}
              disabled={showPlaceholder || !activeTabId}
              data-testid="terminal-clear-button"
            >
              <IconClear size={16} />
            </IconButton>
            <IconButton
              label="Kill terminal"
              onClick={() => {
                if (activeTabId) {
                  void closeTab(activeTabId);
                }
              }}
              disabled={
                showPlaceholder ||
                !activeTab ||
                (activeTab.status !== "running" && activeTab.status !== "connecting")
              }
              data-testid="terminal-kill-button"
            >
              <IconTrash size={16} />
            </IconButton>
            <IconButton
              label="Close terminal"
              onClick={onClose}
              data-testid="terminal-close-button"
            >
              <IconClose size={16} />
            </IconButton>
          </div>
        </div>
        <div className="terminal-panel__body">
          {showPlaceholder ? (
            <p className="terminal-panel__placeholder" data-testid="terminal-placeholder">
              {disabledReason ?? "Configure the environment in Settings to use the terminal"}
            </p>
          ) : (
            tabs.map((tab) => (
              <TerminalTabView
                key={tab.tabId}
                tabId={tab.tabId}
                workspaceId={workspaceId!}
                environmentId={environmentId!}
                configured={configured}
                enabled={enabled}
                active={tab.tabId === activeTab?.tabId}
                onClearReady={tab.tabId === activeTab?.tabId ? bindClearActive : undefined}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
