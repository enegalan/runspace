import { beforeEach, describe, expect, it, vi } from "vitest";
import { DROP_TARGET_ATTR } from "../../src/core/workspace/externalFileDrop";
import {
  FILE_TREE_DRAG_TYPE,
  clearFileDragData,
  isFileTreeDragActive,
  setFileDragData,
} from "../../src/core/workspace/fileTreeDrag";
import {
  clearNativeDropHover,
  getFileTreeDropTarget,
  isEditorDropActive,
  resolveFileTreeDropTargetFromElement,
  setFileTreeDropTarget,
  updateFileTreeDropTargetFromDrag,
  updateNativeDropHover,
} from "../../src/core/workspace/fileTreeDropTarget";

describe("fileTreeDropTarget", () => {
  beforeEach(() => {
    clearFileDragData();
    clearNativeDropHover();
  });

  it("resolves the folder row from the drag event target", () => {
    const parent = document.createElement("div");
    parent.className = "file-tree__folder";
    parent.setAttribute(DROP_TARGET_ATTR, "lib");
    const parentRow = document.createElement("div");
    parentRow.className = "file-tree__row";
    const parentLabel = document.createElement("span");
    const child = document.createElement("div");
    child.className = "file-tree__folder";
    child.setAttribute(DROP_TARGET_ATTR, "lib/utils");
    const childRow = document.createElement("div");
    childRow.className = "file-tree__row";

    parentRow.appendChild(parentLabel);
    parent.appendChild(parentRow);
    child.appendChild(childRow);
    parent.appendChild(child);
    document.body.appendChild(parent);

    expect(resolveFileTreeDropTargetFromElement(parentLabel)).toBe("lib");
    expect(resolveFileTreeDropTargetFromElement(childRow)).toBe("lib/utils");
  });

  it("clears the drop target when the pointer leaves a valid folder", () => {
    setFileTreeDropTarget("lib/utils");
    const dataTransfer = {
      types: [FILE_TREE_DRAG_TYPE],
      files: [],
      effectAllowed: "",
      setData() {},
      getData() {
        return "";
      },
    } as DataTransfer;
    setFileDragData(dataTransfer, { path: "lib/utils/app.js", isDirectory: false });

    updateFileTreeDropTargetFromDrag({
      target: document.createElement("span"),
      dataTransfer,
    });

    expect(getFileTreeDropTarget()).toBeNull();
  });

  it("highlights drop targets during a native OS drag", () => {
    const editor = document.createElement("main");
    editor.className = "editor-area";
    document.body.appendChild(editor);
    document.elementFromPoint = vi.fn(() => editor) as typeof document.elementFromPoint;

    updateNativeDropHover(120, 240);

    expect(isFileTreeDragActive()).toBe(true);
    expect(isEditorDropActive()).toBe(true);
    expect(getFileTreeDropTarget()).toBeNull();
  });
});
