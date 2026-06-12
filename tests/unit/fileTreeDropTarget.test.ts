import { beforeEach, describe, expect, it } from "vitest";
import { DROP_TARGET_ATTR } from "../../src/core/workspace/externalFileDrop";
import {
  FILE_TREE_DRAG_TYPE,
  clearFileDragData,
  setFileDragData,
} from "../../src/core/workspace/fileTreeDrag";
import {
  clearFileTreeDropTarget,
  getFileTreeDropTarget,
  resolveFileTreeDropTargetFromElement,
  setFileTreeDropTarget,
  updateFileTreeDropTargetFromDrag,
} from "../../src/core/workspace/fileTreeDropTarget";

describe("fileTreeDropTarget", () => {
  beforeEach(() => {
    clearFileDragData();
    clearFileTreeDropTarget();
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

  it("resolves the containing folder when hovering a file row", () => {
    const folder = document.createElement("div");
    folder.className = "file-tree__folder";
    folder.setAttribute(DROP_TARGET_ATTR, "lib/utils");
    const folderRow = document.createElement("div");
    folderRow.className = "file-tree__row";
    const children = document.createElement("div");
    children.className = "file-tree__children";
    const branch = document.createElement("div");
    branch.className = "file-tree__branch";
    const fileRow = document.createElement("div");
    fileRow.className = "file-tree__row";
    const fileLabel = document.createElement("span");

    fileRow.appendChild(fileLabel);
    branch.appendChild(fileRow);
    children.appendChild(branch);
    folder.appendChild(folderRow);
    folder.appendChild(children);
    document.body.appendChild(folder);

    expect(resolveFileTreeDropTargetFromElement(fileLabel)).toBe("lib/utils");
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
});
