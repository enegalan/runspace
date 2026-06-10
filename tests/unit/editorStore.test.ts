import { beforeEach, describe, expect, it, vi } from "vitest";
import { runspaceInvoke } from "../../src/core/api/runspaceInvoke";
import { useEditorStore } from "../../src/stores/editorStore";

describe("editorStore", () => {
  beforeEach(() => {
    vi.mocked(runspaceInvoke).mockReset();
    useEditorStore.setState({
      code: 'console.log("Hello, Runspace!");',
      language: "javascript",
      loaded: false,
    });
  });

  it("loads snippet from disk", async () => {
    vi.mocked(runspaceInvoke).mockResolvedValueOnce({
      code: 'console.log("saved");',
      language: "javascript",
      updated_at: "2026-06-09T00:00:00.000Z",
    });

    await useEditorStore.getState().loadFromDisk();

    const state = useEditorStore.getState();
    expect(state.code).toBe('console.log("saved");');
    expect(state.loaded).toBe(true);
    expect(runspaceInvoke).toHaveBeenCalledWith("read_snippet");
  });

  it("saves snippet to disk", async () => {
    useEditorStore.setState({ code: "console.log(1);", language: "javascript" });
    vi.mocked(runspaceInvoke).mockResolvedValueOnce(undefined);

    await useEditorStore.getState().saveToDisk();

    expect(runspaceInvoke).toHaveBeenCalledWith(
      "write_snippet",
      expect.objectContaining({
        data: expect.objectContaining({
          code: "console.log(1);",
          language: "javascript",
        }),
      }),
    );
  });
});
