import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  DROP_TARGET_ATTR,
  hasExternalFileDrag,
  resolveDropTargetFromPoint,
  setExternalDropHighlight,
} from "../../src/core/workspace/externalFileDrop";
import { FILE_TREE_DRAG_TYPE } from "../../src/core/workspace/fileTreeDrag";

describe("externalFileDrop", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

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

  it("resolves the nearest drop target from pointer coordinates", () => {
    const root = document.createElement("div");
    root.setAttribute(DROP_TARGET_ATTR, "");
    const folder = document.createElement("div");
    folder.setAttribute(DROP_TARGET_ATTR, "lib");
    root.appendChild(folder);
    document.body.appendChild(root);

    document.elementFromPoint = vi.fn().mockReturnValue(folder);

    expect(resolveDropTargetFromPoint(50, 30)).toBe("lib");
  });

  it("highlights and clears external drop targets", () => {
    const root = document.createElement("div");
    root.setAttribute(DROP_TARGET_ATTR, "");
    document.body.appendChild(root);

    setExternalDropHighlight("");
    expect(root.classList.contains("external-drop-target")).toBe(true);

    setExternalDropHighlight(null);
    expect(root.classList.contains("external-drop-target")).toBe(false);
  });
});
