import { listen } from "@tauri-apps/api/event";
import { useCallback, useEffect } from "react";
import { subscribeExecutionEvents } from "../core/api/events/executionEvents";
import { subscribeNativeOrHttp } from "../core/api/events/subscribeNativeOrHttp";
import { runspaceInvoke } from "../core/api/runspaceInvoke";
import { DEFAULT_APP_SETTINGS } from "../core/constants/settingsDefaults";
import type {
  ExecutionFinishedEvent,
  ExecutionOptions,
  ExecutionOutputEvent,
  ExecutionPhaseEvent,
} from "../core/types/execution";
import { useExecutionStore } from "../stores/executionStore";
import { getAppSettings } from "../stores/settingsStore";

/**
 * This hook is used to handle the execution.
 * @returns The execution.
 */
export function useExecution() {
  const {
    status,
    stdout,
    stderr,
    exitCode,
    timedOut,
    error,
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
    return subscribeNativeOrHttp(
      () =>
        subscribeExecutionEvents({
          onStarted: setStarted,
          onOutput: appendOutput,
          onPhase: setPhase,
          onFinished: (payload) => {
            setFinished(payload.exit_code, payload.timed_out, payload.compile_failed);
          },
        }),
      async (register) => {
        const outputUnlisten = await listen<ExecutionOutputEvent>("execution-output", (event) => {
          appendOutput(event.payload.stream, event.payload.chunk);
        });
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

        const phaseUnlisten = await listen<ExecutionPhaseEvent>("execution-phase", (event) => {
          setPhase(event.payload.phase);
        });
        register(phaseUnlisten);

        const startedUnlisten = await listen("execution-started", () => {
          setStarted();
        });
        register(startedUnlisten);
      },
    );
  }, [appendOutput, setFinished, setPhase, setStarted]);

  const run = useCallback(
    async (options?: ExecutionOptions) => {
      const executionSettings = getAppSettings().execution;
      setRunning({ preserveOutput: !executionSettings.autoClearOutput });

      const { environmentId, file, timeoutSecs, compileTimeoutSecs } = options ?? {};
      if (!environmentId) {
        setError("No environment selected. Add one in Settings → Environments.");
        return;
      }
      if (!file) {
        setError("Open a file to run.");
        return;
      }
      const resolvedTimeoutSecs =
        timeoutSecs ??
        executionSettings.runTimeoutSecs ??
        DEFAULT_APP_SETTINGS.execution.runTimeoutSecs;
      const resolvedCompileTimeoutSecs = compileTimeoutSecs ?? executionSettings.compileTimeoutSecs;

      try {
        await runspaceInvoke("execute_code", {
          environmentId,
          file,
          timeoutSecs: resolvedTimeoutSecs,
          compileTimeoutSecs: resolvedCompileTimeoutSecs,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    },
    [setError, setRunning],
  );

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
    lastRunDurationMs,
    run,
    stop,
    clear,
  };
}
