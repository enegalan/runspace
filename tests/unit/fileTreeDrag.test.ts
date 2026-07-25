import { beforeEach, describe, expect, it } from "vitest";
import {
  canMoveToRoot,
  clearFileDragData,
  getActiveDragPayload,
  getFileTreeDragPreview,
  isFileTreeDragActive,
  isInvalidMove,
  movedPath,
  resolvePasteTarget,
  setActiveFileTreeMove,
  setFileTreeDragPreview,
  updateFileTreeDragPreviewPosition,
} from "../../src/core/workspace/fileTreeDrag";

describe("fileTreeDrag", () => {
  beforeEach(() => {
    clearFileDragData();
  });

  it("tracks pointer move payload", () => {
    setActiveFileTreeMove({ path: "src/app.js", isDirectory: false });
    expect(isFileTreeDragActive()).toBe(true);
    expect(getActiveDragPayload()).toEqual({
      path: "src/app.js",
      isDirectory: false,
    });
    clearFileDragData();
    expect(isFileTreeDragActive()).toBe(false);
    expect(getActiveDragPayload()).toBeNull();
  });

  it("tracks drag preview position", () => {
    setFileTreeDragPreview({
      label: "app.js",
      path: "src/app.js",
      isDirectory: false,
      x: 10,
      y: 20,
    });
    updateFileTreeDragPreviewPosition(40, 50);
    expect(getFileTreeDragPreview()).toEqual({
      label: "app.js",
      path: "src/app.js",
      isDirectory: false,
      x: 40,
      y: 50,
    });
    clearFileDragData();
    expect(getFileTreeDragPreview()).toBeNull();
  });

  it("detects invalid moves", () => {
    expect(isInvalidMove("lib", "lib")).toBe(true);
    expect(isInvalidMove("lib/utils", "lib")).toBe(true);
    expect(isInvalidMove("lib", "lib/utils")).toBe(true);
    expect(isInvalidMove("src/app.js", "src")).toBe(true);
    expect(isInvalidMove("lib/utils/file.js", "lib")).toBe(false);
    expect(isInvalidMove("app.js", "src")).toBe(false);
  });

  it("builds moved path", () => {
    expect(movedPath("app.js", "src")).toBe("src/app.js");
    expect(movedPath("src/app.js", "")).toBe("app.js");
  });

  it("allows moving nested items to root", () => {
    expect(canMoveToRoot("src/app.js")).toBe(true);
    expect(canMoveToRoot("app.js")).toBe(false);
    expect(isInvalidMove("src/app.js", "src")).toBe(true);
  });

  it("resolves paste target from selection", () => {
    expect(resolvePasteTarget(null, false)).toBe("");
    expect(resolvePasteTarget("src/components", true)).toBe("src/components");
    expect(resolvePasteTarget("src/app.js", false)).toBe("src");
    expect(resolvePasteTarget("README.md", false)).toBe("");
  });
});
