import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { useCallback, useEffect, useState } from "react";
import { DEFAULT_RUNTIME_ID } from "../core/runtimes";
import type {
  ExecutionFinishedEvent,
  ExecutionOptions,
  ExecutionOutputEvent,
  ExecutionStatus,
} from "../core/types/execution";

const DEFAULT_TIMEOUT_SECS = 30;

export function useExecution() {
  const [stdout, setStdout] = useState("");
  const [stderr, setStderr] = useState("");
  const [status, setStatus] = useState<ExecutionStatus>("idle");
  const [exitCode, setExitCode] = useState<number | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const unlisteners: Array<() => void> = [];

    const register = (unlisten: () => void) => {
      if (cancelled) {
        unlisten();
        return;
      }
      unlisteners.push(unlisten);
    };

    const setup = async () => {
      const outputUnlisten = await listen<ExecutionOutputEvent>(
        "execution-output",
        (event) => {
          if (event.payload.stream === "stdout") {
            setStdout((prev) => prev + event.payload.chunk);
          } else {
            setStderr((prev) => prev + event.payload.chunk);
          }
        },
      );
      register(outputUnlisten);

      const finishedUnlisten = await listen<ExecutionFinishedEvent>(
        "execution-finished",
        (event) => {
          setExitCode(event.payload.exit_code);
          setTimedOut(event.payload.timed_out);
          setStatus("done");
        },
      );
      register(finishedUnlisten);

      const startedUnlisten = await listen("execution-started", () => {
        setStatus("running");
      });
      register(startedUnlisten);
    };

    void setup();

    return () => {
      cancelled = true;
      for (const unlisten of unlisteners) {
        unlisten();
      }
    };
  }, []);

  const run = useCallback(async (code: string, options?: ExecutionOptions) => {
    setStdout("");
    setStderr("");
    setExitCode(null);
    setTimedOut(false);
    setError(null);
    setStatus("running");

    const runtime = options?.runtime ?? DEFAULT_RUNTIME_ID;
    const timeoutSecs = options?.timeoutSecs ?? DEFAULT_TIMEOUT_SECS;

    try {
      await invoke("execute_code", { code, timeoutSecs, runtime });
    } catch (err) {
      setStatus("done");
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  const stop = useCallback(async () => {
    try {
      await invoke("kill_process");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  return {
    stdout,
    stderr,
    status,
    exitCode,
    timedOut,
    error,
    run,
    stop,
  };
}
