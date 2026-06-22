import { runspaceInvoke } from "../api/runspaceInvoke";
import type { FileEntry } from "../types/workspace";

/**
 * This function is used to check if a file or folder exists in a workspace.
 * @param workspaceId - The ID of the workspace.
 * @param path - The path of the entry.
 * @returns True if the entry exists, false otherwise.
 */
export async function workspaceEntryExists(workspaceId: string, path: string): Promise<boolean> {
  const parent = path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : "";
  const listArgs: Record<string, unknown> = { id: workspaceId };
  if (parent) {
    listArgs.relativePath = parent;
  }
  const entries = await runspaceInvoke<FileEntry[]>("list_files", listArgs);
  return entries.some((entry) => entry.path === path);
}
