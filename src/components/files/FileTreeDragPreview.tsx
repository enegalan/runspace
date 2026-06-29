import { createPortal } from "react-dom";
import { useSyncExternalStore } from "react";
import {
  getFileTreeDragPreview,
  subscribeFileTreeDragPreview,
} from "../../core/workspace/fileTreeDrag";
import { FileIcon } from "./FileIcon";

/**
 * Floating label that follows the pointer during a file-tree move drag.
 * @returns The FileTreeDragPreview component.
 */
export function FileTreeDragPreview() {
  const preview = useSyncExternalStore(
    subscribeFileTreeDragPreview,
    getFileTreeDragPreview,
    getFileTreeDragPreview,
  );

  if (!preview) {
    return null;
  }

  return createPortal(
    <div
      className="file-tree-drag-preview"
      style={{ left: `${preview.x}px`, top: `${preview.y}px` }}
      aria-hidden="true"
    >
      <FileIcon path={preview.path} isDirectory={preview.isDirectory} />
      <span className="file-tree-drag-preview__label">{preview.label}</span>
    </div>,
    document.body,
  );
}
