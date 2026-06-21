import { invoke } from "@tauri-apps/api/core";
import { shouldUseHttpApi } from "./backendTransport";
import { fetchBackend } from "./fetchBackend";

interface InvokeResponse<T> {
  result: T;
}

interface ErrorResponse {
  error: string;
}

/**
 * Converts the given arguments to Tauri arguments.
 * @param args - The arguments to convert.
 * @returns The converted arguments.
 */
function toTauriArgs(args: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(args)) {
    if (value === undefined) {
      continue;
    }
    out[key] = value;
    const snake = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    if (snake !== key) {
      out[snake] = value;
    }
  }

  return out;
}

/**
 * Invokes the given command via the HTTP API.
 * @param cmd - The command to invoke.
 * @param args - The arguments to pass to the command.
 * @returns A promise that resolves with the result.
 */
async function invokeHttp<T>(cmd: string, args: Record<string, unknown>): Promise<T> {
  const response = await fetchBackend("/api/invoke", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cmd, args }),
  });

  const body = (await response.json()) as InvokeResponse<T> | ErrorResponse;
  if (!response.ok) {
    const message = "error" in body ? body.error : response.statusText;
    throw new Error(message || "Request failed");
  }

  return (body as InvokeResponse<T>).result;
}

/**
 * Invokes the given command via the native or HTTP API.
 * @param cmd - The command to invoke.
 * @param args - The arguments to pass to the command.
 * @returns A promise that resolves with the result.
 */
export async function runspaceInvoke<T>(
  cmd: string,
  args: Record<string, unknown> = {},
): Promise<T> {
  if (shouldUseHttpApi()) {
    return invokeHttp<T>(cmd, args);
  }

  return invoke<T>(cmd, toTauriArgs(args));
}
