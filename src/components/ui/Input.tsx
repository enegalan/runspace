import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

/**
 * The Input component.
 * @param label - The label.
 * @param error - The error.
 * @param className - The class name.
 * @param id - The ID.
 * @param props - The props.
 * @returns The Input component.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, className = "", id, ...props },
  ref,
) {
  const inputId = id ?? (label ? `input-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined);

  return (
    <div className="input">
      {label && (
        <label className="input__label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`input__field${error ? " input__field--error" : ""}${className ? ` ${className}` : ""}`}
        {...props}
      />
      {error && <span className="input__error">{error}</span>}
    </div>
  );
});
