import { runspaceInvoke } from "../api/runspaceInvoke";
import type { WorkspaceInfo } from "../types/workspace";

export async function activateRuntime(
  runtimeId: string,
  useSession = true,
): Promise<WorkspaceInfo | null> {
  const existing = await runspaceInvoke<WorkspaceInfo[]>("list_workspaces", {
    runtimeId,
  });

  if (existing.length === 0) {
    return null;
  }

  try {
    const workspace = await runspaceInvoke<WorkspaceInfo>("initialize_workspace", {
      runtimeId,
      useSession,
    });
    await runspaceInvoke<WorkspaceInfo>("open_workspace", { id: workspace.id });
    return workspace;
  } catch {
    return null;
  }
}
