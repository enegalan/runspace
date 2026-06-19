import { useCallback, useEffect, useRef, useState } from "react";
import { clamp } from "../core/clamp";

interface VerticalDragResizeOptions {
  min: number;
  max: number;
}

export function useVerticalDragResize(
  size: number,
  onCommit: (value: number) => void,
  options: VerticalDragResizeOptions,
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

      const startY = event.clientY;
      const startSize = sizeRef.current;
      const target = event.currentTarget;
      isDraggingRef.current = true;
      target.setPointerCapture(event.pointerId);
      target.classList.add("resize-handle--active");

      const onPointerMove = (moveEvent: PointerEvent) => {
        const delta = startY - moveEvent.clientY;
        const clamped = clamp(startSize + delta, options.min, options.max);
        sizeRef.current = clamped;
        setCurrentSize(clamped);
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
    [onCommit, options.max, options.min],
  );

  return { currentSize, onPointerDown };
}
