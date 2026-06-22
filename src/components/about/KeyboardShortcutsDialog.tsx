import { createPortal } from "react-dom";
import { ShortcutList } from "./ShortcutList";
import { Button } from "../ui/Button";

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * The KeyboardShortcutsDialog component.
 * @param open - Whether the keyboard shortcuts dialog is open.
 * @param onClose - The function to call when the keyboard shortcuts dialog is closed.
 * @returns The KeyboardShortcutsDialog component.
 */
export function KeyboardShortcutsDialog({ open, onClose }: KeyboardShortcutsDialogProps) {
  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="app-dialog"
      data-testid="shortcuts-dialog"
      role="dialog"
      aria-label="Keyboard shortcuts"
    >
      <div className="app-dialog__backdrop" onClick={onClose} />
      <div className="app-dialog__panel app-dialog__panel--wide">
        <h2 className="app-dialog__title">Keyboard shortcuts</h2>
        <ShortcutList />
        <div className="app-dialog__actions">
          <Button variant="primary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
