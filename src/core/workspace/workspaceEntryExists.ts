import { runspaceInvoke } from "../api/runspaceInvoke";
import type { FileEntry } from "../types/workspace";

async function listEntries(relativePath: string): Promise<FileEntry[]> {
  if (!relativePath) {
    return runspaceInvoke<FileEntry[]>("list_files", {});
  }
  return runspaceInvoke<FileEntry[]>("list_files", { relativePath });
}

export async function workspaceEntryExists(path: string): Promise<boolean> {
  const parent = path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : "";
  const entries = await listEntries(parent);
  return entries.some((entry) => entry.path === path);
}
