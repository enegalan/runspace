import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { useCallback, useEffect } from "react";
import { DEFAULT_ENVIRONMENT_ID } from "../core/constants/environmentCatalog";
import type {
  ExecutionFinishedEvent,
  ExecutionOptions,
  ExecutionOutputEvent,
} from "../core/types/execution";
import { useEditorStore } from "../stores/editorStore";
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
  }, [appendOutput, setFinished, setStarted]);

  const run = useCallback(async (code: string, options?: ExecutionOptions) => {
    setRunning();

    const environmentId = options?.environmentId ?? DEFAULT_ENVIRONMENT_ID;
    const timeoutSecs = options?.timeoutSecs ?? DEFAULT_TIMEOUT_SECS;

    try {
      await invoke("execute_code", { code, timeoutSecs, environmentId });
      void useEditorStore.getState().saveToDisk();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [setError, setRunning]);

  const stop = useCallback(async () => {
    try {
      await invoke("kill_process");
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
