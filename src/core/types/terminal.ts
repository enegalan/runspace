export type TerminalStatus = "idle" | "connecting" | "running" | "exited" | "error";

export interface SpawnTerminalResult {
  sessionId: string;
  workspaceId: string;
  environmentId: string;
}

export interface TerminalDataEvent {
  session_id: string;
  data: string;
}

export interface TerminalExitEvent {
  session_id: string;
  exit_code: number | null;
}

export function terminalContextKey(
  workspaceId: string,
  environmentId: string,
): string {
  return `${workspaceId}:${environmentId}`;
}

export function createTerminalTabId(): string {
  return crypto.randomUUID();
}
