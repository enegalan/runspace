import { useCallback, useRef } from "react";
import { clampPanelSize } from "../core/layout/panelLayout";

type ResizeSide = "left" | "right";

interface PointerDragResizeOptions {
  min: number;
  max: number;
  side: ResizeSide;
}

export function usePointerDragResize(
  size: number,
  setSize: (value: number) => void,
  options: PointerDragResizeOptions,
) {
  const sizeRef = useRef(size);
  sizeRef.current = size;

  return useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) {
        return;
      }

      event.preventDefault();

      const startX = event.clientX;
      const startSize = sizeRef.current;
      const target = event.currentTarget;
      target.setPointerCapture(event.pointerId);
      target.classList.add("resize-handle--active");

      const onPointerMove = (moveEvent: PointerEvent) => {
        const delta = moveEvent.clientX - startX;
        const next =
          options.side === "right" ? startSize + delta : startSize - delta;
        setSize(clampPanelSize(next, options.min, options.max));
      };

      const onPointerUp = (upEvent: PointerEvent) => {
        target.releasePointerCapture(upEvent.pointerId);
        target.classList.remove("resize-handle--active");
        target.removeEventListener("pointermove", onPointerMove);
        target.removeEventListener("pointerup", onPointerUp);
        target.removeEventListener("pointercancel", onPointerUp);
      };

      target.addEventListener("pointermove", onPointerMove);
      target.addEventListener("pointerup", onPointerUp);
      target.addEventListener("pointercancel", onPointerUp);
    },
    [options.max, options.min, options.side, setSize],
  );
}
