import { create } from "zustand";
import { runspaceInvoke } from "../core/api/runspaceInvoke";
import { useDialogStore } from "./dialogStore";
import { getAppSettings } from "./settingsStore";
import { languageFromExtension } from "../core/languageFromExtension";
import type { OpenFile, SessionData } from "../core/types/workspace";
import { reorderByIndex } from "../core/editor/tabReorder";
import {
  getEnvironmentSession,
  uniquePaths,
} from "../core/workspace/session";

interface EditorTabsStore {
  openFiles: OpenFile[];
  activePath: string | null;
  loaded: boolean;
  openFile: (path: string) => Promise<void>;
  closeFile: (path: string, force?: boolean) => Promise<boolean>;
  closeOthers: (path: string) => Promise<boolean>;
  closeRight: (path: string) => Promise<boolean>;
  closeAll: () => Promise<boolean>;
  setActive: (path: string) => void;
  reorderTabs: (fromIndex: number, toIndex: number) => void;
  updateContent: (path: string, content: string) => void;
  saveFile: (path: string) => Promise<void>;
  saveActiveFile: () => Promise<void>;
  renameOpenFile: (oldPath: string, newPath: string) => void;
  removeOpenFile: (path: string) => void;
  clearTabs: () => void;
  restoreForWorkspace: (
    session: SessionData,
    runtimeId: string,
    workspaceId: string,
  ) => Promise<void>;
  persistForEnvironment: (
    runtimeId: string,
    workspaceId: string | null,
  ) => Promise<void>;
}

function basename(path: string): string {
  const parts = path.split("/");
  return parts[parts.length - 1] ?? path;
}

export const useEditorTabsStore = create<EditorTabsStore>((set, get) => ({
  openFiles: [],
  activePath: null,
  loaded: false,

  openFile: async (path) => {
    const existing = get().openFiles.find((file) => file.path === path);
    if (existing) {
      set({ activePath: path });
      return;
    }

    const content = await runspaceInvoke<string>("read_file", { path });
    const language = languageFromExtension(path);
    const openFiles = [
      ...get().openFiles.filter((file) => file.path !== path),
      { path, content, dirty: false, language },
    ];
    set({ openFiles, activePath: path });
  },

  closeFile: async (path, force = false) => {
    const file = get().openFiles.find((item) => item.path === path);
    if (!file) {
      return true;
    }
    if (file.dirty && !force && getAppSettings().layout.confirmCloseUnsavedTab) {
      const name = basename(path);
      const confirmed = await useDialogStore.getState().askConfirm(
        `"${name}" has unsaved changes. Close without saving?`,
        { confirmLabel: "Close", danger: true },
      );
      if (!confirmed) {
        return false;
      }
    }

    const openFiles = get().openFiles.filter((item) => item.path !== path);
    let activePath = get().activePath;
    if (activePath === path) {
      const index = get().openFiles.findIndex((item) => item.path === path);
      const next = openFiles[index] ?? openFiles[index - 1] ?? null;
      activePath = next?.path ?? null;
    }
    set({ openFiles, activePath });
    return true;
  },

  closeOthers: async (path) => {
    const paths = get()
      .openFiles.filter((item) => item.path !== path)
      .map((item) => item.path);
    for (const itemPath of paths) {
      const closed = await get().closeFile(itemPath);
      if (!closed) {
        return false;
      }
    }
    return true;
  },

  closeRight: async (path) => {
    const openFiles = get().openFiles;
    const index = openFiles.findIndex((item) => item.path === path);
    if (index === -1) {
      return true;
    }
    const paths = openFiles.slice(index + 1).map((item) => item.path);
    for (const itemPath of paths) {
      const closed = await get().closeFile(itemPath);
      if (!closed) {
        return false;
      }
    }
    return true;
  },

  closeAll: async () => {
    const paths = get().openFiles.map((item) => item.path);
    for (const itemPath of paths) {
      const closed = await get().closeFile(itemPath);
      if (!closed) {
        return false;
      }
    }
    return true;
  },

  setActive: (path) => {
    if (get().openFiles.some((file) => file.path === path)) {
      set({ activePath: path });
    }
  },

  reorderTabs: (fromIndex, toIndex) => {
    const openFiles = reorderByIndex(get().openFiles, fromIndex, toIndex);
    if (openFiles === get().openFiles) {
      return;
    }
    set({ openFiles });
  },

  updateContent: (path, content) => {
    const openFiles = get().openFiles.map((file) =>
      file.path === path ? { ...file, content, dirty: true } : file,
    );
    set({ openFiles });
  },

  saveFile: async (path) => {
    const file = get().openFiles.find((item) => item.path === path);
    if (!file || !file.dirty) {
      return;
    }
    await runspaceInvoke("write_file", { path, content: file.content });
    const openFiles = get().openFiles.map((item) =>
      item.path === path ? { ...item, dirty: false } : item,
    );
    set({ openFiles });
  },

  saveActiveFile: async () => {
    const activePath = get().activePath;
    if (!activePath) {
      return;
    }
    await get().saveFile(activePath);
  },

  renameOpenFile: (oldPath, newPath) => {
    const language = languageFromExtension(newPath);
    const openFiles = get().openFiles.map((file) =>
      file.path === oldPath
        ? { ...file, path: newPath, language }
        : file,
    );
    const activePath = get().activePath === oldPath ? newPath : get().activePath;
    set({ openFiles, activePath });
  },

  removeOpenFile: (path) => {
    void get().closeFile(path, true);
  },

  clearTabs: () => {
    set({ openFiles: [], activePath: null });
  },

  restoreForWorkspace: async (session, runtimeId, workspaceId) => {
    const envSession = getEnvironmentSession(session, runtimeId);
    const savedTabs = envSession.workspace_tabs[workspaceId];
    const paths = uniquePaths(savedTabs?.open_files ?? []);

    if (paths.length === 0) {
      set({ openFiles: [], activePath: null });
      return;
    }

    const openFiles: OpenFile[] = [];
    for (const path of paths) {
      try {
        const content = await runspaceInvoke<string>("read_file", { path });
        openFiles.push({
          path,
          content,
          dirty: false,
          language: languageFromExtension(path),
        });
      } catch {
        // Skip missing files from a previous session.
      }
    }

    const activePath =
      savedTabs?.active_file &&
      openFiles.some((file) => file.path === savedTabs.active_file)
        ? savedTabs.active_file
        : openFiles[0]?.path ?? null;

    set({ openFiles, activePath });
  },

  persistForEnvironment: async (runtimeId, workspaceId) => {
    const session = await runspaceInvoke<SessionData>("read_session");
    const envSession = getEnvironmentSession(session, runtimeId);
    const { openFiles, activePath } = get();

    if (workspaceId) {
      envSession.workspace_id = workspaceId;
      envSession.workspace_tabs[workspaceId] = {
        open_files: uniquePaths(openFiles.map((file) => file.path)),
        active_file: activePath,
      };
    }

    const environments = {
      ...(session.environments ?? {}),
      [runtimeId]: envSession,
    };

    await runspaceInvoke("write_session", {
      session: { ...session, environments, last_runtime_id: runtimeId },
    });
    await runspaceInvoke("set_selected_environment", { environmentId: runtimeId });
  },
}));
