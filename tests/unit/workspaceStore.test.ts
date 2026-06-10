import { beforeEach, describe, expect, it, vi } from "vitest";
import { runspaceInvoke } from "../../src/core/api/runspaceInvoke";
import { useEditorTabsStore } from "../../src/stores/editorTabsStore";
import { useWorkspaceStore } from "../../src/stores/workspaceStore";

const mockWorkspace = {
  id: "ws-1",
  name: "Untitled",
  runtime_id: "nodejs",
  entry_file: "main.js",
};

describe("workspaceStore", () => {
  beforeEach(() => {
    vi.mocked(runspaceInvoke).mockReset();
    useWorkspaceStore.setState({
      workspace: null,
      workspaces: [],
      rootFiles: [],
      expandedDirs: new Set(),
      filesRevision: 0,
      loaded: false,
    });
    useEditorTabsStore.setState({
      openFiles: [],
      activePath: null,
      loaded: false,
    });
  });

  it("initializes workspace and loads files", async () => {
    vi.mocked(runspaceInvoke)
      .mockResolvedValueOnce([mockWorkspace])
      .mockResolvedValueOnce(mockWorkspace)
      .mockResolvedValueOnce(mockWorkspace)
      .mockResolvedValueOnce([mockWorkspace])
      .mockResolvedValueOnce(mockWorkspace)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce({ environments: {} });

    await useWorkspaceStore.getState().initialize("nodejs");

    const state = useWorkspaceStore.getState();
    expect(state.workspace).toEqual(mockWorkspace);
    expect(state.loaded).toBe(true);
    expect(state.rootFiles).toHaveLength(0);
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
});
