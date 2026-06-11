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
  const didDragRef = useRef(false);
  const suppressNextClickRef = useRef(false);
  const startXRef = useRef(0);
  const pointerIdRef = useRef<number | null>(null);
  const captureTargetRef = useRef<HTMLElement | null>(null);

  const clearDrag = useCallback(() => {
    dragStateRef.current = null;
    layoutSnapshotRef.current = [];
    setDragState(null);
    didDragRef.current = false;
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
      startXRef.current = event.clientX;
      didDragRef.current = false;
      pointerIdRef.current = event.pointerId;
      captureTargetRef.current = target;
      target.setPointerCapture(event.pointerId);

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
        }

        didDragRef.current = true;
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
        if (didDragRef.current) {
          suppressNextClickRef.current = true;
        }

        captureTargetRef.current?.releasePointerCapture(upEvent.pointerId);
        captureTargetRef.current?.removeEventListener("pointermove", onPointerMove);
        captureTargetRef.current?.removeEventListener("pointerup", onPointerUp);
        captureTargetRef.current?.removeEventListener("pointercancel", onPointerUp);
        clearDrag();
      };

      target.addEventListener("pointermove", onPointerMove);
      target.addEventListener("pointerup", onPointerUp);
      target.addEventListener("pointercancel", onPointerUp);
    },
    [captureLayoutSnapshot, clearDrag, onReorder, tabCount],
  );

  const shouldSuppressClick = useCallback(() => {
    if (!suppressNextClickRef.current) {
      return false;
    }
    suppressNextClickRef.current = false;
    return true;
  }, []);

  return {
    dragState,
    onTabPointerDown,
    shouldSuppressClick,
  };
}
