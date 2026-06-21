import type { ButtonHTMLAttributes, ReactNode } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  children: ReactNode;
}

/**
 * The IconButton component.
 * @param label - The label.
 * @param children - The children.
 * @param className - The class name.
 * @param title - The title.
 * @param props - The props.
 * @returns The IconButton component.
 */
export function IconButton({ label, children, className = "", title, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      className={`icon-btn${className ? ` ${className}` : ""}`}
      aria-label={label}
      title={title ?? label}
      {...props}
    >
      {children}
    </button>
  );
}
