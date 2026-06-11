interface ResizeHandleProps {
  side: "left" | "right";
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  "data-testid"?: string;
}

export function ResizeHandle({
  side,
  onPointerDown,
  "data-testid": testId,
}: ResizeHandleProps) {
  return (
    <div
      className={`resize-handle resize-handle--${side}`}
      onPointerDown={onPointerDown}
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize panel"
      data-testid={testId}
    />
  );
}
