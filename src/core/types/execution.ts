import type { EnvironmentId } from "./environment";

export type ExecutionStream = "stdout" | "stderr";

export type ExecutionStatus =
  | "idle"
  | "running"
  | "success"
  | "error"
  | "timeout";

export type ExecutionPhase = "compile" | "run";

export interface ExecutionOptions {
  environmentId?: EnvironmentId;
  file: string;
  timeoutSecs?: number;
  compileTimeoutSecs?: number;
}

export interface ExecutionOutputEvent {
  stream: ExecutionStream;
  chunk: string;
}

export interface ExecutionFinishedEvent {
  exit_code: number | null;
  timed_out: boolean;
  compile_failed?: boolean;
}

export interface ExecutionPhaseEvent {
  phase: ExecutionPhase;
}
