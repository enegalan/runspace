import { invoke } from "@tauri-apps/api/core";
import { shouldUseHttpApi } from "./backendTransport";
import { fetchBackend } from "./fetchBackend";
import { toTauriArgs } from "./tauriArgs";

interface InvokeResponse<T> {
  result: T;
}

interface ErrorResponse {
  error: string;
}

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

export async function runspaceInvoke<T>(
  cmd: string,
  args: Record<string, unknown> = {},
): Promise<T> {
  if (shouldUseHttpApi()) {
    return invokeHttp<T>(cmd, args);
  }

  return invoke<T>(cmd, toTauriArgs(args));
}
