import { create } from "zustand";
import type { ExecutionStatus } from "../core/types/execution";

export interface ExecutionState {
  status: ExecutionStatus;
  stdout: string;
  stderr: string;
  exitCode: number | null;
  timedOut: boolean;
  error: string | null;
  startedAt: number | null;
  durationMs: number | null;
  lastRunDurationMs: number | null;
  appendOutput: (stream: "stdout" | "stderr", chunk: string) => void;
  reset: () => void;
  setRunning: () => void;
  setStarted: () => void;
  setFinished: (exitCode: number | null, timedOut: boolean) => void;
  setError: (message: string) => void;
}

const initialState = {
  status: "idle" as ExecutionStatus,
  stdout: "",
  stderr: "",
  exitCode: null as number | null,
  timedOut: false,
  error: null as string | null,
  startedAt: null as number | null,
  durationMs: null as number | null,
  lastRunDurationMs: null as number | null,
};

function resolveStatus(
  exitCode: number | null,
  timedOut: boolean,
): ExecutionStatus {
  if (timedOut) {
    return "timeout";
  }
  if (exitCode !== null && exitCode !== 0) {
    return "error";
  }
  return "success";
}

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

  setRunning: () => {
    set({
      stdout: "",
      stderr: "",
      exitCode: null,
      timedOut: false,
      error: null,
      status: "running",
      startedAt: Date.now(),
      durationMs: null,
    });
  },

  setStarted: () => {
    set({ status: "running" });
  },

  setFinished: (exitCode, timedOut) => {
    const { startedAt } = get();
    const durationMs = startedAt !== null ? Date.now() - startedAt : null;
    set({
      exitCode,
      timedOut,
      status: resolveStatus(exitCode, timedOut),
      durationMs,
      lastRunDurationMs: durationMs,
    });
  },

  setError: (message) => {
    const { startedAt } = get();
    const durationMs = startedAt !== null ? Date.now() - startedAt : null;
    set({
      status: "error",
      error: message,
      durationMs,
    });
  },
}));
