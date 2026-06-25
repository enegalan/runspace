import { beforeEach, describe, expect, it, vi } from "vitest";
import { runspaceInvoke } from "../../src/core/api/runspaceInvoke";
import { DEFAULT_APP_SETTINGS } from "../../src/core/constants/settingsDefaults";
import { useEditorTabsStore } from "../../src/stores/editorTabsStore";
import { useEnvironmentStore } from "../../src/stores/environmentStore";
import { useSettingsStore } from "../../src/stores/settingsStore";
import { useDialogStore } from "../../src/stores/dialogStore";
import { TEST_ENVIRONMENT_CATALOG } from "../fixtures/environmentCatalog";

describe("editorTabsStore", () => {
  beforeEach(() => {
    vi.mocked(runspaceInvoke).mockReset();
    useEnvironmentStore.setState({
      environments: [],
      available: TEST_ENVIRONMENT_CATALOG,
      selectedId: null,
      defaultEnvironmentId: "nodejs",
      loaded: true,
    });
    useSettingsStore.setState({
      settings: DEFAULT_APP_SETTINGS,
      loaded: true,
    });
    useEditorTabsStore.setState({
      openFiles: [],
      activePath: null,
      focusHistory: [],
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

  it("skips save when the file is not dirty", async () => {
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
    });

    await useEditorTabsStore.getState().saveFile("main.js");

    expect(runspaceInvoke).not.toHaveBeenCalled();
  });

  it("saves every dirty open file", async () => {
    useEditorTabsStore.setState({
      openFiles: [
        {
          path: "main.js",
          content: "console.log(1);",
          dirty: true,
          language: "javascript",
        },
        {
          path: "utils.js",
          content: "export {};",
          dirty: false,
          language: "javascript",
        },
        {
          path: "index.js",
          content: "import './main.js';",
          dirty: true,
          language: "javascript",
        },
      ],
      activePath: "main.js",
    });
    vi.mocked(runspaceInvoke).mockResolvedValue(undefined);

    await useEditorTabsStore.getState().saveDirtyFiles();

    expect(runspaceInvoke).toHaveBeenCalledTimes(2);
    expect(runspaceInvoke).toHaveBeenCalledWith("write_file", {
      path: "main.js",
      content: "console.log(1);",
    });
    expect(runspaceInvoke).toHaveBeenCalledWith("write_file", {
      path: "index.js",
      content: "import './main.js';",
    });
    expect(useEditorTabsStore.getState().openFiles.every((file) => !file.dirty)).toBe(true);
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

  it("persists a provided tab snapshot instead of the current store state", async () => {
    useEditorTabsStore.setState({
      openFiles: [
        {
          path: "stale.js",
          content: "stale",
          dirty: false,
          language: "javascript",
        },
      ],
      activePath: "stale.js",
    });
    vi.mocked(runspaceInvoke).mockResolvedValue({ environments: {} });

    await useEditorTabsStore.getState().persistForEnvironment("nodejs", "ws-1", {
      openFiles: [
        {
          path: "saved.js",
          content: "saved",
          dirty: false,
          language: "javascript",
        },
      ],
      activePath: "saved.js",
    });

    expect(runspaceInvoke).toHaveBeenCalledWith("write_session", {
      session: expect.objectContaining({
        environments: expect.objectContaining({
          nodejs: expect.objectContaining({
            workspace_tabs: expect.objectContaining({
              "ws-1": {
                open_files: ["saved.js"],
                active_file: "saved.js",
              },
            }),
          }),
        }),
      }),
    });
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
    expect(state.openFiles.map((file) => file.path)).toEqual(["b.js", "c.js", "a.js"]);
    expect(state.activePath).toBe("b.js");
  });

  it("activates the previously focused tab when closing the active tab", async () => {
    useEditorTabsStore.setState({
      openFiles: [
        { path: "a.js", content: "a", dirty: false, language: "javascript" },
        { path: "b.js", content: "b", dirty: false, language: "javascript" },
        { path: "c.js", content: "c", dirty: false, language: "javascript" },
      ],
      activePath: "c.js",
      focusHistory: [],
    });

    useEditorTabsStore.getState().setActive("a.js");
    const closed = await useEditorTabsStore.getState().closeFile("a.js");

    expect(closed).toBe(true);
    expect(useEditorTabsStore.getState().activePath).toBe("c.js");
    expect(useEditorTabsStore.getState().openFiles.map((file) => file.path)).toEqual([
      "b.js",
      "c.js",
    ]);
  });

  it("closes open files under a deleted folder", () => {
    useEditorTabsStore.setState({
      openFiles: [
        { path: "lib/utils.js", content: "utils", dirty: false, language: "javascript" },
        { path: "lib/nested/app.js", content: "app", dirty: false, language: "javascript" },
        { path: "library.js", content: "lib", dirty: false, language: "javascript" },
        { path: "main.js", content: "main", dirty: false, language: "javascript" },
      ],
      activePath: "lib/utils.js",
      focusHistory: [],
    });

    useEditorTabsStore.getState().removeOpenFile("lib");

    const state = useEditorTabsStore.getState();
    expect(state.openFiles.map((file) => file.path)).toEqual(["library.js", "main.js"]);
    expect(state.activePath).toBe("library.js");
  });

  it("closes dirty file without confirm when setting disabled", async () => {
    useSettingsStore.setState({
      settings: {
        ...DEFAULT_APP_SETTINGS,
        layout: { ...DEFAULT_APP_SETTINGS.layout, confirmCloseUnsavedTab: false },
      },
      loaded: true,
    });
    useEditorTabsStore.setState({
      openFiles: [
        {
          path: "main.js",
          content: "dirty",
          dirty: true,
          language: "javascript",
        },
      ],
      activePath: "main.js",
    });

    const askConfirm = vi.spyOn(useDialogStore.getState(), "askConfirm");
    const closed = await useEditorTabsStore.getState().closeFile("main.js");

    expect(closed).toBe(true);
    expect(askConfirm).not.toHaveBeenCalled();
    expect(useEditorTabsStore.getState().openFiles).toHaveLength(0);
  });

  it("closes other tabs", async () => {
    useEditorTabsStore.setState({
      openFiles: [
        { path: "a.js", content: "a", dirty: false, language: "javascript" },
        { path: "b.js", content: "b", dirty: false, language: "javascript" },
        { path: "c.js", content: "c", dirty: false, language: "javascript" },
      ],
      activePath: "b.js",
    });

    const closed = await useEditorTabsStore.getState().closeOthers("b.js");

    expect(closed).toBe(true);
    expect(useEditorTabsStore.getState().openFiles.map((file) => file.path)).toEqual(["b.js"]);
    expect(useEditorTabsStore.getState().activePath).toBe("b.js");
  });

  it("closes tabs to the right", async () => {
    useEditorTabsStore.setState({
      openFiles: [
        { path: "a.js", content: "a", dirty: false, language: "javascript" },
        { path: "b.js", content: "b", dirty: false, language: "javascript" },
        { path: "c.js", content: "c", dirty: false, language: "javascript" },
      ],
      activePath: "a.js",
    });

    const closed = await useEditorTabsStore.getState().closeRight("a.js");

    expect(closed).toBe(true);
    expect(useEditorTabsStore.getState().openFiles.map((file) => file.path)).toEqual(["a.js"]);
  });

  it("closes all tabs", async () => {
    useEditorTabsStore.setState({
      openFiles: [
        { path: "a.js", content: "a", dirty: false, language: "javascript" },
        { path: "b.js", content: "b", dirty: false, language: "javascript" },
      ],
      activePath: "a.js",
    });

    const closed = await useEditorTabsStore.getState().closeAll();

    expect(closed).toBe(true);
    expect(useEditorTabsStore.getState().openFiles).toHaveLength(0);
    expect(useEditorTabsStore.getState().activePath).toBeNull();
  });
});
