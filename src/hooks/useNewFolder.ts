import { useCallback } from "react";
import { requireFolderName } from "../core/workspace/prompts/folderNamePrompt";
import { useWorkspaceStore } from "../stores/workspaceStore";

/**
 * The useNewFolder hook.
 * @returns The useNewFolder hook.
 */
export function useNewFolder() {
  const workspace = useWorkspaceStore((state) => state.workspace);
  const createFolder = useWorkspaceStore((state) => state.createFolder);

  const createNewFolder = useCallback(async (parentDir = "") => {
    if (!workspace) {
      return;
    }

    const path = await requireFolderName(workspace.id, parentDir);
    if (!path) {
      return;
    }

    await createFolder(path);
  }, [createFolder, workspace]);

  return { createNewFolder };
}
