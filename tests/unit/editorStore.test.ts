import { invoke } from "@tauri-apps/api/core";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useEditorStore } from "../../src/stores/editorStore";

describe("editorStore", () => {
  beforeEach(() => {
    vi.mocked(invoke).mockReset();
    useEditorStore.setState({
      code: 'console.log("Hello, Runspace!");',
      language: "javascript",
      loaded: false,
    });
  });

  it("loads snippet from disk", async () => {
    vi.mocked(invoke).mockResolvedValueOnce({
      code: 'console.log("saved");',
      language: "javascript",
      updated_at: "2026-06-09T00:00:00.000Z",
    });

    await useEditorStore.getState().loadFromDisk();

    const state = useEditorStore.getState();
    expect(state.code).toBe('console.log("saved");');
    expect(state.loaded).toBe(true);
    expect(invoke).toHaveBeenCalledWith("read_snippet");
  });

  it("saves snippet to disk", async () => {
    useEditorStore.setState({ code: "console.log(1);", language: "javascript" });
    vi.mocked(invoke).mockResolvedValueOnce(undefined);

    await useEditorStore.getState().saveToDisk();

    expect(invoke).toHaveBeenCalledWith(
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
