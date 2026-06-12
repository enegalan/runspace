import { describe, expect, it } from "vitest";
import { hasExternalFileDrag } from "../../src/core/workspace/externalFileDrop";
import { FILE_TREE_DRAG_TYPE } from "../../src/core/workspace/fileTreeDrag";

describe("externalFileDrop", () => {
  it("detects external file drags but not internal tree drags", () => {
    const external = {
      types: ["Files"],
      files: [],
    } as DataTransfer;
    const internal = {
      types: [FILE_TREE_DRAG_TYPE],
      files: [],
    } as DataTransfer;

    expect(hasExternalFileDrag(external)).toBe(true);
    expect(hasExternalFileDrag(internal)).toBe(false);
  });
});
