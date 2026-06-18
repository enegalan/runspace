import { useCallback, useRef, useState } from "react";
import {
  computeTabDropIndex,
  computeTabVisualOffsets,
  TAB_DRAG_THRESHOLD_PX,
  TAB_LIST_GAP_PX,
} from "../core/editor/tabReorder";

interface TabLayoutSnapshot {
  left: number;
  width: number;
}

export interface TabDragState {
  dragIndex: number;
  dropIndex: number;
  offsets: number[];
}

interface UseTabDragReorderOptions {
  listRef: React.RefObject<HTMLDivElement | null>;
  tabCount: number;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export function useTabDragReorder({
  listRef,
  tabCount,
  onReorder,
}: UseTabDragReorderOptions) {
  const [dragState, setDragState] = useState<TabDragState | null>(null);
  const dragStateRef = useRef<TabDragState | null>(null);
  const layoutSnapshotRef = useRef<TabLayoutSnapshot[]>([]);
  const startXRef = useRef(0);
  const pointerIdRef = useRef<number | null>(null);
  const captureTargetRef = useRef<HTMLElement | null>(null);

  const clearDrag = useCallback(() => {
    dragStateRef.current = null;
    layoutSnapshotRef.current = [];
    setDragState(null);
    pointerIdRef.current = null;
    captureTargetRef.current = null;
  }, []);

  const captureLayoutSnapshot = useCallback(() => {
    const list = listRef.current;
    if (!list) {
      layoutSnapshotRef.current = [];
      return;
    }

    layoutSnapshotRef.current = Array.from(
      list.querySelectorAll<HTMLElement>("[data-tab-index]"),
    ).map((element) => {
      const rect = element.getBoundingClientRect();
      return { left: rect.left, width: rect.width };
    });
  }, [listRef]);

  const onTabPointerDown = useCallback(
    (event: React.PointerEvent<HTMLElement>, index: number) => {
      if (event.button !== 0 || tabCount < 2) {
        return;
      }

      const target = event.currentTarget;
      const ownerDocument = target.ownerDocument;
      startXRef.current = event.clientX;
      pointerIdRef.current = event.pointerId;
      captureTargetRef.current = target;

      const onPointerMove = (moveEvent: PointerEvent) => {
        if (moveEvent.pointerId !== pointerIdRef.current) {
          return;
        }

        const delta = Math.abs(moveEvent.clientX - startXRef.current);
        if (!dragStateRef.current && delta < TAB_DRAG_THRESHOLD_PX) {
          return;
        }

        if (!dragStateRef.current) {
          captureLayoutSnapshot();
          target.setPointerCapture(moveEvent.pointerId);
        }

        const snapshot = layoutSnapshotRef.current;
        const dropIndex = computeTabDropIndex(moveEvent.clientX, snapshot);
        const pointerDeltaX = moveEvent.clientX - startXRef.current;
        const offsets = computeTabVisualOffsets(
          index,
          dropIndex,
          snapshot.map((entry) => entry.width),
          TAB_LIST_GAP_PX,
          pointerDeltaX,
        );
        const nextState = { dragIndex: index, dropIndex, offsets };
        dragStateRef.current = nextState;
        setDragState(nextState);
      };

      const onPointerUp = (upEvent: PointerEvent) => {
        if (upEvent.pointerId !== pointerIdRef.current) {
          return;
        }

        const current = dragStateRef.current;
        if (current && current.dragIndex !== current.dropIndex) {
          onReorder(current.dragIndex, current.dropIndex);
        }

        if (target.hasPointerCapture(upEvent.pointerId)) {
          target.releasePointerCapture(upEvent.pointerId);
        }
        ownerDocument.removeEventListener("pointermove", onPointerMove);
        ownerDocument.removeEventListener("pointerup", onPointerUp);
        ownerDocument.removeEventListener("pointercancel", onPointerUp);
        clearDrag();
      };

      ownerDocument.addEventListener("pointermove", onPointerMove);
      ownerDocument.addEventListener("pointerup", onPointerUp);
      ownerDocument.addEventListener("pointercancel", onPointerUp);
    },
    [captureLayoutSnapshot, clearDrag, onReorder, tabCount],
  );

  return {
    dragState,
    onTabPointerDown,
  };
}
