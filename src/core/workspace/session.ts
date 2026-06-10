import type { EnvironmentSession, SessionData, WorkspaceTabs } from "../types/workspace";

export function getEnvironmentSession(
  session: SessionData,
  runtimeId: string,
): EnvironmentSession {
  const stored = session.environments?.[runtimeId];
  if (stored) {
    return {
      workspace_id: stored.workspace_id ?? null,
      workspace_tabs: stored.workspace_tabs ?? {},
    };
  }

  if (session.environments && Object.keys(session.environments).length > 0) {
    return { workspace_id: null, workspace_tabs: {} };
  }

  const workspaceId = session.last_workspace_id ?? null;
  const workspaceTabs: Record<string, WorkspaceTabs> = {};
  if (workspaceId && (session.open_files?.length || session.active_file)) {
    workspaceTabs[workspaceId] = {
      open_files: session.open_files ?? [],
      active_file: session.active_file ?? null,
    };
  }

  return {
    workspace_id: workspaceId,
    workspace_tabs: workspaceTabs,
  };
}

export function uniquePaths(paths: string[]): string[] {
  return [...new Set(paths)];
}
