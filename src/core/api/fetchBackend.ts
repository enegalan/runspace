import { isTauri } from "../platform/isTauri";

const RETRY_DELAY_MS = 400;
const MAX_RETRIES = 60;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

let backendReadyPromise: Promise<void> | undefined;

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

export function waitForBackendReady(): Promise<void> {
  if (isTauri() && ! import.meta.env.DEV) {
    return Promise.resolve();
  }

  if (! backendReadyPromise) {
    backendReadyPromise = pollBackendReady().catch((error) => {
      backendReadyPromise = undefined;
      throw error;
    });
  }

  return backendReadyPromise;
}

export async function fetchBackend(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  await waitForBackendReady();

  const response = await fetch(input, init);
  return response;
}
