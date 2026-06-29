import { create } from "zustand";
import { isInvalidPaste } from "../core/workspace/fileTreeDrag";
import { useWorkspaceStore } from "./workspaceStore";

export type FileClipboardMode = "cut" | "copy";

export interface FileClipboardEntry {
  path: string;
  mode: FileClipboardMode;
}

interface FileClipboardStore {
  entry: FileClipboardEntry | null;
  cut: (path: string) => void;
  copy: (path: string) => void;
  pasteInto: (targetDir: string) => Promise<void>;
}

export const useFileClipboardStore = create<FileClipboardStore>((set, get) => ({
  entry: null,
  cut: (path) => set({ entry: { path, mode: "cut" } }),
  copy: (path) => set({ entry: { path, mode: "copy" } }),
  pasteInto: async (targetDir) => {
    const entry = get().entry;
    if (!entry || isInvalidPaste(entry.path, targetDir, entry.mode)) {
      return;
    }

    const { moveFile, copyEntry } = useWorkspaceStore.getState();
    if (entry.mode === "cut") {
      await moveFile(entry.path, targetDir);
      set({ entry: null });
      return;
    }

    await copyEntry(entry.path, targetDir);
  },
}));
