import { useDialogStore } from "../../stores/dialogStore";
import { getRuntimeFileExtension, normalizeFileName } from "./fileExtension";
import { workspaceEntryExists } from "./workspaceEntryExists";

export async function requireFileName(environmentId: string): Promise<string | null> {
  const ext = getRuntimeFileExtension(environmentId);
  let label = `New file name (.${ext})`;
  let initialValue = "";

  while (true) {
    const raw = await useDialogStore.getState().askPrompt(label, {
      initialValue,
      placeholder: `filename.${ext}`,
      validate: (value) => (value.trim() ? null : "File name cannot be empty."),
    });
    if (raw === null) {
      return null;
    }

    const trimmed = raw.trim();

    const path = normalizeFileName(trimmed, environmentId);
    if (await workspaceEntryExists(path)) {
      label = `"${path}" already exists.`;
      initialValue = trimmed;
      continue;
    }

    return path;
  }
}
