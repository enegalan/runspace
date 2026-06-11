type DividerOrientation = "horizontal" | "vertical";

interface DividerProps {
  orientation?: DividerOrientation;
  className?: string;
}

export function Divider({ orientation = "horizontal", className = "" }: DividerProps) {
  return (
    <hr
      className={`divider divider--${orientation}${className ? ` ${className}` : ""}`}
      aria-hidden="true"
    />
  );
}
