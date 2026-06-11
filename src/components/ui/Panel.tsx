import type { ReactNode } from "react";

interface PanelProps {
  title?: string;
  bordered?: boolean;
  headerAction?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Panel({
  title,
  bordered = true,
  headerAction,
  children,
  className = "",
}: PanelProps) {
  return (
    <div
      className={`panel${bordered ? " panel--bordered" : ""}${className ? ` ${className}` : ""}`}
    >
      {title && (
        <header className="panel__header">
          <h2 className="panel__title">{title}</h2>
          {headerAction}
        </header>
      )}
      <div className="panel__body">{children}</div>
    </div>
  );
}
