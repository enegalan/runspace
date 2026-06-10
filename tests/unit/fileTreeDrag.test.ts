import { beforeEach, describe, expect, it } from "vitest";
import {
  FILE_TREE_DRAG_TYPE,
  canMoveToRoot,
  clearFileDragData,
  getActiveDragPayload,
  hasFileDrag,
  isInvalidMove,
  movedPath,
  readFileDragData,
  setFileDragData,
} from "../../src/core/workspace/fileTreeDrag";

describe("fileTreeDrag", () => {
  beforeEach(() => {
    clearFileDragData();
  });

  it("round-trips drag payload", () => {
    const dataTransfer = {
      _data: {} as Record<string, string>,
      effectAllowed: "",
      setData(type: string, value: string) {
        this._data[type] = value;
      },
      getData(type: string) {
        return this._data[type] ?? "";
      },
    } as DataTransfer;

    setFileDragData(dataTransfer, { path: "src/app.js", isDirectory: false });
    expect(readFileDragData(dataTransfer)).toEqual({
      path: "src/app.js",
      isDirectory: false,
    });
    expect(dataTransfer._data[FILE_TREE_DRAG_TYPE]).toBeTruthy();
  });

  it("tracks active payload for dragover", () => {
    const dataTransfer = {
      _data: {} as Record<string, string>,
      types: [] as string[],
      effectAllowed: "",
      setData(type: string, value: string) {
        this._data[type] = value;
        if (!this.types.includes(type)) {
          this.types.push(type);
        }
      },
      getData(type: string) {
        return this._data[type] ?? "";
      },
    } as DataTransfer;

    setFileDragData(dataTransfer, { path: "lib/utils.js", isDirectory: false });
    expect(hasFileDrag(dataTransfer.types)).toBe(true);
    expect(getActiveDragPayload()).toEqual({
      path: "lib/utils.js",
      isDirectory: false,
    });
    expect(readFileDragData(dataTransfer)).toEqual({
      path: "lib/utils.js",
      isDirectory: false,
    });
    clearFileDragData();
    expect(getActiveDragPayload()).toBeNull();
  });

  it("detects invalid moves", () => {
    expect(isInvalidMove("lib", "lib")).toBe(true);
    expect(isInvalidMove("lib/utils", "lib")).toBe(true);
    expect(isInvalidMove("src/app.js", "src")).toBe(true);
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
});
