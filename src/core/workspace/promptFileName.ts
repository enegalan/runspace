import { useDialogStore } from "../../stores/dialogStore";
import { getRuntimeFileExtension, normalizeFileName } from "./fileExtension";
import { nextUntitledFileName } from "./uniqueFileName";
import { workspaceEntryExists } from "./workspaceEntryExists";

export async function requireFileName(
  environmentId: string,
  rootPaths: string[],
): Promise<string | null> {
  const ext = getRuntimeFileExtension(environmentId);
  let label = `New file name (.${ext})`;
  let initialValue = nextUntitledFileName(rootPaths, environmentId);

  while (true) {
    const raw = await useDialogStore.getState().askPrompt(label, {
      initialValue,
      placeholder: `filename.${ext}`,
    });
    if (!raw) {
      return null;
    }

    const trimmed = raw.trim();
    if (!trimmed) {
      label = "File name cannot be empty.";
      initialValue = "";
      continue;
    }

    const path = normalizeFileName(trimmed, environmentId);
    if (await workspaceEntryExists(path)) {
      label = `"${path}" already exists.`;
      initialValue = trimmed;
      continue;
    }

    return path;
  }
}
