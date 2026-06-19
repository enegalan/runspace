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
