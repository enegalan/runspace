import { useDragResize, type DragResizeOptions } from "./useDragResize";

interface VerticalDragResizeOptions {
  min: number;
  max: number;
}

/**
 * The useVerticalDragResize hook.
 * @param size - The size.
 * @param options - The options.
 * @param onCommit - The function to call when the value is committed.
 * @returns The useVerticalDragResize hook.
 */
export function useVerticalDragResize(
  size: number,
  options: VerticalDragResizeOptions,
  onCommit: (value: number) => void,
) {
  const dragOptions: DragResizeOptions = {
    axis: "vertical",
    min: options.min,
    max: options.max,
  };
  return useDragResize(size, dragOptions, onCommit);
}
