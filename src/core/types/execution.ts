import type { EnvironmentId } from "./environment";

export type ExecutionStream = "stdout" | "stderr";

export type ExecutionStatus =
  | "idle"
  | "running"
  | "success"
  | "error"
  | "timeout";

export interface ExecutionOptions {
  environmentId?: EnvironmentId;
  timeoutSecs?: number;
  entryFile?: string;
}

export interface ExecutionOutputEvent {
  stream: ExecutionStream;
  chunk: string;
}

export interface ExecutionFinishedEvent {
  exit_code: number | null;
  timed_out: boolean;
}

export interface ExecutionStartedEvent {
  pid: number;
}
