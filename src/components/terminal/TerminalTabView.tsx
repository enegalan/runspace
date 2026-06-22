import { useEffect, useState } from "react";
import { useTerminal } from "../../hooks/useTerminal";
import { XTermView } from "./XTermView";

interface TerminalTabViewProps {
  tabId: string;
  workspaceId: string;
  environmentId: string;
  configured: boolean;
  enabled: boolean;
  active: boolean;
  onClearReady?: (clear: (() => void) | null) => void;
}

/**
 * The TerminalTabView component.
 * @param tabId - The tab ID.
 * @param workspaceId - The workspace ID.
 * @param environmentId - The environment ID.
 * @param configured - Whether the environment is configured.
 * @param enabled - Whether the terminal is enabled.
 * @param active - Whether the tab is active.
 * @param onClearReady - The function to call when the clear is ready.
 * @returns The TerminalTabView component.
 */
export function TerminalTabView({
  tabId,
  workspaceId,
  environmentId,
  configured,
  enabled,
  active,
  onClearReady,
}: TerminalTabViewProps) {
  const { xtermRef, tab, handleData, handleResize, clearTerminal } = useTerminal({
    tabId,
    workspaceId,
    environmentId,
    configured,
    enabled,
    active,
  });

  const [xtermMounted, setXtermMounted] = useState(active);

  useEffect(() => {
    if (active) {
      setXtermMounted(true);
    }
  }, [active]);

  useEffect(() => {
    if (!onClearReady) {
      return;
    }
    if (!active) {
      onClearReady(null);
      return;
    }
    onClearReady(clearTerminal);
    return () => onClearReady(null);
  }, [active, clearTerminal, onClearReady]);

  if (!xtermMounted) {
    return null;
  }

  return (
    <div
      className={`terminal-tab-pane${active ? "" : " terminal-tab-pane--hidden"}`}
      data-testid={`terminal-tab-pane-${tabId}`}
      aria-hidden={!active}
    >
      {tab?.error && active && <p className="terminal-panel__error">{tab.error}</p>}
      <XTermView ref={xtermRef} onData={handleData} onResize={handleResize} />
    </div>
  );
}
