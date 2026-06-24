import type { EnvironmentSession, SessionData } from "../types/workspace";

/**
 * This function is used to get the environment session for a given runtime ID.
 * @param session - The session data.
 * @param runtimeId - The runtime ID.
 * @returns The environment session.
 */
export function getEnvironmentSession(session: SessionData, runtimeId: string): EnvironmentSession {
  const stored = session.environments?.[runtimeId];
  if (stored) {
    return {
      workspace_id: stored.workspace_id ?? null,
      workspace_tabs: stored.workspace_tabs ?? {},
    };
  }

  return { workspace_id: null, workspace_tabs: {} };
}
