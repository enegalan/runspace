import { listen } from "@tauri-apps/api/event";
import { useCallback, useEffect, useRef } from "react";
import { shouldUseHttpApi } from "../core/api/backendTransport";
import { runspaceInvoke } from "../core/api/runspaceInvoke";
import { subscribeTerminalEvents } from "../core/api/terminalEvents";
import type { SpawnTerminalResult } from "../core/types/terminal";
import { useTerminalStore } from "../stores/terminalStore";
import type { XTermViewHandle } from "../components/terminal/XTermView";

interface UseTerminalOptions {
  tabId: string;
  workspaceId: string;
  environmentId: string;
  configured: boolean;
  enabled: boolean;
  active: boolean;
}

export function useTerminal({
  tabId,
  workspaceId,
  environmentId,
  configured,
  enabled,
  active,
}: UseTerminalOptions) {
  const xtermRef = useRef<XTermViewHandle | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const activeRef = useRef(active);
  const tab = useTerminalStore((state) => state.tabs[tabId]);
  const setConnecting = useTerminalStore((state) => state.setConnecting);
  const setSession = useTerminalStore((state) => state.setSession);
  const setExited = useTerminalStore((state) => state.setExited);
  const setError = useTerminalStore((state) => state.setError);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const sessionId = tab?.sessionId;
    sessionIdRef.current = sessionId && tab?.status === "running" ? sessionId : null;
  }, [tab?.sessionId, tab?.status]);

  useEffect(() => {
    if (!enabled || !configured) {
      return;
    }

    let cancelled = false;

    const spawn = async () => {
      setConnecting(tabId, workspaceId, environmentId);
      try {
        const result = await runspaceInvoke<SpawnTerminalResult>("spawn_terminal", {
          environmentId,
        });
        if (cancelled) {
          if (result.sessionId) {
            void runspaceInvoke("close_terminal", { sessionId: result.sessionId });
          }
          return;
        }
        sessionIdRef.current = result.sessionId;
        setSession(tabId, result.sessionId);
        window.setTimeout(() => {
          if (!activeRef.current) {
            return;
          }
          xtermRef.current?.fit();
          const cols = xtermRef.current?.getCols() ?? 80;
          const rows = xtermRef.current?.getRows() ?? 24;
          void runspaceInvoke("resize_terminal", {
            sessionId: result.sessionId,
            cols,
            rows,
          });
        }, 0);
      } catch (error) {
        if (!cancelled) {
          setError(tabId, error instanceof Error ? error.message : String(error));
        }
      }
    };

    const existing = useTerminalStore.getState().tabs[tabId];
    if (existing?.sessionId && existing.status === "running") {
      sessionIdRef.current = existing.sessionId;
      return;
    }

    if (existing?.status === "connecting" && existing.sessionId) {
      return;
    }

    void spawn();

    return () => {
      cancelled = true;
    };
  }, [configured, enabled, environmentId, setConnecting, setError, setSession, tabId, workspaceId]);

  useEffect(() => {
    if (!active || tab?.status !== "running" || !sessionIdRef.current) {
      return;
    }

    window.setTimeout(() => {
      xtermRef.current?.fit();
      const sessionId = sessionIdRef.current;
      if (!sessionId) {
        return;
      }
      const cols = xtermRef.current?.getCols() ?? 80;
      const rows = xtermRef.current?.getRows() ?? 24;
      void runspaceInvoke("resize_terminal", {
        sessionId,
        cols,
        rows,
      });
    }, 0);
  }, [active, tab?.status]);

  useEffect(() => {
    const handleData = (sessionId: string, data: string) => {
      if (sessionIdRef.current === sessionId) {
        xtermRef.current?.write(data);
      }
    };

    const handleExit = (sessionId: string) => {
      if (sessionIdRef.current === sessionId) {
        setExited(sessionId);
      }
    };

    if (shouldUseHttpApi()) {
      return subscribeTerminalEvents({
        onData: (payload) => handleData(payload.session_id, payload.data),
        onExit: (payload) => handleExit(payload.session_id),
      });
    }

    let cancelled = false;
    const unlisteners: Array<() => void> = [];

    const setup = async () => {
      const dataUnlisten = await listen<{ session_id: string; data: string }>(
        "terminal-data",
        (event) => {
          handleData(event.payload.session_id, event.payload.data);
        },
      );
      if (cancelled) {
        dataUnlisten();
        return;
      }
      unlisteners.push(dataUnlisten);

      const exitUnlisten = await listen<{ session_id: string; exit_code: number | null }>(
        "terminal-exit",
        (event) => {
          handleExit(event.payload.session_id);
        },
      );
      if (cancelled) {
        exitUnlisten();
        return;
      }
      unlisteners.push(exitUnlisten);
    };

    void setup();

    return () => {
      cancelled = true;
      for (const unlisten of unlisteners) {
        unlisten();
      }
    };
  }, [setExited]);

  const handleData = useCallback((data: string) => {
    const sessionId = sessionIdRef.current;
    if (!sessionId) {
      return;
    }
    void runspaceInvoke("write_terminal", { sessionId, data });
  }, []);

  const handleResize = useCallback((cols: number, rows: number) => {
    const sessionId = sessionIdRef.current;
    if (!sessionId) {
      return;
    }
    void runspaceInvoke("resize_terminal", { sessionId, cols, rows });
  }, []);

  const clearTerminal = useCallback(() => {
    xtermRef.current?.clear();
  }, []);

  return {
    xtermRef,
    tab,
    handleData,
    handleResize,
    clearTerminal,
  };
}
