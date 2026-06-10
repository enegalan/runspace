import { runspaceInvoke } from "../api/runspaceInvoke";
import { syncActiveWorkspace } from "./syncActiveWorkspace";
import type { WorkspaceInfo } from "../types/workspace";

export async function activateRuntime(runtimeId: string): Promise<WorkspaceInfo | null> {
  const existing = await runspaceInvoke<WorkspaceInfo[]>("list_workspaces", {
    runtimeId,
  });

  if (existing.length === 0) {
    return null;
  }

  const workspace = await runspaceInvoke<WorkspaceInfo>("initialize_workspace", {
    runtimeId,
  });
  await syncActiveWorkspace(workspace);
  return workspace;
}
