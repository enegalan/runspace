import { useCallback } from "react";
import { requireFileName } from "../core/workspace/promptFileName";
import { useEditorTabsStore } from "../stores/editorTabsStore";
import { useEnvironmentStore } from "../stores/environmentStore";
import { useWorkspaceStore } from "../stores/workspaceStore";

export function useNewFile() {
  const workspaceRuntimeId = useWorkspaceStore((state) => state.workspace?.runtime_id);
  const selectedRuntimeId = useEnvironmentStore((state) => state.selectedId);
  const runtimeId = workspaceRuntimeId ?? selectedRuntimeId;
  const createFile = useWorkspaceStore((state) => state.createFile);
  const openFile = useEditorTabsStore((state) => state.openFile);

  const createAndOpenFile = useCallback(async () => {
    if (! runtimeId) {
      return;
    }

    try {
      const path = await requireFileName(runtimeId);
      if (! path) {
        return;
      }
      await createFile(path);
      await openFile(path);
    } catch (error) {
      console.error("Failed to create file:", error);
    }
  }, [createFile, openFile, runtimeId]);

  return { createAndOpenFile, runtimeId };
}
