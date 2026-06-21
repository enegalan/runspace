import { create } from "zustand";
import type { ExecutionPhase, ExecutionStatus } from "../core/types/execution";

interface ExecutionState {
  status: ExecutionStatus;
  phase: ExecutionPhase | null;
  stdout: string;
  stderr: string;
  exitCode: number | null;
  timedOut: boolean;
  compileFailed: boolean;
  error: string | null;
  startedAt: number | null;
  lastRunDurationMs: number | null;
  appendOutput: (stream: "stdout" | "stderr", chunk: string) => void;
  reset: () => void;
  setRunning: (options?: { preserveOutput?: boolean }) => void;
  setStarted: () => void;
  setPhase: (phase: ExecutionPhase) => void;
  setFinished: (exitCode: number | null, timedOut: boolean, compileFailed?: boolean) => void;
  setError: (message: string) => void;
}

/**
 * The initial state.
 * @returns The initial state.
 */
const initialState = {
  status: "idle" as ExecutionStatus,
  phase: null as ExecutionPhase | null,
  stdout: "",
  stderr: "",
  exitCode: null as number | null,
  timedOut: false,
  compileFailed: false,
  error: null as string | null,
  startedAt: null as number | null,
  lastRunDurationMs: null as number | null,
};

/**
 * The resolveStatus function.
 * @param exitCode - The exit code.
 * @param timedOut - Whether the execution timed out.
 * @param compileFailed - Whether the execution failed to compile.
 * @returns The status.
 */
function resolveStatus(
  exitCode: number | null,
  timedOut: boolean,
  compileFailed: boolean,
): ExecutionStatus {
  if (timedOut) {
    return "timeout";
  }
  if (compileFailed || (exitCode !== null && exitCode !== 0)) {
    return "error";
  }
  return "success";
}

/**
 * The useExecutionStore hook.
 * @returns The useExecutionStore hook.
 */
export const useExecutionStore = create<ExecutionState>((set, get) => ({
  ...initialState,

  appendOutput: (stream, chunk) => {
    if (stream === "stdout") {
      set((state) => ({ stdout: state.stdout + chunk }));
    } else {
      set((state) => ({ stderr: state.stderr + chunk }));
    }
  },

  reset: () => {
    const { lastRunDurationMs } = get();
    set({ ...initialState, lastRunDurationMs });
  },

  setRunning: (options) => {
    const preserveOutput = options?.preserveOutput ?? false;
    set((state) => ({
      stdout: preserveOutput ? state.stdout : "",
      stderr: preserveOutput ? state.stderr : "",
      exitCode: null,
      timedOut: false,
      compileFailed: false,
      phase: null,
      error: null,
      status: "running",
      startedAt: Date.now(),
    }));
  },

  setStarted: () => {
    set({ status: "running" });
  },

  setPhase: (phase) => {
    set({ phase, status: "running" });
  },

  setFinished: (exitCode, timedOut, compileFailed = false) => {
    const { startedAt } = get();
    const lastRunDurationMs = startedAt !== null ? Date.now() - startedAt : null;
    set({
      exitCode,
      timedOut,
      compileFailed,
      phase: null,
      status: resolveStatus(exitCode, timedOut, compileFailed),
      lastRunDurationMs,
    });
  },

  setError: (message) => {
    set({
      status: "error",
      error: message,
    });
  },
}));
