import { create } from "zustand";
import { runspaceInvoke } from "../core/api/runspaceInvoke";
import { useDialogStore } from "./dialogStore";
import { getAppSettings } from "./settingsStore";
import { languageFromExtension } from "../core/languageFromExtension";
import type { SessionData } from "../core/types/workspace";
import {
  pickNextActiveTab,
  rememberTabFocus,
  removeFromTabFocusHistory,
} from "../core/editor/tabFocusHistory";
import { reorderByIndex } from "../core/editor/tabReorder";
import { basename } from "../core/path/basename";
import { unique } from "../core/unique";
import { getEnvironmentSession } from "../core/workspace/session";
import { useWorkspaceStore } from "./workspaceStore";

interface OpenFile {
  path: string;
  content: string;
  dirty: boolean;
  language: string;
}

interface TabSessionSnapshot {
  runtimeId: string;
  workspaceId: string;
  openFiles: OpenFile[];
  activePath: string | null;
}

interface EditorTabsStore {
  openFiles: OpenFile[];
  activePath: string | null;
  focusHistory: string[];
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
  saveDirtyFiles: () => Promise<void>;
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
    tabState?: Pick<TabSessionSnapshot, "openFiles" | "activePath">,
  ) => Promise<void>;
}

let tabSessionPersistQueue = Promise.resolve();

/**
 * The queueTabSessionPersist function.
 * @param get - The function to get the editor tabs store.
 * @returns The queueTabSessionPersist function.
 */
function queueTabSessionPersist(get: () => EditorTabsStore): void {
  const workspace = useWorkspaceStore.getState().workspace;
  if (!workspace) {
    return;
  }

  const snapshot: TabSessionSnapshot = {
    runtimeId: workspace.runtime_id,
    workspaceId: workspace.id,
    openFiles: get().openFiles,
    activePath: get().activePath,
  };

  tabSessionPersistQueue = tabSessionPersistQueue
    .then(async () => {
      await get().persistForEnvironment(snapshot.runtimeId, snapshot.workspaceId, {
        openFiles: snapshot.openFiles,
        activePath: snapshot.activePath,
      });
    })
    .catch((error) => {
      console.error("Failed to persist tab session:", error);
    });
}

/**
 * The useEditorTabsStore hook.
 * @returns The useEditorTabsStore hook.
 */
export const useEditorTabsStore = create<EditorTabsStore>((set, get) => ({
  openFiles: [],
  activePath: null,
  focusHistory: [],
  loaded: false,

  openFile: async (path) => {
    const existing = get().openFiles.find((file) => file.path === path);
    if (existing) {
      const currentActive = get().activePath;
      if (currentActive === path) {
        return;
      }
      set({
        activePath: path,
        focusHistory: rememberTabFocus(get().focusHistory, currentActive),
      });
      queueTabSessionPersist(get);
      return;
    }

    const content = await runspaceInvoke<string>("read_file", { path });
    const language = languageFromExtension(path);
    const currentActive = get().activePath;
    const openFiles = [
      ...get().openFiles.filter((file) => file.path !== path),
      { path, content, dirty: false, language },
    ];
    set({
      openFiles,
      activePath: path,
      focusHistory: rememberTabFocus(get().focusHistory, currentActive),
    });
    queueTabSessionPersist(get);
  },

  closeFile: async (path, force = false) => {
    const file = get().openFiles.find((item) => item.path === path);
    if (!file) {
      return true;
    }
    if (file.dirty && !force && getAppSettings().layout.confirmCloseUnsavedTab) {
      const name = basename(path);
      const confirmed = await useDialogStore
        .getState()
        .askConfirm(`"${name}" has unsaved changes. Close without saving?`, {
          confirmLabel: "Close",
          danger: true,
        });
      if (!confirmed) {
        return false;
      }
    }

    const closedIndex = get().openFiles.findIndex((item) => item.path === path);
    const openFiles = get().openFiles.filter((item) => item.path !== path);
    const focusHistory = removeFromTabFocusHistory(get().focusHistory, path);
    let activePath = get().activePath;
    if (activePath === path) {
      activePath = pickNextActiveTab(
        focusHistory,
        openFiles.map((file) => file.path),
        closedIndex,
      );
    }
    set({ openFiles, activePath, focusHistory });
    queueTabSessionPersist(get);
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
    if (!get().openFiles.some((file) => file.path === path)) {
      return;
    }
    const currentActive = get().activePath;
    if (currentActive === path) {
      return;
    }
    set({
      activePath: path,
      focusHistory: rememberTabFocus(get().focusHistory, currentActive),
    });
    queueTabSessionPersist(get);
  },

  reorderTabs: (fromIndex, toIndex) => {
    const openFiles = reorderByIndex(get().openFiles, fromIndex, toIndex);
    if (openFiles === get().openFiles) {
      return;
    }
    set({ openFiles });
    queueTabSessionPersist(get);
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

  saveDirtyFiles: async () => {
    for (const file of get().openFiles) {
      if (file.dirty) {
        await get().saveFile(file.path);
      }
    }
  },

  renameOpenFile: (oldPath, newPath) => {
    const language = languageFromExtension(newPath);
    const openFiles = get().openFiles.map((file) =>
      file.path === oldPath ? { ...file, path: newPath, language } : file,
    );
    const activePath = get().activePath === oldPath ? newPath : get().activePath;
    set({ openFiles, activePath });
  },

  removeOpenFile: (path) => {
    const matches = (filePath: string) => filePath === path || filePath.startsWith(`${path}/`);
    const openFiles = get().openFiles.filter((file) => !matches(file.path));
    if (openFiles.length === get().openFiles.length) {
      return;
    }

    let focusHistory = get().focusHistory;
    for (const file of get().openFiles) {
      if (matches(file.path)) {
        focusHistory = removeFromTabFocusHistory(focusHistory, file.path);
      }
    }

    const closedIndex = get().openFiles.findIndex((file) => file.path === get().activePath);
    let activePath = get().activePath;
    if (activePath && matches(activePath)) {
      activePath = pickNextActiveTab(
        focusHistory,
        openFiles.map((file) => file.path),
        closedIndex,
      );
    }

    set({ openFiles, activePath, focusHistory });
    queueTabSessionPersist(get);
  },

  clearTabs: () => {
    set({ openFiles: [], activePath: null, focusHistory: [] });
  },

  restoreForWorkspace: async (session, runtimeId, workspaceId) => {
    const envSession = getEnvironmentSession(session, runtimeId);
    const savedTabs = envSession.workspace_tabs[workspaceId];
    const paths = unique(savedTabs?.open_files ?? []);

    if (paths.length === 0) {
      set({ openFiles: [], activePath: null, focusHistory: [] });
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
      savedTabs?.active_file && openFiles.some((file) => file.path === savedTabs.active_file)
        ? savedTabs.active_file
        : (openFiles[0]?.path ?? null);

    set({ openFiles, activePath, focusHistory: [] });
  },

  persistForEnvironment: async (runtimeId, workspaceId, tabState) => {
    const session = await runspaceInvoke<SessionData>("read_session");
    const envSession = getEnvironmentSession(session, runtimeId);
    const openFiles = tabState?.openFiles ?? get().openFiles;
    const activePath = tabState?.activePath ?? get().activePath;

    if (workspaceId) {
      envSession.workspace_id = workspaceId;
      envSession.workspace_tabs[workspaceId] = {
        open_files: unique(openFiles.map((file) => file.path)),
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
