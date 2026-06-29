import { beforeEach, describe, expect, it, vi } from "vitest";
import { useFileClipboardStore, clipboardMatchesWorkspace } from "../../src/stores/fileClipboardStore";
import { useWorkspaceStore } from "../../src/stores/workspaceStore";

vi.mock("../../src/stores/workspaceStore", () => ({
  useWorkspaceStore: {
    getState: vi.fn(),
  },
}));

describe("fileClipboardStore", () => {
  beforeEach(() => {
    useFileClipboardStore.setState({ entry: null });
    vi.clearAllMocks();
  });

  it("stores workspace id with cut and copy", () => {
    useFileClipboardStore.getState().cut("src/main.js", "ws-1");
    expect(useFileClipboardStore.getState().entry).toEqual({
      path: "src/main.js",
      mode: "cut",
      workspaceId: "ws-1",
    });

    useFileClipboardStore.getState().copy("lib", "ws-2");
    expect(useFileClipboardStore.getState().entry).toEqual({
      path: "lib",
      mode: "copy",
      workspaceId: "ws-2",
    });
  });

  it("matches clipboard to active workspace", () => {
    const entry = { path: "a.js", mode: "cut" as const, workspaceId: "ws-1" };
    expect(clipboardMatchesWorkspace(entry, "ws-1")).toBe(true);
    expect(clipboardMatchesWorkspace(entry, "ws-2")).toBe(false);
    expect(clipboardMatchesWorkspace(null, "ws-1")).toBe(false);
  });

  it("clears cut clipboard only after a successful move", async () => {
    const moveFile = vi.fn().mockResolvedValue(false);
    vi.mocked(useWorkspaceStore.getState).mockReturnValue({
      workspace: { id: "ws-1" },
      moveFile,
      copyEntry: vi.fn(),
    } as never);

    useFileClipboardStore.setState({
      entry: { path: "a.js", mode: "cut", workspaceId: "ws-1" },
    });

    await useFileClipboardStore.getState().pasteInto("lib");

    expect(moveFile).toHaveBeenCalledWith("a.js", "lib");
    expect(useFileClipboardStore.getState().entry).not.toBeNull();
  });

  it("clears stale clipboard when workspace does not match", async () => {
    vi.mocked(useWorkspaceStore.getState).mockReturnValue({
      workspace: { id: "ws-2" },
      moveFile: vi.fn(),
      copyEntry: vi.fn(),
    } as never);

    useFileClipboardStore.setState({
      entry: { path: "a.js", mode: "cut", workspaceId: "ws-1" },
    });

    await useFileClipboardStore.getState().pasteInto("");

    expect(useFileClipboardStore.getState().entry).toBeNull();
  });
});
