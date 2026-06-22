interface ResizeHandleProps {
  side: "left" | "right" | "top";
  orientation?: "vertical" | "horizontal";
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  "data-testid"?: string;
}

/**
 * The ResizeHandle component.
 * @param side - The side of the resize handle.
 * @param orientation - The orientation of the resize handle.
 * @param onPointerDown - The function to call when the pointer is down.
 * @param testId - The test ID.
 * @returns The ResizeHandle component.
 */
export function ResizeHandle({
  side,
  orientation = "vertical",
  onPointerDown,
  "data-testid": testId,
}: ResizeHandleProps) {
  return (
    <div
      className={`resize-handle resize-handle--${side} resize-handle--${orientation}`}
      onPointerDown={onPointerDown}
      role="separator"
      aria-orientation={orientation}
      aria-label="Resize panel"
      data-testid={testId}
    />
  );
}
