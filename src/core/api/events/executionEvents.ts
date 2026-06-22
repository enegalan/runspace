import type {
  ExecutionFinishedEvent,
  ExecutionOutputEvent,
  ExecutionPhase,
} from "../../types/execution";
import { subscribeBackendEvents } from "./subscribeBackendEvents";

type ExecutionEventPayload =
  | { event: "started"; pid: number }
  | { event: "output"; stream: "stdout" | "stderr"; chunk: string }
  | { event: "phase"; phase: ExecutionPhase }
  | ({ event: "finished" } & ExecutionFinishedEvent);

export interface ExecutionEventHandlers {
  onStarted: () => void;
  onOutput: (stream: ExecutionOutputEvent["stream"], chunk: string) => void;
  onPhase: (phase: ExecutionPhase) => void;
  onFinished: (payload: ExecutionFinishedEvent) => void;
}

/**
 * Subscribes to execution events from the backend.
 * @param handlers - The event handlers.
 * @returns A function to unsubscribe from the events.
 */
export function subscribeExecutionEvents(handlers: ExecutionEventHandlers): () => void {
  return subscribeBackendEvents<ExecutionEventPayload>("/api/execution/events", (payload) => {
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
        handlers.onFinished({
          exit_code: payload.exit_code,
          timed_out: payload.timed_out,
          compile_failed: payload.compile_failed,
        });
        break;
      default:
        break;
    }
  });
}
