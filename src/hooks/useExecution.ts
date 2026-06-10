import { listen } from "@tauri-apps/api/event";
import { useCallback, useEffect } from "react";
import { subscribeExecutionEvents } from "../core/api/executionEvents";
import { runspaceInvoke } from "../core/api/runspaceInvoke";
import { DEFAULT_ENVIRONMENT_ID } from "../core/constants/environmentCatalog";
import { isTauri } from "../core/platform/isTauri";
import type {
  ExecutionFinishedEvent,
  ExecutionOptions,
  ExecutionOutputEvent,
} from "../core/types/execution";
import { useExecutionStore } from "../stores/executionStore";

const DEFAULT_TIMEOUT_SECS = 30;

export function useExecution() {
  const {
    status,
    stdout,
    stderr,
    exitCode,
    timedOut,
    error,
    durationMs,
    lastRunDurationMs,
    appendOutput,
    reset,
    setRunning,
    setStarted,
    setFinished,
    setError,
  } = useExecutionStore();

  useEffect(() => {
    if (isTauri()) {
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
            appendOutput(event.payload.stream, event.payload.chunk);
          },
        );
        register(outputUnlisten);

        const finishedUnlisten = await listen<ExecutionFinishedEvent>(
          "execution-finished",
          (event) => {
            setFinished(event.payload.exit_code, event.payload.timed_out);
          },
        );
        register(finishedUnlisten);

        const startedUnlisten = await listen("execution-started", () => {
          setStarted();
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
    }

    return subscribeExecutionEvents({
      onStarted: setStarted,
      onOutput: appendOutput,
      onFinished: (payload) => {
        setFinished(payload.exit_code, payload.timed_out);
      },
    });
  }, [appendOutput, setFinished, setStarted]);

  const run = useCallback(async (options?: ExecutionOptions) => {
    setRunning();

    const environmentId = options?.environmentId ?? DEFAULT_ENVIRONMENT_ID;
    const timeoutSecs = options?.timeoutSecs ?? DEFAULT_TIMEOUT_SECS;
    const entryFile = options?.entryFile;

    try {
      await runspaceInvoke("execute_code", {
        environmentId,
        timeoutSecs,
        entryFile,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [setError, setRunning]);

  const stop = useCallback(async () => {
    try {
      await runspaceInvoke("kill_process");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [setError]);

  const clear = useCallback(() => {
    reset();
  }, [reset]);

  return {
    stdout,
    stderr,
    status,
    exitCode,
    timedOut,
    error,
    durationMs,
    lastRunDurationMs,
    run,
    stop,
    clear,
  };
}
