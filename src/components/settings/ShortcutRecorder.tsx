import { useCallback, useEffect, useRef, useState } from "react";
import { Kbd } from "../ui/Kbd";
import {
  bindingFromKeyboardEvent,
  formatShortcutBinding,
} from "../../core/constants/keyboardShortcuts";
import type { ShortcutBinding } from "../../core/types/shortcuts";

interface ShortcutRecorderProps {
  value: ShortcutBinding;
  onChange: (binding: ShortcutBinding) => void;
  testId?: string;
}

export function ShortcutRecorder({ value, onChange, testId }: ShortcutRecorderProps) {
  const [recording, setRecording] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const stopRecording = useCallback(() => {
    setRecording(false);
  }, []);

  useEffect(() => {
    if (!recording) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if (event.key === "Escape") {
        stopRecording();
        return;
      }

      const binding = bindingFromKeyboardEvent(event);
      if (!binding) {
        return;
      }

      onChange(binding);
      stopRecording();
    };

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [onChange, recording, stopRecording]);

  useEffect(() => {
    if (recording) {
      buttonRef.current?.focus();
    }
  }, [recording]);

  const labels = formatShortcutBinding(value);

  return (
    <button
      ref={buttonRef}
      type="button"
      className={`shortcut-recorder${recording ? " shortcut-recorder--recording" : ""}`}
      onClick={() => setRecording(true)}
      aria-pressed={recording}
      aria-label={recording ? "Recording shortcut, press Escape to cancel" : "Change shortcut"}
      data-testid={testId}
    >
      {recording ? (
        <>
          <span className="shortcut-recorder__prompt">Press keys…</span>
          <span className="shortcut-recorder__hint">Esc</span>
        </>
      ) : (
        <span className="shortcut-recorder__keys">
          {labels.map((label, index) => (
            <Kbd key={`${label}-${index}`}>{label}</Kbd>
          ))}
        </span>
      )}
    </button>
  );
}
