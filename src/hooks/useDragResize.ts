import { useCallback, useEffect, useRef, useState } from "react";
import { clamp } from "../core/clamp";

type ResizeSide = "left" | "right";

export type DragResizeOptions = {
  axis: "horizontal" | "vertical";
  min: number;
  max: number;
  side?: ResizeSide;
};

/**
 * This hook is used to handle the drag resize.
 * @param size - The size of the drag resize.
 * @param options - The options for the drag resize.
 * @param onCommit - The function to call when the drag resize is committed.
 * @param onChange - The function to call when the drag resize is changed.
 * @returns The drag resize.
 */
export function useDragResize(
  size: number,
  options: DragResizeOptions,
  onCommit: (value: number) => void,
  onChange?: (value: number) => void,
) {
  const [currentSize, setCurrentSize] = useState(size);
  const sizeRef = useRef(size);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    if (!isDraggingRef.current) {
      sizeRef.current = size;
      setCurrentSize(size);
    }
  }, [size]);

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) {
        return;
      }

      event.preventDefault();

      const startX = event.clientX;
      const startY = event.clientY;
      const startSize = sizeRef.current;
      const target = event.currentTarget;
      isDraggingRef.current = true;
      target.setPointerCapture(event.pointerId);
      target.classList.add("resize-handle--active");

      const onPointerMove = (moveEvent: PointerEvent) => {
        let next: number;
        if (options.axis === "horizontal") {
          const delta = moveEvent.clientX - startX;
          next = options.side === "right" ? startSize + delta : startSize - delta;
        } else {
          const delta = startY - moveEvent.clientY;
          next = startSize + delta;
        }
        const clamped = clamp(next, options.min, options.max);
        sizeRef.current = clamped;
        setCurrentSize(clamped);
        onChange?.(clamped);
      };

      const finish = () => {
        isDraggingRef.current = false;
        onCommit(sizeRef.current);
        target.removeEventListener("pointermove", onPointerMove);
        target.removeEventListener("pointerup", onPointerUp);
        target.removeEventListener("pointercancel", onPointerUp);
      };

      const onPointerUp = (upEvent: PointerEvent) => {
        try {
          if (target.hasPointerCapture(upEvent.pointerId)) {
            target.releasePointerCapture(upEvent.pointerId);
          }
        } finally {
          target.classList.remove("resize-handle--active");
          finish();
        }
      };

      target.addEventListener("pointermove", onPointerMove);
      target.addEventListener("pointerup", onPointerUp);
      target.addEventListener("pointercancel", onPointerUp);
    },
    [onChange, onCommit, options.axis, options.max, options.min, options.side],
  );

  return { currentSize, onPointerDown };
}
