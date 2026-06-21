import type { InputHTMLAttributes } from "react";

interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  description?: string;
}

/**
 * The Toggle component.
 * @param label - The label.
 * @param description - The description.
 * @param className - The class name.
 * @param id - The ID.
 * @param props - The props.
 * @returns The Toggle component.
 */
export function Toggle({ label, description, className = "", id, ...props }: ToggleProps) {
  const inputId = id ?? `toggle-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <label className={`toggle${className ? ` ${className}` : ""}`} htmlFor={inputId}>
      <span className="toggle__content">
        <span className="toggle__label">{label}</span>
        {description && <span className="toggle__description">{description}</span>}
      </span>
      <input type="checkbox" className="toggle__input" id={inputId} {...props} />
      <span className="toggle__track" aria-hidden="true" />
    </label>
  );
}
