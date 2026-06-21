import { useCallback, type RefObject } from "react";
import { clamp } from "../core/clamp";

/**
 * The useLayoutWidthPreview hook.
 * @param containerRef - The container ref.
 * @param cssVariable - The CSS variable.
 * @param min - The minimum width.
 * @param max - The maximum width.
 * @returns The useLayoutWidthPreview hook.
 */
export function useLayoutWidthPreview(
  containerRef: RefObject<HTMLElement | null>,
  cssVariable: string,
  min: number,
  max: number,
) {
  const preview = useCallback(
    (width: number) => {
      containerRef.current?.style.setProperty(cssVariable, `${clamp(width, min, max)}px`);
    },
    [containerRef, cssVariable, min, max],
  );

  const clearPreview = useCallback(() => {
    containerRef.current?.style.removeProperty(cssVariable);
  }, [containerRef, cssVariable]);

  return { preview, clearPreview };
}
