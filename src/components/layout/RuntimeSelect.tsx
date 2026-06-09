import { useEffect, useRef, useState } from "react";
import { DEFAULT_RUNTIME_ID, RUNTIMES } from "../../core/runtimes";
import type { RuntimeId } from "../../core/types/runtime";

interface RuntimeSelectProps {
  value?: RuntimeId;
  onChange?: (runtime: RuntimeId) => void;
  disabled?: boolean;
}

export function RuntimeSelect({
  value = DEFAULT_RUNTIME_ID,
  onChange,
  disabled = false,
}: RuntimeSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = RUNTIMES.find((r) => r.id === value) ?? RUNTIMES[0];

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleSelect = (runtimeId: RuntimeId) => {
    onChange?.(runtimeId);
    setOpen(false);
  };

  return (
    <div
      ref={rootRef}
      className={`runtime-select${open ? " runtime-select--open" : ""}${disabled ? " runtime-select--disabled" : ""}`}
      data-testid="runtime-select"
    >
      <button
        type="button"
        className="runtime-select__trigger"
        onClick={() => !disabled && setOpen((prev) => !prev)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Runtime"
      >
        <span className="runtime-select__value">{selected.label}</span>
        <span className="runtime-select__chevron" aria-hidden="true">
          ▾
        </span>
      </button>

      {open && (
        <ul className="runtime-select__menu" role="listbox" aria-label="Runtime">
          {RUNTIMES.map((runtime) => (
            <li key={runtime.id} role="option" aria-selected={runtime.id === value}>
              <button
                type="button"
                className={`runtime-select__option${runtime.id === value ? " runtime-select__option--selected" : ""}`}
                onClick={() => handleSelect(runtime.id)}
              >
                {runtime.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
