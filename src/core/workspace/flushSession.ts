import { useEditorTabsStore } from "../../stores/editorTabsStore";
import { useWorkspaceStore } from "../../stores/workspaceStore";

export async function flushSessionState(): Promise<void> {
  const workspace = useWorkspaceStore.getState().workspace;
  if (! workspace) {
    return;
  }

  await useEditorTabsStore.getState().saveActiveFile();
  await useEditorTabsStore.getState().persistForEnvironment(workspace.runtime_id, workspace.id);
}
