import { waitForBackendReady } from "../fetchBackend";

const RETRY_DELAY_MS = 500;

/**
 * Subscribes to backend events from the given endpoint.
 * @param endpoint - The endpoint to subscribe to.
 * @param dispatch - The function to dispatch the payload to.
 * @returns A function to unsubscribe from the events.
 */
export function subscribeBackendEvents<T>(
  endpoint: string,
  dispatch: (payload: T) => void,
): () => void {
  let closed = false;
  let retryTimer: number | undefined;
  let source: EventSource | undefined;

  const connect = () => {
    void waitForBackendReady()
      .then(() => {
        if (closed) {
          return;
        }
        source = new EventSource(endpoint);
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
      try {
        const payload = JSON.parse(message.data) as T;
        dispatch(payload);
      } catch (error) {
        console.error(`Failed to parse backend event from ${endpoint}:`, error);
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
