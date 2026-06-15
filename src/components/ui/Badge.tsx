import type { ReactNode } from "react";

type BadgeVariant = "default" | "success";

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

export function Badge({ variant = "default", children, className = "" }: BadgeProps) {
  return (
    <span className={`badge badge--${variant}${className ? ` ${className}` : ""}`}>
      {children}
    </span>
  );
}
