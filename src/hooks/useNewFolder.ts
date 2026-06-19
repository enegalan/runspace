import { useCallback } from "react";
import { workspaceEntryExists } from "../core/workspace/workspaceEntryExists";
import { useDialogStore } from "../stores/dialogStore";
import { useWorkspaceStore } from "../stores/workspaceStore";

export function useNewFolder() {
  const workspace = useWorkspaceStore((state) => state.workspace);
  const createFolder = useWorkspaceStore((state) => state.createFolder);

  const createNewFolder = useCallback(async () => {
    if (! workspace) {
      return;
    }

    let label = "New folder name";
    let initialValue = "";

    while (true) {
      const raw = await useDialogStore.getState().askPrompt(label, {
        initialValue,
        validate: (value) => (value.trim() ? null : "Folder name cannot be empty."),
      });
      if (raw === null) {
        return;
      }
      const trimmed = raw.trim();
      if (await workspaceEntryExists(workspace.id, trimmed)) {
        label = `"${trimmed}" already exists.`;
        initialValue = trimmed;
        continue;
      }
      await createFolder(trimmed);
      return;
    }
  }, [createFolder, workspace]);

  return { createNewFolder };
}
