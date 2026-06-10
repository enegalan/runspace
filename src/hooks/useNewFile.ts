import { useCallback } from "react";
import { requireFileName } from "../core/workspace/promptFileName";
import { useEditorTabsStore } from "../stores/editorTabsStore";
import { useEnvironmentStore } from "../stores/environmentStore";
import { useWorkspaceStore } from "../stores/workspaceStore";

export function useNewFile() {
  const runtimeId =
    useWorkspaceStore((state) => state.workspace?.runtime_id) ??
    useEnvironmentStore((state) => state.selectedId);
  const rootFiles = useWorkspaceStore((state) => state.rootFiles);
  const createFile = useWorkspaceStore((state) => state.createFile);
  const openFile = useEditorTabsStore((state) => state.openFile);

  const createAndOpenFile = useCallback(async () => {
    try {
      const rootPaths = rootFiles.map((entry) => entry.path);
      const path = await requireFileName(runtimeId, rootPaths);
      if (!path) {
        return;
      }
      await createFile(path);
      await openFile(path);
    } catch (error) {
      console.error("Failed to create file:", error);
    }
  }, [createFile, openFile, rootFiles, runtimeId]);

  return { createAndOpenFile, runtimeId };
}
