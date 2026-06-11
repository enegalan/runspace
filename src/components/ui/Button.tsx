import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Kbd } from "./Kbd";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shortcut?: string;
  running?: boolean;
  dangerActive?: boolean;
  children: ReactNode;
}

const variantClass: Record<ButtonVariant, string> = {
  primary: "btn--primary",
  secondary: "",
  ghost: "btn--ghost",
  danger: "btn--danger",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "btn--sm",
  md: "btn--md",
};

export function Button({
  variant = "secondary",
  size = "md",
  shortcut,
  running = false,
  dangerActive = false,
  className = "",
  type = "button",
  children,
  ...props
}: ButtonProps) {
  const classes = [
    "btn",
    variantClass[variant],
    sizeClass[size],
    running ? "btn--running" : "",
    variant === "danger" && dangerActive ? "btn--danger--active" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={classes} {...props}>
      {children}
      {shortcut && <Kbd className="btn__shortcut">{shortcut}</Kbd>}
    </button>
  );
}
