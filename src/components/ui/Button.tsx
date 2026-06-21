import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Kbd } from "./Kbd";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shortcut?: string;
  dangerActive?: boolean;
  children: ReactNode;
}

/**
 * The variant class.
 * @returns The variant class.
 */
const variantClass: Record<ButtonVariant, string> = {
  primary: "btn--primary",
  secondary: "",
  ghost: "btn--ghost",
  danger: "btn--danger",
};

/**
 * The size class.
 * @returns The size class.
 */
const sizeClass: Record<ButtonSize, string> = {
  sm: "btn--sm",
  md: "btn--md",
};

/**
 * The Button component.
 * @param variant - The variant.
 * @param size - The size.
 * @param shortcut - The shortcut.
 * @param dangerActive - The danger active.
 * @param className - The class name.
 * @param type - The type.
 * @param children - The children.
 * @param props - The props.
 * @returns The Button component.
 */
export function Button({
  variant = "secondary",
  size = "md",
  shortcut,
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
