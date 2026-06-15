import { beforeEach, describe, expect, it, vi } from "vitest";
import { confirmEntryReplace } from "../../src/core/workspace/confirmEntryReplace";
import { useDialogStore } from "../../src/stores/dialogStore";

describe("confirmEntryReplace", () => {
  beforeEach(() => {
    vi.mocked(useDialogStore.getState().askConfirm).mockReset();
  });

  it("asks to replace an existing destination entry", async () => {
    vi.mocked(useDialogStore.getState().askConfirm).mockResolvedValue(true);

    const confirmed = await confirmEntryReplace("notes.txt");

    expect(confirmed).toBe(true);
    expect(useDialogStore.getState().askConfirm).toHaveBeenCalledWith(
      'A file or folder named "notes.txt" already exists in the destination folder. Do you want to replace it?',
      { confirmLabel: "Replace", danger: true },
    );
  });
});
