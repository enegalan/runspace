import { create } from "zustand";

export interface FileTreeSelection {
  path: string;
  workspaceId: string;
  isDirectory: boolean;
}

interface FileTreeSelectionStore {
  selection: FileTreeSelection | null;
  setSelection: (selection: FileTreeSelection) => void;
  clearSelection: () => void;
}

export const useFileTreeSelectionStore = create<FileTreeSelectionStore>((set) => ({
  selection: null,
  setSelection: (selection) => set({ selection }),
  clearSelection: () => set({ selection: null }),
}));
