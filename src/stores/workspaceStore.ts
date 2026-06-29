import { create } from "zustand";
import { isOnboardingComplete, markOnboardingComplete } from "../core/onboarding/onboardingState";
import { basename } from "../core/path/basename";
import { runspaceInvoke } from "../core/api/runspaceInvoke";
import { readFileAsText } from "../core/workspace/externalFileDrop";
import { movedPath, parentDir } from "../core/workspace/fileTreeDrag";
import { workspaceEntryExists } from "../core/workspace/workspaceEntryExists";
import { requireWorkspaceName } from "../core/workspace/prompts/workspaceNamePrompt";
import { getAppSettings } from "./settingsStore";
import type { FileEntry, SessionData, WorkspaceInfo } from "../core/types/workspace";
import type { EnvironmentId } from "../core/types/environment";
import { useEditorTabsStore } from "./editorTabsStore";
import { useDialogStore } from "./dialogStore";
import { useEnvironmentStore } from "./environmentStore";
import { useExecutionStore } from "./executionStore";

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
  recoverFromFailure: (runtimeId: string | null) => Promise<void>;
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
  moveFile: (sourcePath: string, targetDir: string) => Promise<boolean>;
  copyEntry: (sourcePath: string, targetDir: string) => Promise<void>;
  importExternalFiles: (sources: string[] | File[], targetDir?: string) => Promise<string[]>;
  toggleDir: (path: string) => void;
  expandDir: (path: string) => void;
}

/**
 * The clearedFileTree function.
 * @param filesRevision - The files revision.
 * @returns The cleared file tree.
 */
function clearedFileTree(filesRevision: number) {
  return {
    rootFiles: [] as FileEntry[],
    expandedDirs: new Set<string>(),
    filesRevision: filesRevision + 1,
  };
}

/**
 * The emptyWorkspaceState function.
 * @param get - The function to get the workspace store.
 * @param onboardingComplete - Whether the onboarding is complete.
 * @returns The empty workspace state.
 */
function emptyWorkspaceState(
  get: () => WorkspaceStore,
  onboardingComplete: boolean,
): Partial<WorkspaceStore> {
  return {
    workspace: null,
    workspaces: [],
    ...clearedFileTree(get().filesRevision),
    onboardingComplete,
    onboardingRequired: !onboardingComplete,
    loaded: true,
  };
}

/**
 * The replaceEntryIfConfirmed function.
 * @param workspaceId - The workspace ID.
 * @param relativePath - The relative path.
 * @param deleteFile - The function to delete the file.
 * @returns The replaced entry.
 */
async function replaceEntryIfConfirmed(
  workspaceId: string,
  relativePath: string,
  deleteFile: (path: string) => Promise<void>,
): Promise<boolean> {
  if (!(await workspaceEntryExists(workspaceId, relativePath))) {
    return true;
  }
  if (
    !(await useDialogStore
      .getState()
      .askConfirm(
        `A file or folder named "${basename(relativePath)}" already exists in the destination folder. Do you want to replace it?`,
        { confirmLabel: "Replace", danger: true },
      ))
  ) {
    return false;
  }
  useEditorTabsStore.getState().removeOpenFile(relativePath);
  await deleteFile(relativePath);
  return true;
}

/**
 * The applyNoActiveWorkspaceState function.
 * @param set - The function to set the workspace store.
 * @param get - The function to get the workspace store.
 * @returns The applied no active workspace state.
 */
function applyNoActiveWorkspaceState(
  set: (
    partial: Partial<WorkspaceStore> | ((state: WorkspaceStore) => Partial<WorkspaceStore>),
  ) => void,
  get: () => WorkspaceStore,
): void {
  useEditorTabsStore.getState().clearTabs();
  set({
    ...emptyWorkspaceState(get, true),
    onboardingRequired: false,
  });
}

/**
 * The prepareForWorkspaceSwitch function.
 * @returns The prepared for workspace switch.
 */
async function prepareForWorkspaceSwitch(): Promise<void> {
  await useEditorTabsStore.getState().saveDirtyFiles();
  await runspaceInvoke("kill_process");
  useExecutionStore.getState().reset();
}

/**
 * The persistCurrentWorkspaceTabs function.
 * @returns The persisted current workspace tabs.
 */
async function persistCurrentWorkspaceTabs(): Promise<void> {
  const workspace = useWorkspaceStore.getState().workspace;
  if (!workspace) {
    return;
  }
  await useEditorTabsStore.getState().persistForEnvironment(workspace.runtime_id, workspace.id);
}

/**
 * The activateWorkspace function.
 * @param workspace - The workspace.
 * @param runtimeId - The runtime ID.
 * @param resetExpanded - Whether to reset the expanded directories.
 * @returns The activated workspace.
 */
async function activateWorkspace(
  workspace: WorkspaceInfo,
  runtimeId: string,
  resetExpanded = true,
): Promise<void> {
  const session = await runspaceInvoke<SessionData>("read_session");
  useEditorTabsStore.getState().clearTabs();
  const { filesRevision, expandedDirs } = useWorkspaceStore.getState();
  useWorkspaceStore.setState({
    workspace,
    ...clearedFileTree(filesRevision),
    expandedDirs: resetExpanded ? new Set<string>() : expandedDirs,
  });
  await useWorkspaceStore.getState().refreshFiles();
  await useEditorTabsStore.getState().restoreForWorkspace(session, runtimeId, workspace.id);
}

/**
 * Activates the runtime.
 * @param runtimeId - The runtime ID to activate.
 * @param useSession - Whether to use the session.
 * @returns The workspace info.
 */
export async function activateRuntime(
  runtimeId: string,
  useSession = true,
): Promise<WorkspaceInfo | null> {
  const existing = await runspaceInvoke<WorkspaceInfo[]>("list_workspaces", {
    runtimeId,
  });

  if (existing.length === 0) {
    return null;
  }

  try {
    const workspace = await runspaceInvoke<WorkspaceInfo>("initialize_workspace", {
      runtimeId,
      useSession,
    });
    await runspaceInvoke<WorkspaceInfo>("open_workspace", { id: workspace.id });
    return workspace;
  } catch {
    return null;
  }
}

/**
 * The useWorkspaceStore hook.
 * @returns The useWorkspaceStore hook.
 */
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
      set(emptyWorkspaceState(get, onboardingComplete));
      return;
    }

    const allWorkspaces = await runspaceInvoke<WorkspaceInfo[]>("list_workspaces", {});

    if (allWorkspaces.length === 0) {
      set(emptyWorkspaceState(get, onboardingComplete));
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
        ...emptyWorkspaceState(get, true),
        onboardingRequired: false,
      });
      await get().loadWorkspaces(runtimeId);
      return;
    }

    set({
      workspace,
      ...clearedFileTree(get().filesRevision),
      onboardingComplete: true,
      onboardingRequired: false,
      loaded: true,
    });
    await get().loadWorkspaces(runtimeId);
    await get().refreshFiles();

    const session = await runspaceInvoke<SessionData>("read_session");
    await useEditorTabsStore.getState().restoreForWorkspace(session, runtimeId, workspace.id);
  },

  recoverFromFailure: async (runtimeId) => {
    const active = await runspaceInvoke<WorkspaceInfo | null>("get_active_workspace");
    if (active) {
      set({ workspace: active, loaded: true });
      if (runtimeId) {
        await get().loadWorkspaces(runtimeId);
        await get().refreshFiles();
      }
    } else {
      set({ loaded: true });
    }
  },

  finishOnboarding: async (runtimeId, workspaceName) => {
    await get().createWorkspace(runtimeId, workspaceName);
  },

  switchEnvironment: async (runtimeId) => {
    await prepareForWorkspaceSwitch();

    const current = get().workspace;
    if (current?.runtime_id) {
      await persistCurrentWorkspaceTabs();
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
      if (get().workspace === null) {
        return false;
      }
      await useEnvironmentStore.getState().select(runtimeId as EnvironmentId);
      return true;
    }

    const workspace = await activateRuntime(runtimeId);
    if (!workspace) {
      return false;
    }

    await useEnvironmentStore.getState().select(runtimeId as EnvironmentId);
    await activateWorkspace(workspace, runtimeId);
    await get().loadWorkspaces(runtimeId);
    return true;
  },

  switchWorkspace: async (id) => {
    await prepareForWorkspaceSwitch();

    const current = get().workspace;
    if (current) {
      await persistCurrentWorkspaceTabs();
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
      await persistCurrentWorkspaceTabs();
    }

    const workspace = await runspaceInvoke<WorkspaceInfo>("create_workspace", {
      name: workspaceName,
      runtimeId,
    });
    await runspaceInvoke<WorkspaceInfo>("open_workspace", { id: workspace.id });
    set({
      workspace,
      rootFiles: [],
      expandedDirs: new Set<string>(),
      filesRevision: get().filesRevision + 1,
    });
    await get().loadWorkspaces(runtimeId);
    await get().refreshFiles();

    useEditorTabsStore.getState().clearTabs();
    await useEditorTabsStore.getState().persistForEnvironment(runtimeId, workspace.id);

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
        await persistCurrentWorkspaceTabs();
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
    const workspace = get().workspace;
    if (!workspace) {
      set({ rootFiles: [], filesRevision: get().filesRevision + 1 });
      return;
    }
    await runspaceInvoke<WorkspaceInfo>("open_workspace", { id: workspace.id });
    const files = await runspaceInvoke<FileEntry[]>("list_files", {});
    set({
      rootFiles: files,
      filesRevision: get().filesRevision + 1,
    });
  },

  listDirectory: async (relativePath) => {
    const workspace = get().workspace;
    if (workspace) {
      await runspaceInvoke<WorkspaceInfo>("open_workspace", { id: workspace.id });
    }
    return runspaceInvoke<FileEntry[]>("list_files", relativePath ? { relativePath } : {});
  },

  createFile: async (path, content = "") => {
    const workspace = get().workspace;
    if (!workspace) {
      throw new Error("No active workspace.");
    }
    if (await workspaceEntryExists(workspace.id, path)) {
      throw new Error(`"${path}" already exists.`);
    }
    await runspaceInvoke<WorkspaceInfo>("open_workspace", { id: workspace.id });
    await runspaceInvoke("write_file", { path, content });
    const parent = parentDir(path);
    if (parent) {
      get().expandDir(parent);
    }
    await get().refreshFiles();
  },

  createFolder: async (path) => {
    const workspace = get().workspace;
    if (!workspace) {
      throw new Error("No active workspace.");
    }
    if (await workspaceEntryExists(workspace.id, path)) {
      throw new Error(`"${path}" already exists.`);
    }
    await runspaceInvoke<WorkspaceInfo>("open_workspace", { id: workspace.id });
    await runspaceInvoke("create_directory", { path });
    const parent = parentDir(path);
    if (parent) {
      get().expandDir(parent);
    }
    get().expandDir(path);
    await get().refreshFiles();
  },

  deleteFile: async (path) => {
    const workspace = get().workspace;
    if (workspace) {
      await runspaceInvoke<WorkspaceInfo>("open_workspace", { id: workspace.id });
    }
    await runspaceInvoke("delete_file", { path });
    await get().refreshFiles();
  },

  renameFile: async (oldPath, newPath) => {
    const workspace = get().workspace;
    if (!workspace) {
      throw new Error("No active workspace.");
    }
    if (oldPath !== newPath && (await workspaceEntryExists(workspace.id, newPath))) {
      throw new Error(`"${newPath}" already exists.`);
    }
    await runspaceInvoke<WorkspaceInfo>("open_workspace", { id: workspace.id });
    await runspaceInvoke("rename_file", { oldPath, newPath });
    await get().refreshFiles();
  },

  moveFile: async (sourcePath, targetDir) => {
    const newPath = movedPath(sourcePath, targetDir);
    if (sourcePath === newPath) {
      return false;
    }
    const workspace = get().workspace;
    if (!workspace) {
      return false;
    }
    await runspaceInvoke<WorkspaceInfo>("open_workspace", { id: workspace.id });
    if (!(await replaceEntryIfConfirmed(workspace.id, newPath, get().deleteFile))) {
      return false;
    }
    await get().renameFile(sourcePath, newPath);
    useEditorTabsStore.getState().renameOpenFile(sourcePath, newPath);
    return true;
  },

  copyEntry: async (sourcePath, targetDir) => {
    const newPath = movedPath(sourcePath, targetDir);
    if (sourcePath === newPath) {
      return;
    }
    const workspace = get().workspace;
    if (!workspace) {
      return;
    }
    await runspaceInvoke<WorkspaceInfo>("open_workspace", { id: workspace.id });
    if (!(await replaceEntryIfConfirmed(workspace.id, newPath, get().deleteFile))) {
      return;
    }
    await runspaceInvoke("copy_entry", { sourcePath, targetDir });
    if (targetDir) {
      get().expandDir(targetDir);
    }
    await get().refreshFiles();
  },

  importExternalFiles: async (sources, targetDir = "") => {
    const workspace = get().workspace;
    if (!workspace) {
      return [];
    }
    await runspaceInvoke<WorkspaceInfo>("open_workspace", { id: workspace.id });

    let imported: string[] = [];
    if (typeof sources[0] === "string") {
      const sourcePaths: string[] = [];
      for (const sourcePath of sources as string[]) {
        const relativePath = targetDir
          ? `${targetDir}/${basename(sourcePath)}`
          : basename(sourcePath);
        if (!(await replaceEntryIfConfirmed(workspace.id, relativePath, get().deleteFile))) {
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
        const relative = file.webkitRelativePath || file.name;
        const relativePath = targetDir ? `${targetDir}/${relative}` : relative;
        if (!(await replaceEntryIfConfirmed(workspace.id, relativePath, get().deleteFile))) {
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
