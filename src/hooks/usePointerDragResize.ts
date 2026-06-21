import { useDragResize, type DragResizeOptions } from "./useDragResize";

type ResizeSide = "left" | "right";

interface PointerDragResizeOptions {
  min: number;
  max: number;
  side: ResizeSide;
}

/**
 * The usePointerDragResize hook.
 * @param size - The size.
 * @param options - The options.
 * @param onChange - The function to call when the value changes.
 * @param onCommit - The function to call when the value is committed.
 * @returns The usePointerDragResize hook.
 */
export function usePointerDragResize(
  size: number,
  options: PointerDragResizeOptions,
  onChange: (value: number) => void,
  onCommit: (value: number) => void,
) {
  const dragOptions: DragResizeOptions = {
    axis: "horizontal",
    min: options.min,
    max: options.max,
    side: options.side,
  };
  return useDragResize(size, dragOptions, onCommit, onChange);
}
