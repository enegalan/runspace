import type { TerminalDataEvent, TerminalExitEvent } from "../../types/terminal";
import { subscribeBackendEvents } from "./subscribeBackendEvents";

type TerminalEventPayload =
  { event: "data"; session_id: string; data: string } | ({ event: "exit" } & TerminalExitEvent);

export interface TerminalEventHandlers {
  onData: (payload: TerminalDataEvent) => void;
  onExit: (payload: TerminalExitEvent) => void;
}

/**
 * Subscribes to terminal events from the backend.
 * @param handlers - The event handlers.
 * @returns A function to unsubscribe from the events.
 */
export function subscribeTerminalEvents(handlers: TerminalEventHandlers): () => void {
  return subscribeBackendEvents<TerminalEventPayload>("/api/terminal/events", (payload) => {
    switch (payload.event) {
      case "data":
        handlers.onData({
          session_id: payload.session_id,
          data: payload.data,
        });
        break;
      case "exit":
        handlers.onExit({
          session_id: payload.session_id,
          exit_code: payload.exit_code,
        });
        break;
      default:
        break;
    }
  });
}
