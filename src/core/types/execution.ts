import type { RuntimeId } from "./runtime";

export type ExecutionStream = "stdout" | "stderr";

export type ExecutionStatus =
  | "idle"
  | "running"
  | "success"
  | "error"
  | "timeout";

export interface ExecutionOptions {
  runtime?: RuntimeId;
  timeoutSecs?: number;
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
