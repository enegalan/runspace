import { isTauri } from "../platform/isTauri";

const RETRY_DELAY_MS = 400;
const MAX_RETRIES = 60;

/**
 * Sleeps for the given number of milliseconds.
 * @param ms - The number of milliseconds to sleep.
 * @returns A promise that resolves when the sleep is complete.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

let backendReadyPromise: Promise<void> | undefined;

/**
 * Polls the backend for readiness.
 * @returns A promise that resolves when the backend is ready.
 */
async function pollBackendReady(): Promise<void> {
  let lastError: unknown;

  // Vite is ready before `cargo run` binds the HTTP API; skip the noisiest window.
  await sleep(500);

  for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
    try {
      const response = await fetch("/api/health");
      if (response.ok) {
        return;
      }
    } catch (error) {
      lastError = error;
    }
    await sleep(RETRY_DELAY_MS);
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Backend not ready. Wait for `tauri dev` to finish starting.");
}

/**
 * Waits for the backend to be ready.
 * @returns A promise that resolves when the backend is ready.
 */
export function waitForBackendReady(): Promise<void> {
  if (isTauri() && !import.meta.env.DEV) {
    return Promise.resolve();
  }

  if (!backendReadyPromise) {
    backendReadyPromise = pollBackendReady().catch((error) => {
      backendReadyPromise = undefined;
      throw error;
    });
  }

  return backendReadyPromise;
}

/**
 * Fetches from the backend.
 * @param input - The input to fetch from.
 * @param init - The init options to use.
 * @returns A promise that resolves with the response.
 */
export async function fetchBackend(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  await waitForBackendReady();

  const response = await fetch(input, init);
  return response;
}
