import { create } from "zustand";
import { runspaceInvoke } from "../core/api/runspaceInvoke";
import { activateRuntime } from "../core/workspace/activateRuntime";
import { movedPath, parentDir } from "../core/workspace/fileTreeDrag";
import { workspaceEntryExists } from "../core/workspace/workspaceEntryExists";
import { requireProjectName } from "../core/workspace/promptProjectName";
import { syncActiveWorkspace } from "../core/workspace/syncActiveWorkspace";
import type { FileEntry, SessionData, WorkspaceInfo } from "../core/types/workspace";
import { useEditorTabsStore } from "./editorTabsStore";

interface WorkspaceStore {
  workspace: WorkspaceInfo | null;
  workspaces: WorkspaceInfo[];
  rootFiles: FileEntry[];
  expandedDirs: Set<string>;
  filesRevision: number;
  loaded: boolean;
  initialize: (runtimeId: string) => Promise<void>;
  switchEnvironment: (runtimeId: string) => Promise<boolean>;
  switchWorkspace: (id: string) => Promise<void>;
  loadWorkspaces: (runtimeId: string) => Promise<void>;
  createProject: (runtimeId: string, name?: string) => Promise<void>;
  renameProject: (workspaceId: string, name: string) => Promise<void>;
  deleteProject: (workspaceId: string) => Promise<void>;
  refreshFiles: () => Promise<void>;
  listDirectory: (relativePath: string) => Promise<FileEntry[]>;
  createFile: (path: string, content?: string) => Promise<void>;
  createFolder: (path: string) => Promise<void>;
  deleteFile: (path: string) => Promise<void>;
  renameFile: (oldPath: string, newPath: string) => Promise<void>;
  moveFile: (sourcePath: string, targetDir: string) => Promise<void>;
  toggleDir: (path: string) => void;
  expandDir: (path: string) => void;
}

async function syncIfNeeded(workspace: WorkspaceInfo | null): Promise<void> {
  if (workspace) {
    await syncActiveWorkspace(workspace);
  }
}

async function activateWorkspace(
  workspace: WorkspaceInfo,
  runtimeId: string,
  resetExpanded = true,
): Promise<void> {
  await syncIfNeeded(workspace);
  const session = await runspaceInvoke<SessionData>("read_session");
  useEditorTabsStore.getState().clearTabs();
  useWorkspaceStore.setState({
    workspace,
    rootFiles: [],
    expandedDirs: resetExpanded ? new Set<string>() : useWorkspaceStore.getState().expandedDirs,
    filesRevision: useWorkspaceStore.getState().filesRevision + 1,
  });
  await useWorkspaceStore.getState().refreshFiles();
  await useEditorTabsStore
    .getState()
    .restoreForWorkspace(session, runtimeId, workspace.id);
}

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  workspace: null,
  workspaces: [],
  rootFiles: [],
  expandedDirs: new Set<string>(),
  filesRevision: 0,
  loaded: false,

  initialize: async (runtimeId) => {
    const workspace = await activateRuntime(runtimeId, {
      promptLabel: "Name for your first project",
    });
    if (!workspace) {
      set({ workspace: null, workspaces: [], rootFiles: [], loaded: true });
      return;
    }

    set({
      workspace,
      rootFiles: [],
      expandedDirs: new Set<string>(),
      filesRevision: get().filesRevision + 1,
      loaded: true,
    });
    await get().loadWorkspaces(runtimeId);
    await get().refreshFiles();

    const session = await runspaceInvoke<SessionData>("read_session");
    await useEditorTabsStore
      .getState()
      .restoreForWorkspace(session, runtimeId, workspace.id);
  },

  switchEnvironment: async (runtimeId) => {
    const current = get().workspace;
    if (current?.runtime_id) {
      await useEditorTabsStore
        .getState()
        .persistForEnvironment(current.runtime_id, current.id);
    }

    const workspace = await activateRuntime(runtimeId);
    if (!workspace) {
      return false;
    }

    set({
      workspace,
      rootFiles: [],
      expandedDirs: new Set<string>(),
      filesRevision: get().filesRevision + 1,
    });
    await get().loadWorkspaces(runtimeId);
    await get().refreshFiles();

    const session = await runspaceInvoke<SessionData>("read_session");
    await useEditorTabsStore
      .getState()
      .restoreForWorkspace(session, runtimeId, workspace.id);
    return true;
  },

  switchWorkspace: async (id) => {
    const current = get().workspace;
    if (current) {
      await useEditorTabsStore
        .getState()
        .persistForEnvironment(current.runtime_id, current.id);
    }

    const workspace = await runspaceInvoke<WorkspaceInfo>("open_workspace", { id });
    await activateWorkspace(workspace, workspace.runtime_id);
    await get().loadWorkspaces(workspace.runtime_id);
  },

  loadWorkspaces: async (runtimeId) => {
    const workspaces = await runspaceInvoke<WorkspaceInfo[]>("list_workspaces", {
      runtimeId,
    });
    set({ workspaces });
  },

  createProject: async (runtimeId, name) => {
    const projectName = name ?? (await requireProjectName("Name for the new project"));
    if (!projectName) {
      return;
    }

    const current = get().workspace;
    if (current) {
      await useEditorTabsStore
        .getState()
        .persistForEnvironment(current.runtime_id, current.id);
    }

    const workspace = await runspaceInvoke<WorkspaceInfo>("create_workspace", {
      name: projectName,
      runtimeId,
    });
    await syncIfNeeded(workspace);
    set({
      workspace,
      rootFiles: [],
      expandedDirs: new Set<string>(),
      filesRevision: get().filesRevision + 1,
    });
    await get().loadWorkspaces(runtimeId);
    await get().refreshFiles();

    useEditorTabsStore.getState().clearTabs();
    await useEditorTabsStore
      .getState()
      .persistForEnvironment(runtimeId, workspace.id);
  },

  renameProject: async (workspaceId, name) => {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }

    const workspace = await runspaceInvoke<WorkspaceInfo>("rename_workspace", {
      id: workspaceId,
      name: trimmed,
    });
    const current = get().workspace;
    if (current?.id === workspaceId) {
      set({ workspace });
    }
    await get().loadWorkspaces(workspace.runtime_id);
  },

  deleteProject: async (workspaceId) => {
    const current = get().workspace;
    const runtimeId = current?.runtime_id;
    if (!runtimeId) {
      return;
    }

    const isActive = current.id === workspaceId;
    if (isActive) {
      await useEditorTabsStore
        .getState()
        .persistForEnvironment(runtimeId, workspaceId);
    }

    await runspaceInvoke("delete_workspace", { id: workspaceId });

    const remaining = get().workspaces.filter((item) => item.id !== workspaceId);
    if (remaining.length === 0) {
      useEditorTabsStore.getState().clearTabs();
      const workspace = await activateRuntime(runtimeId, {
        promptLabel: "Name for the new project",
      });
      if (!workspace) {
        set({
          workspace: null,
          workspaces: [],
          expandedDirs: new Set<string>(),
          rootFiles: [],
          filesRevision: get().filesRevision + 1,
        });
        return;
      }
      set({
        workspace,
        expandedDirs: new Set<string>(),
        rootFiles: [],
        filesRevision: get().filesRevision + 1,
      });
      await get().loadWorkspaces(runtimeId);
      await get().refreshFiles();
      const session = await runspaceInvoke<SessionData>("read_session");
      await useEditorTabsStore
        .getState()
        .restoreForWorkspace(session, runtimeId, workspace.id);
      return;
    }

    if (isActive) {
      await get().switchWorkspace(remaining[0].id);
      return;
    }

    await get().loadWorkspaces(runtimeId);
  },

  refreshFiles: async () => {
    await syncIfNeeded(get().workspace);
    const files = await runspaceInvoke<FileEntry[]>("list_files", {});
    set({
      rootFiles: files,
      filesRevision: get().filesRevision + 1,
    });
  },

  listDirectory: async (relativePath) => {
    await syncIfNeeded(get().workspace);
    if (!relativePath) {
      return runspaceInvoke<FileEntry[]>("list_files", {});
    }
    return runspaceInvoke<FileEntry[]>("list_files", { relativePath });
  },

  createFile: async (path, content = "") => {
    if (await workspaceEntryExists(path)) {
      throw new Error(`"${path}" already exists.`);
    }
    await syncIfNeeded(get().workspace);
    await runspaceInvoke("write_file", { path, content });
    const parent = parentDir(path);
    if (parent) {
      get().expandDir(parent);
    }
    await get().refreshFiles();
  },

  createFolder: async (path) => {
    if (await workspaceEntryExists(path)) {
      throw new Error(`"${path}" already exists.`);
    }
    await syncIfNeeded(get().workspace);
    await runspaceInvoke("create_directory", { path });
    const parent = parentDir(path);
    if (parent) {
      get().expandDir(parent);
    }
    get().expandDir(path);
    await get().refreshFiles();
  },

  deleteFile: async (path) => {
    await syncIfNeeded(get().workspace);
    await runspaceInvoke("delete_file", { path });
    await get().refreshFiles();
  },

  renameFile: async (oldPath, newPath) => {
    if (oldPath !== newPath && (await workspaceEntryExists(newPath))) {
      throw new Error(`"${newPath}" already exists.`);
    }
    await syncIfNeeded(get().workspace);
    await runspaceInvoke("rename_file", { oldPath, newPath });
    await get().refreshFiles();
  },

  moveFile: async (sourcePath, targetDir) => {
    const newPath = movedPath(sourcePath, targetDir);
    if (sourcePath === newPath) {
      return;
    }
    await get().renameFile(sourcePath, newPath);
    useEditorTabsStore.getState().renameOpenFile(sourcePath, newPath);
  },

  toggleDir: (path) => {
    const next = new Set(get().expandedDirs);
    if (next.has(path)) {
      next.delete(path);
    } else {
      next.add(path);
    }
    set({ expandedDirs: next });
  },

  expandDir: (path) => {
    const next = new Set(get().expandedDirs);
    next.add(path);
    set({ expandedDirs: next });
  },
}));
