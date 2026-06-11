import { beforeEach, describe, expect, it, vi } from "vitest";
import { runspaceInvoke } from "../../src/core/api/runspaceInvoke";
import { useEditorTabsStore } from "../../src/stores/editorTabsStore";

describe("editorTabsStore", () => {
  beforeEach(() => {
    vi.mocked(runspaceInvoke).mockReset();
    useEditorTabsStore.setState({
      openFiles: [],
      activePath: null,
      loaded: false,
    });
  });

  it("opens a file and marks it active", async () => {
    vi.mocked(runspaceInvoke).mockResolvedValueOnce("console.log(1);");

    await useEditorTabsStore.getState().openFile("main.js");

    const state = useEditorTabsStore.getState();
    expect(state.openFiles).toHaveLength(1);
    expect(state.activePath).toBe("main.js");
    expect(state.openFiles[0].language).toBe("javascript");
    expect(runspaceInvoke).toHaveBeenCalledWith("read_file", { path: "main.js" });
  });

  it("does not duplicate an already open file", async () => {
    useEditorTabsStore.setState({
      openFiles: [
        {
          path: "main.js",
          content: "console.log(1);",
          dirty: false,
          language: "javascript",
        },
      ],
      activePath: "utils.js",
    });

    await useEditorTabsStore.getState().openFile("main.js");

    const state = useEditorTabsStore.getState();
    expect(state.openFiles).toHaveLength(1);
    expect(state.activePath).toBe("main.js");
    expect(runspaceInvoke).not.toHaveBeenCalled();
  });

  it("saves file content to disk", async () => {
    useEditorTabsStore.setState({
      openFiles: [
        {
          path: "main.js",
          content: "console.log(2);",
          dirty: true,
          language: "javascript",
        },
      ],
      activePath: "main.js",
    });
    vi.mocked(runspaceInvoke).mockResolvedValueOnce(undefined);

    await useEditorTabsStore.getState().saveFile("main.js");

    const state = useEditorTabsStore.getState();
    expect(state.openFiles[0].dirty).toBe(false);
    expect(runspaceInvoke).toHaveBeenCalledWith("write_file", {
      path: "main.js",
      content: "console.log(2);",
    });
  });

  it("starts with no tabs when the session has none", async () => {
    await useEditorTabsStore.getState().restoreForWorkspace(
      {
        environments: {
          nodejs: {
            workspace_id: "ws-1",
            workspace_tabs: {
              "ws-1": {
                open_files: [],
                active_file: null,
              },
            },
          },
        },
      },
      "nodejs",
      "ws-1",
    );

    expect(useEditorTabsStore.getState().openFiles).toHaveLength(0);
    expect(useEditorTabsStore.getState().activePath).toBeNull();
    expect(runspaceInvoke).not.toHaveBeenCalled();
  });

  it("restores unique tabs for a workspace", async () => {
    vi.mocked(runspaceInvoke).mockResolvedValueOnce("console.log(1);");

    await useEditorTabsStore.getState().restoreForWorkspace(
      {
        environments: {
          nodejs: {
            workspace_id: "ws-1",
            workspace_tabs: {
              "ws-1": {
                open_files: ["main.js", "main.js"],
                active_file: "main.js",
              },
            },
          },
        },
      },
      "nodejs",
      "ws-1",
    );

    expect(useEditorTabsStore.getState().openFiles).toHaveLength(1);
    expect(useEditorTabsStore.getState().activePath).toBe("main.js");
  });

  it("reorders open tabs", () => {
    useEditorTabsStore.setState({
      openFiles: [
        {
          path: "a.js",
          content: "a",
          dirty: false,
          language: "javascript",
        },
        {
          path: "b.js",
          content: "b",
          dirty: false,
          language: "javascript",
        },
        {
          path: "c.js",
          content: "c",
          dirty: false,
          language: "javascript",
        },
      ],
      activePath: "b.js",
    });

    useEditorTabsStore.getState().reorderTabs(0, 2);

    const state = useEditorTabsStore.getState();
    expect(state.openFiles.map((file) => file.path)).toEqual([
      "b.js",
      "c.js",
      "a.js",
    ]);
    expect(state.activePath).toBe("b.js");
  });
});
