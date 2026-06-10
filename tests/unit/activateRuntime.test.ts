import { beforeEach, describe, expect, it, vi } from "vitest";
import { runspaceInvoke } from "../../src/core/api/runspaceInvoke";
import { activateRuntime } from "../../src/core/workspace/activateRuntime";

vi.mock("../../src/core/workspace/promptProjectName", () => ({
  requireProjectName: vi.fn(),
}));

import { requireProjectName } from "../../src/core/workspace/promptProjectName";

const mockWorkspace = {
  id: "ws-1",
  name: "Demo",
  runtime_id: "php",
  entry_file: "main.php",
};

describe("activateRuntime", () => {
  beforeEach(() => {
    vi.mocked(runspaceInvoke).mockReset();
    vi.mocked(requireProjectName).mockReset();
  });

  it("opens an existing workspace without prompting", async () => {
    vi.mocked(runspaceInvoke)
      .mockResolvedValueOnce([mockWorkspace])
      .mockResolvedValueOnce(mockWorkspace);

    const workspace = await activateRuntime("php");

    expect(workspace).toEqual(mockWorkspace);
    expect(requireProjectName).not.toHaveBeenCalled();
  });

  it("prompts for a project when the runtime has no workspaces", async () => {
    vi.mocked(runspaceInvoke)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(mockWorkspace);
    vi.mocked(requireProjectName).mockResolvedValueOnce("Demo");

    const workspace = await activateRuntime("php");

    expect(workspace).toEqual(mockWorkspace);
    expect(requireProjectName).toHaveBeenCalledWith(
      "Create your first project for PHP",
    );
  });

  it("returns null when the user cancels project creation", async () => {
    vi.mocked(runspaceInvoke).mockResolvedValueOnce([]);
    vi.mocked(requireProjectName).mockResolvedValueOnce(null);

    const workspace = await activateRuntime("php");

    expect(workspace).toBeNull();
  });
});
