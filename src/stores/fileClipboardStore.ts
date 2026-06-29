import { create } from "zustand";
import { isInvalidPaste } from "../core/workspace/fileTreeDrag";
import { useWorkspaceStore } from "./workspaceStore";

export type FileClipboardMode = "cut" | "copy";

export interface FileClipboardEntry {
  path: string;
  mode: FileClipboardMode;
  workspaceId: string;
}

interface FileClipboardStore {
  entry: FileClipboardEntry | null;
  cut: (path: string, workspaceId: string) => void;
  copy: (path: string, workspaceId: string) => void;
  pasteInto: (targetDir: string) => Promise<void>;
}

export function clipboardMatchesWorkspace(
  entry: FileClipboardEntry | null,
  workspaceId: string,
): entry is FileClipboardEntry {
  return entry !== null && entry.workspaceId === workspaceId;
}

export const useFileClipboardStore = create<FileClipboardStore>((set, get) => ({
  entry: null,
  cut: (path, workspaceId) => set({ entry: { path, mode: "cut", workspaceId } }),
  copy: (path, workspaceId) => set({ entry: { path, mode: "copy", workspaceId } }),
  pasteInto: async (targetDir) => {
    const entry = get().entry;
    const workspace = useWorkspaceStore.getState().workspace;
    if (!entry || !workspace || entry.workspaceId !== workspace.id) {
      if (entry && workspace && entry.workspaceId !== workspace.id) {
        set({ entry: null });
      }
      return;
    }
    if (isInvalidPaste(entry.path, targetDir, entry.mode)) {
      return;
    }

    const { moveFile, copyEntry } = useWorkspaceStore.getState();
    if (entry.mode === "cut") {
      const moved = await moveFile(entry.path, targetDir);
      if (moved) {
        set({ entry: null });
      }
      return;
    }

    await copyEntry(entry.path, targetDir);
  },
}));
