import { useCallback, useRef } from "react";
import type { FileEntry } from "../core/types/workspace";
import {
  clearFileDragData,
  getActiveDragPayload,
  setActiveFileTreeMove,
  setFileTreeDragPreview,
  updateFileTreeDragPreviewPosition,
} from "../core/workspace/fileTreeDrag";
import {
  clearFileTreeDropTarget,
  resolvePointerMoveTarget,
  setEditorDropActive,
  setFileTreeDropTarget,
} from "../core/workspace/fileTreeDropTarget";

const DRAG_THRESHOLD_PX = 5;
const AUTO_EXPAND_MS = 400;

interface UseFileTreePointerMoveOptions {
  moveFile: (sourcePath: string, targetDir: string) => Promise<boolean>;
  openFile: (path: string) => Promise<void>;
  expandDir: (path: string) => void;
  expandedDirs: Set<string>;
  onSelect?: (entry: FileEntry) => void;
}

/**
 * This hook is used to handle the pointer move events for the file tree.
 * @param moveFile - The function to move a file.
 * @param openFile - The function to open a file.
 * @param expandDir - The function to expand a directory.
 * @param expandedDirs - The set of expanded directories.
 * @returns The onRowPointerDown function.
 */
export function useFileTreePointerMove({
  moveFile,
  openFile,
  expandDir,
  expandedDirs,
  onSelect,
}: UseFileTreePointerMoveOptions) {
  const sessionRef = useRef<{
    entry: FileEntry;
    startX: number;
    startY: number;
    pointerId: number;
  } | null>(null);
  const autoExpandTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoExpandPathRef = useRef<string | null>(null);

  const clearAutoExpand = useCallback(() => {
    if (autoExpandTimerRef.current !== null) {
      clearTimeout(autoExpandTimerRef.current);
      autoExpandTimerRef.current = null;
    }
    autoExpandPathRef.current = null;
  }, []);

  const updateDropTarget = useCallback(
    (clientX: number, clientY: number) => {
      const payload = getActiveDragPayload();
      if (!payload) {
        return;
      }

      updateFileTreeDragPreviewPosition(clientX, clientY);

      const element =
        typeof document.elementFromPoint === "function"
          ? document.elementFromPoint(clientX, clientY)
          : null;

      if (element?.closest(".editor-area")) {
        clearFileTreeDropTarget();
        clearAutoExpand();
        setEditorDropActive(!payload.isDirectory);
        return;
      }

      setEditorDropActive(false);

      const targetDir = resolvePointerMoveTarget(clientX, clientY);
      if (targetDir === null) {
        clearFileTreeDropTarget();
        clearAutoExpand();
        return;
      }

      setFileTreeDropTarget(targetDir);

      if (targetDir !== "" && !expandedDirs.has(targetDir)) {
        if (autoExpandPathRef.current !== targetDir) {
          clearAutoExpand();
          autoExpandPathRef.current = targetDir;
          autoExpandTimerRef.current = setTimeout(() => {
            autoExpandTimerRef.current = null;
            expandDir(targetDir);
          }, AUTO_EXPAND_MS);
        }
        return;
      }

      clearAutoExpand();
    },
    [clearAutoExpand, expandDir, expandedDirs],
  );

  const onRowPointerDown = useCallback(
    (entry: FileEntry, event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) {
        return;
      }
      if ((event.target as HTMLElement).closest(".file-tree__chevron")) {
        return;
      }
      if (sessionRef.current !== null) {
        return;
      }

      const ownerDocument = event.currentTarget.ownerDocument;
      const startX = event.clientX;
      const startY = event.clientY;
      const pointerId = event.pointerId;
      sessionRef.current = { entry, startX, startY, pointerId };
      onSelect?.(entry);

      const onPointerMove = (moveEvent: PointerEvent) => {
        if (moveEvent.pointerId !== pointerId) {
          return;
        }
        const session = sessionRef.current;
        if (!session) {
          return;
        }

        if (!getActiveDragPayload()) {
          const dx = moveEvent.clientX - session.startX;
          const dy = moveEvent.clientY - session.startY;
          if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) {
            return;
          }
          setActiveFileTreeMove({
            path: session.entry.path,
            isDirectory: session.entry.is_directory,
          });
          setFileTreeDragPreview({
            label: session.entry.name,
            path: session.entry.path,
            isDirectory: session.entry.is_directory,
            x: moveEvent.clientX,
            y: moveEvent.clientY,
          });
        }

        updateDropTarget(moveEvent.clientX, moveEvent.clientY);
      };

      const cleanupSession = () => {
        ownerDocument.removeEventListener("pointermove", onPointerMove);
        ownerDocument.removeEventListener("pointerup", onPointerUp);
        ownerDocument.removeEventListener("pointercancel", onPointerCancel);
        sessionRef.current = null;
        clearAutoExpand();
        clearFileDragData();
        clearFileTreeDropTarget();
        setEditorDropActive(false);
      };

      const onPointerUp = (upEvent: PointerEvent) => {
        if (upEvent.pointerId !== pointerId) {
          return;
        }

        const payload = getActiveDragPayload();
        const releaseElement =
          typeof document.elementFromPoint === "function"
            ? document.elementFromPoint(upEvent.clientX, upEvent.clientY)
            : null;
        const overEditor = Boolean(releaseElement?.closest(".editor-area"));

        if (payload && overEditor && !payload.isDirectory) {
          void openFile(payload.path);
        } else if (payload) {
          const targetDir = resolvePointerMoveTarget(upEvent.clientX, upEvent.clientY);
          if (targetDir !== null) {
            void moveFile(payload.path, targetDir);
          }
        }

        const didMove = payload !== null;
        cleanupSession();

        if (didMove) {
          const blockClick = (clickEvent: MouseEvent) => {
            clickEvent.preventDefault();
            clickEvent.stopImmediatePropagation();
          };
          ownerDocument.addEventListener("click", blockClick, { capture: true, once: true });
        }
      };

      const onPointerCancel = (cancelEvent: PointerEvent) => {
        if (cancelEvent.pointerId !== pointerId) {
          return;
        }
        cleanupSession();
      };

      ownerDocument.addEventListener("pointermove", onPointerMove);
      ownerDocument.addEventListener("pointerup", onPointerUp);
      ownerDocument.addEventListener("pointercancel", onPointerCancel);
    },
    [clearAutoExpand, moveFile, onSelect, openFile, updateDropTarget],
  );

  return { onRowPointerDown };
}
