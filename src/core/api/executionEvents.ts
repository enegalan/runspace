import type {
  ExecutionFinishedEvent,
  ExecutionOutputEvent,
  ExecutionPhase,
} from "../types/execution";
import { waitForBackendReady } from "./fetchBackend";

type ExecutionEventPayload =
  | { event: "started"; pid: number }
  | { event: "output"; stream: "stdout" | "stderr"; chunk: string }
  | { event: "phase"; phase: ExecutionPhase }
  | {
      event: "finished";
      exit_code?: number | null;
      timed_out?: boolean;
      compile_failed?: boolean;
      "exit-code"?: number | null;
      "timed-out"?: boolean;
      "compile-failed"?: boolean;
    };

function parseFinishedEvent(
  payload: Extract<ExecutionEventPayload, { event: "finished" }>,
): ExecutionFinishedEvent {
  const exitCode = payload.exit_code ?? payload["exit-code"] ?? null;
  const timedOut = payload.timed_out ?? payload["timed-out"] ?? false;
  const compileFailed =
    payload.compile_failed ?? payload["compile-failed"] ?? false;

  return {
    exit_code: exitCode,
    timed_out: timedOut,
    compile_failed: compileFailed,
  };
}

export interface ExecutionEventHandlers {
  onStarted: () => void;
  onOutput: (stream: ExecutionOutputEvent["stream"], chunk: string) => void;
  onPhase: (phase: ExecutionPhase) => void;
  onFinished: (payload: ExecutionFinishedEvent) => void;
}

const RETRY_DELAY_MS = 500;

export function subscribeExecutionEvents(handlers: ExecutionEventHandlers): () => void {
  let closed = false;
  let retryTimer: number | undefined;
  let source: EventSource | undefined;

  const connect = () => {
    void waitForBackendReady()
      .then(() => {
        if (closed) {
          return;
        }
        source = new EventSource("/api/execution/events");
        attachHandlers();
      })
      .catch(() => {
        if (!closed) {
          retryTimer = window.setTimeout(() => {
            connect();
          }, RETRY_DELAY_MS);
        }
      });
  };

  const attachHandlers = () => {
    if (!source) {
      return;
    }

    source.onmessage = (message) => {
      const payload = JSON.parse(message.data) as ExecutionEventPayload;

      switch (payload.event) {
        case "started":
          handlers.onStarted();
          break;
        case "output":
          handlers.onOutput(payload.stream, payload.chunk);
          break;
        case "phase":
          handlers.onPhase(payload.phase);
          break;
        case "finished":
          handlers.onFinished(parseFinishedEvent(payload));
          break;
        default:
          break;
      }
    };

    source.onerror = () => {
      source?.close();
      source = undefined;
      if (closed) {
        return;
      }
      retryTimer = window.setTimeout(() => {
        if (!closed) {
          connect();
        }
      }, RETRY_DELAY_MS);
    };
  };

  connect();

  return () => {
    closed = true;
    if (retryTimer !== undefined) {
      window.clearTimeout(retryTimer);
    }
    source?.close();
  };
}
