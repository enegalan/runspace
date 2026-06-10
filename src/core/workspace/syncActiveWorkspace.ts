import { runspaceInvoke } from "../api/runspaceInvoke";
import type { WorkspaceInfo } from "../types/workspace";

export async function syncActiveWorkspace(
  workspace: WorkspaceInfo,
): Promise<void> {
  await runspaceInvoke<WorkspaceInfo>("open_workspace", { id: workspace.id });
}
