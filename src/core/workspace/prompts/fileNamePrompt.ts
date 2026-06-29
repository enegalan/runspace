import { siblingPath } from "../fileTreeDrag";
import { getFileExtension, normalizeFileName } from "../fileExtension";
import { workspaceEntryExists } from "../workspaceEntryExists";
import { singleSegmentNameError } from "./singleSegmentName";
import { WorkspacePrompt, type PromptProcessResult } from "./WorkspacePrompt";

class FileNamePrompt extends WorkspacePrompt<string> {
  private readonly environmentId: string;
  private readonly workspaceId: string;
  private readonly parentDir: string;

  constructor(environmentId: string, workspaceId: string, parentDir = "") {
    const ext = getFileExtension(environmentId);
    super(`New file name (.${ext})`);
    this.environmentId = environmentId;
    this.workspaceId = workspaceId;
    this.parentDir = parentDir;
  }

  protected placeholder(): string {
    return `filename.${getFileExtension(this.environmentId)}`;
  }

  protected emptyValueMessage(): string {
    return "File name cannot be empty.";
  }

  protected async process(trimmed: string): Promise<PromptProcessResult<string>> {
    const nameError = singleSegmentNameError(trimmed);
    if (nameError) {
      return {
        status: "retry",
        label: nameError,
        initialValue: trimmed,
      };
    }

    const path = siblingPath(this.parentDir, normalizeFileName(trimmed, this.environmentId));
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
 * This function is used to prompt the user for a file name.
 * @param environmentId - The ID of the environment.
 * @param workspaceId - The ID of the workspace.
 * @returns The file name.
 */
export async function requireFileName(
  environmentId: string,
  workspaceId: string,
  parentDir = "",
): Promise<string | null> {
  return new FileNamePrompt(environmentId, workspaceId, parentDir).run();
}
