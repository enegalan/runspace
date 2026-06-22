import { beforeEach, describe, expect, it, vi } from "vitest";
import { runspaceInvoke } from "../../src/core/api/runspaceInvoke";
import { activateRuntime } from "../../src/stores/workspaceStore";

const mockWorkspace = {
  id: "ws-1",
  name: "Demo",
  runtime_id: "php",
};

describe("activateRuntime", () => {
  beforeEach(() => {
    vi.mocked(runspaceInvoke).mockReset();
  });

  it("opens an existing workspace without creating one", async () => {
    vi.mocked(runspaceInvoke)
      .mockResolvedValueOnce([mockWorkspace])
      .mockResolvedValueOnce(mockWorkspace)
      .mockResolvedValueOnce(undefined);

    const workspace = await activateRuntime("php");

    expect(workspace).toEqual(mockWorkspace);
    expect(runspaceInvoke).toHaveBeenCalledWith("initialize_workspace", {
      runtimeId: "php",
      useSession: true,
    });
  });

  it("returns null when the runtime has no workspaces", async () => {
    vi.mocked(runspaceInvoke).mockResolvedValueOnce([]);

    const workspace = await activateRuntime("php");

    expect(workspace).toBeNull();
    expect(runspaceInvoke).not.toHaveBeenCalledWith("create_workspace", expect.anything());
  });
});
