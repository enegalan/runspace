import { beforeEach, describe, expect, it, vi } from "vitest";
import { DROP_TARGET_ATTR } from "../../src/core/workspace/externalFileDrop";
import {
  clearFileDragData,
  isFileTreeDragActive,
  setActiveFileTreeMove,
} from "../../src/core/workspace/fileTreeDrag";
import {
  clearNativeDropHover,
  getFileTreeDropTarget,
  isEditorDropActive,
  resolveDropTargetFromPoint,
  resolveFileTreeDropTargetFromElement,
  resolvePointerMoveTarget,
  updateNativeDropHover,
} from "../../src/core/workspace/fileTreeDropTarget";

describe("fileTreeDropTarget", () => {
  beforeEach(() => {
    clearFileDragData();
    clearNativeDropHover();
  });

  it("resolves the folder row from the element", () => {
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

  it("returns null for pointer move targets without an active drag", () => {
    const folder = document.createElement("div");
    folder.className = "file-tree__folder";
    folder.setAttribute(DROP_TARGET_ATTR, "lib");
    document.body.appendChild(folder);
    document.elementFromPoint = vi.fn(() => folder) as typeof document.elementFromPoint;

    expect(resolvePointerMoveTarget(40, 80)).toBeNull();

    setActiveFileTreeMove({ path: "app.js", isDirectory: false });
    clearFileDragData();
    expect(resolvePointerMoveTarget(40, 80)).toBeNull();
  });

  it("resolves pointer move targets for active drags", () => {
    const folder = document.createElement("div");
    folder.className = "file-tree__folder";
    folder.setAttribute(DROP_TARGET_ATTR, "lib");
    document.body.appendChild(folder);
    document.elementFromPoint = vi.fn(() => folder) as typeof document.elementFromPoint;
    setActiveFileTreeMove({ path: "app.js", isDirectory: false });

    expect(resolveDropTargetFromPoint(40, 80)).toBe("lib");
    expect(resolvePointerMoveTarget(40, 80)).toBe("lib");
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
