import { listen } from "@tauri-apps/api/event";
import { useCallback, useEffect } from "react";
import { shouldUseHttpApi } from "../core/api/backendTransport";
import { subscribeExecutionEvents } from "../core/api/executionEvents";
import { runspaceInvoke } from "../core/api/runspaceInvoke";
import type {
  ExecutionFinishedEvent,
  ExecutionOptions,
  ExecutionOutputEvent,
  ExecutionPhaseEvent,
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
    phase,
    setRunning,
    setStarted,
    setPhase,
    setFinished,
    setError,
  } = useExecutionStore();

  useEffect(() => {
    if (shouldUseHttpApi()) {
      return subscribeExecutionEvents({
        onStarted: setStarted,
        onOutput: appendOutput,
        onPhase: setPhase,
        onFinished: (payload) => {
          setFinished(payload.exit_code, payload.timed_out, payload.compile_failed);
        },
      });
    }

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
          setFinished(
            event.payload.exit_code,
            event.payload.timed_out,
            event.payload.compile_failed,
          );
        },
      );
      register(finishedUnlisten);

      const phaseUnlisten = await listen<ExecutionPhaseEvent>(
        "execution-phase",
        (event) => {
          setPhase(event.payload.phase);
        },
      );
      register(phaseUnlisten);

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
  }, [appendOutput, setFinished, setPhase, setStarted]);

  const run = useCallback(async (options?: ExecutionOptions) => {
    setRunning();

    const environmentId = options?.environmentId;
    if (!environmentId) {
      setError("No environment selected. Add one in Settings → Environments.");
      return;
    }
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
    phase,
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
