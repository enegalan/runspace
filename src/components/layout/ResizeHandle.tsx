interface ResizeHandleProps {
  side: "left" | "right" | "top";
  orientation?: "vertical" | "horizontal";
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  "data-testid"?: string;
}

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
