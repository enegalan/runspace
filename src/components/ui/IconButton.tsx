import type { ButtonHTMLAttributes, ReactNode } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  children: ReactNode;
}

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
