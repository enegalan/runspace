import { useCallback, type RefObject } from "react";
import { clamp } from "../core/clamp";

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
