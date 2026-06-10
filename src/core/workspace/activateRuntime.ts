import { getCatalogDefinition } from "../constants/environmentCatalog";
import { runspaceInvoke } from "../api/runspaceInvoke";
import { requireProjectName } from "./promptProjectName";
import { syncActiveWorkspace } from "./syncActiveWorkspace";
import type { WorkspaceInfo } from "../types/workspace";

export async function activateRuntime(
  runtimeId: string,
  options?: { promptLabel?: string },
): Promise<WorkspaceInfo | null> {
  const existing = await runspaceInvoke<WorkspaceInfo[]>("list_workspaces", {
    runtimeId,
  });

  if (existing.length === 0) {
    const envName = getCatalogDefinition(runtimeId)?.name ?? runtimeId;
    const label =
      options?.promptLabel ?? `Create your first project for ${envName}`;
    const name = await requireProjectName(label);
    if (!name) {
      return null;
    }
    const workspace = await runspaceInvoke<WorkspaceInfo>("create_workspace", {
      name,
      runtimeId,
    });
    await syncActiveWorkspace(workspace);
    return workspace;
  }

  const workspace = await runspaceInvoke<WorkspaceInfo>("initialize_workspace", {
    runtimeId,
  });
  await syncActiveWorkspace(workspace);
  return workspace;
}
