import { useCallback } from "react";
import { useActiveRuntimeId } from "./useActiveRuntimeId";
import { requireFileName } from "../core/workspace/prompts/fileNamePrompt";
import { useEditorTabsStore } from "../stores/editorTabsStore";
import { useWorkspaceStore } from "../stores/workspaceStore";

/**
 * The useNewFile hook.
 * @returns The useNewFile hook.
 */
export function useNewFile() {
  const runtimeId = useActiveRuntimeId();
  const workspaceId = useWorkspaceStore((state) => state.workspace?.id);
  const createFile = useWorkspaceStore((state) => state.createFile);
  const openFile = useEditorTabsStore((state) => state.openFile);

  const createAndOpenFile = useCallback(async (parentDir = "") => {
    if (!runtimeId || !workspaceId) {
      return;
    }

    try {
      const path = await requireFileName(runtimeId, workspaceId, parentDir);
      if (!path) {
        return;
      }
      await createFile(path);
      await openFile(path);
    } catch (error) {
      console.error("Failed to create file:", error);
    }
  }, [createFile, openFile, runtimeId, workspaceId]);

  return { createAndOpenFile };
}
