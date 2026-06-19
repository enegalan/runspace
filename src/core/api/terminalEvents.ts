import type { TerminalDataEvent, TerminalExitEvent } from "../types/terminal";
import { waitForBackendReady } from "./fetchBackend";

type TerminalEventPayload =
  | { event: "data"; session_id: string; data: string }
  | ({ event: "exit" } & TerminalExitEvent);

export interface TerminalEventHandlers {
  onData: (payload: TerminalDataEvent) => void;
  onExit: (payload: TerminalExitEvent) => void;
}

const RETRY_DELAY_MS = 500;

export function subscribeTerminalEvents(handlers: TerminalEventHandlers): () => void {
  let closed = false;
  let retryTimer: number | undefined;
  let source: EventSource | undefined;

  const connect = () => {
    void waitForBackendReady()
      .then(() => {
        if (closed) {
          return;
        }
        source = new EventSource("/api/terminal/events");
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
      const payload = JSON.parse(message.data) as TerminalEventPayload;

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
