import { beforeEach, describe, expect, it, vi } from "vitest";
import { markOnboardingComplete } from "../../src/core/onboarding/onboardingState";
import { runspaceInvoke } from "../../src/core/api/runspaceInvoke";
import { useDialogStore } from "../../src/stores/dialogStore";
import { useEditorTabsStore } from "../../src/stores/editorTabsStore";
import { useExecutionStore } from "../../src/stores/executionStore";
import { useWorkspaceStore } from "../../src/stores/workspaceStore";

const mockWorkspace = {
  id: "ws-1",
  name: "Untitled",
  runtime_id: "nodejs",
};

describe("workspaceStore", () => {
  beforeEach(() => {
    vi.mocked(runspaceInvoke).mockReset();
    useExecutionStore.getState().reset();
    useWorkspaceStore.setState({
      workspace: null,
      workspaces: [],
      rootFiles: [],
      expandedDirs: new Set(),
      filesRevision: 0,
      loaded: false,
      onboardingRequired: false,
      onboardingComplete: false,
    });
    useEditorTabsStore.setState({
      openFiles: [],
      activePath: null,
      focusHistory: [],
      loaded: false,
    });
  });

  it("initializes workspace and loads files", async () => {
    vi.mocked(runspaceInvoke)
      .mockResolvedValueOnce([mockWorkspace])
      .mockResolvedValueOnce({ environments: {}, last_runtime_id: "nodejs" })
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce([mockWorkspace])
      .mockResolvedValueOnce(mockWorkspace)
      .mockResolvedValueOnce(mockWorkspace)
      .mockResolvedValueOnce([mockWorkspace])
      .mockResolvedValueOnce(mockWorkspace)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce({ environments: {}, last_runtime_id: "nodejs" });

    await useWorkspaceStore.getState().initialize("nodejs");

    const state = useWorkspaceStore.getState();
    expect(state.workspace).toEqual(mockWorkspace);
    expect(state.loaded).toBe(true);
    expect(state.rootFiles).toHaveLength(0);
  });

  it("imports external files into the active workspace", async () => {
    useWorkspaceStore.setState({ workspace: mockWorkspace, loaded: true });
    vi.mocked(runspaceInvoke)
      .mockResolvedValueOnce(mockWorkspace)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(["utils.js"])
      .mockResolvedValueOnce(mockWorkspace)
      .mockResolvedValueOnce([{ name: "utils.js", path: "lib/utils.js", is_directory: false }]);

    const imported = await useWorkspaceStore
      .getState()
      .importExternalFiles(["/tmp/utils.js"], "lib");

    expect(runspaceInvoke).toHaveBeenCalledWith("import_external", {
      sourcePaths: ["/tmp/utils.js"],
      targetDir: "lib",
    });
    expect(imported).toEqual(["utils.js"]);
    expect(useWorkspaceStore.getState().rootFiles).toHaveLength(1);
    expect(useWorkspaceStore.getState().expandedDirs.has("lib")).toBe(true);
  });

  it("asks before replacing an existing file when moving", async () => {
    useWorkspaceStore.setState({ workspace: mockWorkspace, loaded: true });
    vi.mocked(useDialogStore.getState().askConfirm).mockResolvedValue(true);
    vi.mocked(runspaceInvoke)
      .mockResolvedValueOnce(mockWorkspace)
      .mockResolvedValueOnce([{ name: "utils.js", path: "lib/utils.js", is_directory: false }])
      .mockResolvedValueOnce(mockWorkspace)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(mockWorkspace)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(mockWorkspace)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(mockWorkspace)
      .mockResolvedValueOnce([]);

    await useWorkspaceStore.getState().moveFile("utils.js", "lib");

    expect(useDialogStore.getState().askConfirm).toHaveBeenCalled();
    expect(runspaceInvoke).toHaveBeenCalledWith("delete_file", { path: "lib/utils.js" });
    expect(runspaceInvoke).toHaveBeenCalledWith("rename_file", {
      oldPath: "utils.js",
      newPath: "lib/utils.js",
    });
  });

  it("skips import when replace is declined", async () => {
    useWorkspaceStore.setState({ workspace: mockWorkspace, loaded: true });
    vi.mocked(useDialogStore.getState().askConfirm).mockResolvedValue(false);
    vi.mocked(runspaceInvoke)
      .mockResolvedValueOnce(mockWorkspace)
      .mockResolvedValueOnce([{ name: "utils.js", path: "lib/utils.js", is_directory: false }]);

    const imported = await useWorkspaceStore
      .getState()
      .importExternalFiles(["/tmp/utils.js"], "lib");

    expect(imported).toEqual([]);
    expect(runspaceInvoke).not.toHaveBeenCalledWith("import_external", expect.anything());
  });

  it("creates a file and refreshes the tree", async () => {
    useWorkspaceStore.setState({ workspace: mockWorkspace, loaded: true });
    vi.mocked(runspaceInvoke)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(mockWorkspace)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(mockWorkspace)
      .mockResolvedValueOnce([
        { name: "main.js", path: "main.js", is_directory: false },
        { name: "utils.js", path: "utils.js", is_directory: false },
      ]);

    await useWorkspaceStore.getState().createFile("utils.js", "module.exports = {};");

    expect(runspaceInvoke).toHaveBeenCalledWith("write_file", {
      path: "utils.js",
      content: "module.exports = {};",
    });
    expect(useWorkspaceStore.getState().rootFiles).toHaveLength(2);
  });

  it("clears tabs before activating another environment", async () => {
    const cWorkspace = { id: "ws-c", name: "C project", runtime_id: "c" };
    const nodeWorkspace = { id: "ws-node", name: "Node project", runtime_id: "nodejs" };
    useWorkspaceStore.setState({
      workspace: cWorkspace,
      workspaces: [cWorkspace],
      loaded: true,
    });
    useEditorTabsStore.setState({
      openFiles: [
        {
          path: "test1.c",
          content: "int main() {}",
          dirty: false,
          language: "c",
        },
      ],
      activePath: "test1.c",
      loaded: true,
    });

    vi.mocked(runspaceInvoke).mockImplementation(async (cmd) => {
      if (cmd === "read_session") {
        return { environments: {}, last_runtime_id: "nodejs" };
      }
      if (cmd === "write_session" || cmd === "set_selected_environment") {
        return undefined;
      }
      if (cmd === "list_workspaces") {
        return [nodeWorkspace];
      }
      if (cmd === "initialize_workspace" || cmd === "open_workspace") {
        return nodeWorkspace;
      }
      if (cmd === "list_files") {
        return [];
      }
      return undefined;
    });

    const switched = await useWorkspaceStore.getState().switchEnvironment("nodejs");

    expect(switched).toBe(true);
    expect(useEditorTabsStore.getState().openFiles).toHaveLength(0);
    expect(useEditorTabsStore.getState().activePath).toBeNull();
    expect(useWorkspaceStore.getState().workspace).toEqual(nodeWorkspace);
    expect(runspaceInvoke).toHaveBeenCalledWith("kill_process");
  });

  it("saves dirty files and clears execution output when switching environments", async () => {
    const phpWorkspace = { id: "ws-php", name: "PHP project", runtime_id: "php" };
    const laravelWorkspace = { id: "ws-laravel", name: "Laravel project", runtime_id: "laravel" };
    useWorkspaceStore.setState({
      workspace: phpWorkspace,
      workspaces: [phpWorkspace],
      loaded: true,
    });
    useEditorTabsStore.setState({
      openFiles: [
        {
          path: "main.php",
          content: "<?php echo 1;",
          dirty: true,
          language: "php",
        },
      ],
      activePath: "main.php",
      loaded: true,
    });
    useExecutionStore.setState({
      status: "error",
      stderr: "",
      stdout: "",
      exitCode: 1,
      timedOut: false,
      compileFailed: false,
      error: "File not found: main.php",
      phase: null,
      startedAt: null,
      lastRunDurationMs: null,
    });

    vi.mocked(runspaceInvoke).mockImplementation(async (cmd) => {
      if (cmd === "write_file") {
        return undefined;
      }
      if (cmd === "kill_process") {
        return undefined;
      }
      if (cmd === "read_session") {
        return { environments: {}, last_runtime_id: "laravel" };
      }
      if (cmd === "write_session" || cmd === "set_selected_environment") {
        return undefined;
      }
      if (cmd === "list_workspaces") {
        return [laravelWorkspace];
      }
      if (cmd === "initialize_workspace" || cmd === "open_workspace") {
        return laravelWorkspace;
      }
      if (cmd === "list_files") {
        return [];
      }
      return undefined;
    });

    await useWorkspaceStore.getState().switchEnvironment("laravel");

    expect(runspaceInvoke).toHaveBeenCalledWith("write_file", {
      path: "main.php",
      content: "<?php echo 1;",
    });
    expect(useExecutionStore.getState().error).toBeNull();
    expect(useExecutionStore.getState().status).toBe("idle");
  });

  it("clears active workspace and keeps onboarding complete after deleting the last workspace", async () => {
    markOnboardingComplete();
    useWorkspaceStore.setState({
      workspace: mockWorkspace,
      workspaces: [mockWorkspace],
      loaded: true,
      onboardingComplete: true,
      onboardingRequired: false,
    });
    useEditorTabsStore.setState({
      openFiles: [
        {
          path: "main.js",
          content: "console.log(1);",
          dirty: false,
          language: "javascript",
        },
      ],
      activePath: "main.js",
      loaded: true,
    });

    vi.mocked(runspaceInvoke)
      .mockResolvedValueOnce({ environments: {}, last_runtime_id: "nodejs" })
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce({
        environments: {},
        last_runtime_id: "nodejs",
        onboarding_complete: true,
      });

    await useWorkspaceStore.getState().deleteWorkspace(mockWorkspace.id);

    const state = useWorkspaceStore.getState();
    expect(state.workspace).toBeNull();
    expect(state.workspaces).toEqual([]);
    expect(state.loaded).toBe(true);
    expect(state.onboardingComplete).toBe(true);
    expect(state.onboardingRequired).toBe(false);
    expect(useEditorTabsStore.getState().openFiles).toEqual([]);
    expect(useEditorTabsStore.getState().activePath).toBeNull();
  });
});
