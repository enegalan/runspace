import { workspaceEntryExists } from "../workspaceEntryExists";
import { WorkspacePrompt, type PromptProcessResult } from "./WorkspacePrompt";

class FolderNamePrompt extends WorkspacePrompt<string> {
  constructor(private readonly workspaceId: string) {
    super("New folder name");
  }

  protected emptyValueMessage(): string {
    return "Folder name cannot be empty.";
  }

  protected async process(trimmed: string): Promise<PromptProcessResult<string>> {
    if (await workspaceEntryExists(this.workspaceId, trimmed)) {
      return {
        status: "retry",
        label: `"${trimmed}" already exists.`,
        initialValue: trimmed,
      };
    }
    return { status: "done", value: trimmed };
  }
}

/**
 * This function is used to prompt the user for a folder name.
 * @param workspaceId - The ID of the workspace.
 * @returns The folder name.
 */
export async function requireFolderName(workspaceId: string): Promise<string | null> {
  return new FolderNamePrompt(workspaceId).run();
}
