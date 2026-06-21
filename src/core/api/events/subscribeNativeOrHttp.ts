import { shouldUseHttpApi } from "../backendTransport";

/**
 * Subscribes to events from the native or HTTP API.
 * @param subscribeHttp - The function to subscribe to events from the HTTP API.
 * @param subscribeNative - The function to subscribe to events from the native API.
 * @returns A function to unsubscribe from the events.
 */
export function subscribeNativeOrHttp(
  subscribeHttp: () => () => void,
  subscribeNative: (register: (unlisten: () => void) => void) => Promise<void>,
): () => void {
  if (shouldUseHttpApi()) {
    return subscribeHttp();
  }

  let cancelled = false;
  const unlisteners: Array<() => void> = [];

  const register = (unlisten: () => void) => {
    if (cancelled) {
      unlisten();
      return;
    }
    unlisteners.push(unlisten);
  };

  void subscribeNative(register);

  return () => {
    cancelled = true;
    for (const unlisten of unlisteners) {
      unlisten();
    }
  };
}
