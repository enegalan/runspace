import { WorkspacePrompt, type PromptProcessResult } from "./WorkspacePrompt";

class WorkspaceNamePrompt extends WorkspacePrompt<string> {
  constructor(label = "Workspace name", initialValue = "") {
    super(label, initialValue);
  }

  protected emptyValueMessage(): string {
    return "Workspace name cannot be empty.";
  }

  protected async process(trimmed: string): Promise<PromptProcessResult<string>> {
    return { status: "done", value: trimmed };
  }
}

/**
 * This function is used to prompt the user for a workspace name.
 * @param label - The label of the prompt.
 * @param initialValue - The initial value of the prompt.
 * @returns The workspace name.
 */
export async function requireWorkspaceName(
  label = "Workspace name",
  initialValue = "",
): Promise<string | null> {
  return new WorkspaceNamePrompt(label, initialValue).run();
}
