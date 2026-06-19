import { runspaceInvoke } from "../api/runspaceInvoke";
import type { FileEntry } from "../types/workspace";

export async function workspaceEntryExists(path: string): Promise<boolean> {
  const parent = path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : "";
  let entries: FileEntry[] = [];
  if (! parent) {
    entries = await runspaceInvoke<FileEntry[]>("list_files", {});
  } else {
    entries = await runspaceInvoke<FileEntry[]>("list_files", { relativePath: parent });
  }
  return entries.some((entry) => entry.path === path);
}
