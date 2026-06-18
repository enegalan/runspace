import { create } from "zustand";
import {
  isOnboardingComplete,
  markOnboardingComplete,
} from "../core/onboarding/onboardingState";
import { runspaceInvoke } from "../core/api/runspaceInvoke";
import { activateRuntime } from "../core/workspace/activateRuntime";
import { confirmEntryReplace } from "../core/workspace/confirmEntryReplace";
import { readFileAsText } from "../core/workspace/externalFileDrop";
import { movedPath, parentDir } from "../core/workspace/fileTreeDrag";
import { workspaceEntryExists } from "../core/workspace/workspaceEntryExists";
import { requireWorkspaceName } from "../core/workspace/promptWorkspaceName";
import { syncActiveWorkspace } from "../core/workspace/syncActiveWorkspace";
import { getAppSettings } from "./settingsStore";
import type { FileEntry, SessionData, WorkspaceInfo } from "../core/types/workspace";
import { useEditorTabsStore } from "./editorTabsStore";

interface WorkspaceStore {
  workspace: WorkspaceInfo | null;
  workspaces: WorkspaceInfo[];
  rootFiles: FileEntry[];
  expandedDirs: Set<string>;
  filesRevision: number;
  loaded: boolean;
  onboardingRequired: boolean;
  onboardingComplete: boolean;
  initialize: (runtimeId: string | null) => Promise<void>;
  finishOnboarding: (runtimeId: string, workspaceName: string) => Promise<void>;
  switchEnvironment: (runtimeId: string) => Promise<boolean>;
  switchWorkspace: (id: string) => Promise<void>;
  loadWorkspaces: (runtimeId: string) => Promise<void>;
  createWorkspace: (runtimeId: string, name?: string) => Promise<void>;
  renameWorkspace: (workspaceId: string, name: string) => Promise<void>;
  deleteWorkspace: (workspaceId: string) => Promise<void>;
  refreshFiles: () => Promise<void>;
  listDirectory: (relativePath: string) => Promise<FileEntry[]>;
  createFile: (path: string, content?: string) => Promise<void>;
  createFolder: (path: string) => Promise<void>;
  deleteFile: (path: string) => Promise<void>;
  renameFile: (oldPath: string, newPath: string) => Promise<void>;
  moveFile: (sourcePath: string, targetDir: string) => Promise<void>;
  importExternalFiles: (
    sources: string[] | File[],
    targetDir?: string,
  ) => Promise<string[]>;
  toggleDir: (path: string) => void;
  expandDir: (path: string) => void;
}

function entryName(path: string): string {
  return path.split(/[/\\]/).pop() ?? path;
}

async function replaceEntryIfConfirmed(
  relativePath: string,
  deleteFile: (path: string) => Promise<void>,
): Promise<boolean> {
  if (!(await workspaceEntryExists(relativePath))) {
    return true;
  }
  if (!(await confirmEntryReplace(entryName(relativePath)))) {
    return false;
  }
  useEditorTabsStore.getState().removeOpenFile(relativePath);
  await deleteFile(relativePath);
  return true;
}

async function syncIfNeeded(workspace: WorkspaceInfo | null): Promise<void> {
  if (workspace) {
    await syncActiveWorkspace(workspace);
  }
}

function applyNoActiveWorkspaceState(
  set: (
    partial:
      | Partial<WorkspaceStore>
      | ((state: WorkspaceStore) => Partial<WorkspaceStore>),
  ) => void,
  get: () => WorkspaceStore,
): void {
  useEditorTabsStore.getState().clearTabs();
  set({
    workspace: null,
    workspaces: [],
    rootFiles: [],
    expandedDirs: new Set<string>(),
    filesRevision: get().filesRevision + 1,
    onboardingComplete: true,
    onboardingRequired: false,
    loaded: true,
  });
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
  onboardingRequired: false,
  onboardingComplete: false,

  initialize: async (runtimeId) => {
    const onboardingComplete = get().onboardingComplete || isOnboardingComplete();

    if (!runtimeId) {
      set({
        workspace: null,
        workspaces: [],
        rootFiles: [],
        expandedDirs: new Set<string>(),
        onboardingComplete,
        onboardingRequired: !onboardingComplete,
        loaded: true,
      });
      return;
    }

    const allWorkspaces = await runspaceInvoke<WorkspaceInfo[]>("list_workspaces", {});

    if (allWorkspaces.length === 0) {
      set({
        workspace: null,
        workspaces: [],
        rootFiles: [],
        expandedDirs: new Set<string>(),
        onboardingComplete,
        onboardingRequired: !onboardingComplete,
        loaded: true,
      });
      return;
    }

    set({ onboardingComplete: true, onboardingRequired: false });
    await markOnboardingComplete();

    const workspace = await activateRuntime(
      runtimeId,
      getAppSettings().layout.restoreLastWorkspace,
    );
    if (!workspace) {
      set({
        workspace: null,
        workspaces: [],
        rootFiles: [],
        expandedDirs: new Set<string>(),
        filesRevision: get().filesRevision + 1,
        onboardingComplete: true,
        onboardingRequired: false,
        loaded: true,
      });
      await get().loadWorkspaces(runtimeId);
      return;
    }

    set({
      workspace,
      rootFiles: [],
      expandedDirs: new Set<string>(),
      filesRevision: get().filesRevision + 1,
      onboardingComplete: true,
      onboardingRequired: false,
      loaded: true,
    });
    await get().loadWorkspaces(runtimeId);
    await get().refreshFiles();

    const session = await runspaceInvoke<SessionData>("read_session");
    await useEditorTabsStore
      .getState()
      .restoreForWorkspace(session, runtimeId, workspace.id);
  },

  finishOnboarding: async (runtimeId, workspaceName) => {
    await get().createWorkspace(runtimeId, workspaceName);
  },

  switchEnvironment: async (runtimeId) => {
    const current = get().workspace;
    if (current?.runtime_id) {
      await useEditorTabsStore
        .getState()
        .persistForEnvironment(current.runtime_id, current.id);
    }

    const runtimeWorkspaces = await runspaceInvoke<WorkspaceInfo[]>("list_workspaces", {
      runtimeId,
    });

    if (runtimeWorkspaces.length === 0) {
      const workspaceName = await requireWorkspaceName(
        "Name for the first workspace in this environment",
      );
      if (!workspaceName) {
        return false;
      }
      await get().createWorkspace(runtimeId, workspaceName);
      useEditorTabsStore.getState().clearTabs();
      return get().workspace !== null;
    }

    const workspace = await activateRuntime(runtimeId);
    if (!workspace) {
      return false;
    }

    useEditorTabsStore.getState().clearTabs();

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

  createWorkspace: async (runtimeId, name) => {
    const workspaceName = name ?? (await requireWorkspaceName("Name for the new workspace"));
    if (!workspaceName) {
      return;
    }

    const current = get().workspace;
    if (current) {
      await useEditorTabsStore
        .getState()
        .persistForEnvironment(current.runtime_id, current.id);
    }

    const workspace = await runspaceInvoke<WorkspaceInfo>("create_workspace", {
      name: workspaceName,
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

    set({ onboardingComplete: true, onboardingRequired: false });
    void markOnboardingComplete();
  },

  renameWorkspace: async (workspaceId, name) => {
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

  deleteWorkspace: async (workspaceId) => {
    const current = get().workspace;
    const runtimeId = current?.runtime_id;
    if (!runtimeId) {
      return;
    }

    const isActive = current.id === workspaceId;
    if (isActive) {
      try {
        await useEditorTabsStore
          .getState()
          .persistForEnvironment(runtimeId, workspaceId);
      } catch (error) {
        console.error("Failed to persist workspace session before delete:", error);
      }
    }

    await runspaceInvoke("delete_workspace", { id: workspaceId });

    const runtimeWorkspaces =
      (await runspaceInvoke<WorkspaceInfo[]>("list_workspaces", {
        runtimeId,
      })) ?? [];

    if (isActive) {
      if (runtimeWorkspaces.length === 0) {
        applyNoActiveWorkspaceState(set, get);
        await markOnboardingComplete();
        return;
      }
      await get().switchWorkspace(runtimeWorkspaces[0].id);
      return;
    }

    await get().loadWorkspaces(runtimeId);
  },

  refreshFiles: async () => {
    if (!get().workspace) {
      set({ rootFiles: [], filesRevision: get().filesRevision + 1 });
      return;
    }
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
    await syncIfNeeded(get().workspace);
    if (!(await replaceEntryIfConfirmed(newPath, get().deleteFile))) {
      return;
    }
    await get().renameFile(sourcePath, newPath);
    useEditorTabsStore.getState().renameOpenFile(sourcePath, newPath);
  },

  importExternalFiles: async (sources, targetDir = "") => {
    if (!get().workspace) {
      return [];
    }
    await syncIfNeeded(get().workspace);

    let imported: string[] = [];
    if (typeof sources[0] === "string") {
      const sourcePaths: string[] = [];
      for (const sourcePath of sources as string[]) {
        const relativePath = targetDir
          ? `${targetDir}/${entryName(sourcePath)}`
          : entryName(sourcePath);
        if (!(await replaceEntryIfConfirmed(relativePath, get().deleteFile))) {
          continue;
        }
        sourcePaths.push(sourcePath);
      }
      if (sourcePaths.length > 0) {
        imported =
          (await runspaceInvoke<string[]>("import_external", {
            sourcePaths,
            targetDir: targetDir || undefined,
          })) ?? [];
      }
    } else {
      for (const file of sources as File[]) {
        const relativePath = targetDir ? `${targetDir}/${file.name}` : file.name;
        if (!(await replaceEntryIfConfirmed(relativePath, get().deleteFile))) {
          continue;
        }
        const content = await readFileAsText(file);
        await runspaceInvoke("write_file", { path: relativePath, content });
        imported.push(relativePath);
      }
    }

    if (targetDir) {
      get().expandDir(targetDir);
    }
    await get().refreshFiles();
    return imported;
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
