import type { ReactNode } from "react";

interface KbdProps {
  children: ReactNode;
  className?: string;
}

/**
 * The Kbd component.
 * @param children - The children.
 * @param className - The class name.
 * @returns The Kbd component.
 */
export function Kbd({ children, className = "" }: KbdProps) {
  return <kbd className={`kbd${className ? ` ${className}` : ""}`}>{children}</kbd>;
}
