import { siblingPath } from "../fileTreeDrag";
import { workspaceEntryExists } from "../workspaceEntryExists";
import { WorkspacePrompt, type PromptProcessResult } from "./WorkspacePrompt";

class FolderNamePrompt extends WorkspacePrompt<string> {
  constructor(
    private readonly workspaceId: string,
    private readonly parentDir = "",
  ) {
    super("New folder name");
  }

  protected emptyValueMessage(): string {
    return "Folder name cannot be empty.";
  }

  protected async process(trimmed: string): Promise<PromptProcessResult<string>> {
    const path = siblingPath(this.parentDir, trimmed);
    if (await workspaceEntryExists(this.workspaceId, path)) {
      return {
        status: "retry",
        label: `"${path}" already exists.`,
        initialValue: trimmed,
      };
    }
    return { status: "done", value: path };
  }
}

/**
 * This function is used to prompt the user for a folder name.
 * @param workspaceId - The ID of the workspace.
 * @returns The folder name.
 */
export async function requireFolderName(
  workspaceId: string,
  parentDir = "",
): Promise<string | null> {
  return new FolderNamePrompt(workspaceId, parentDir).run();
}
