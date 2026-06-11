import { createPortal } from "react-dom";
import { Kbd } from "../ui/Kbd";
import { Button } from "../ui/Button";

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onClose: () => void;
}

const isMac =
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
const mod = isMac ? "⌘" : "Ctrl";

const SHORTCUTS = [
  { action: "Run", keys: [mod, "↵"] },
  { action: "Stop", keys: [mod, "."] },
  { action: "Save file", keys: [mod, "S"] },
  { action: "New workspace", keys: [mod, "N"] },
  { action: "Close tab", keys: [mod, "W"] },
  { action: "Settings", keys: [mod, ","] },
];

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
        <ul className="shortcuts-dialog__list">
          {SHORTCUTS.map((shortcut) => (
            <li key={shortcut.action} className="shortcuts-dialog__item">
              <span>{shortcut.action}</span>
              <span className="shortcuts-dialog__keys">
                {shortcut.keys.map((key, index) => (
                  <Kbd key={`${shortcut.action}-${index}`}>{key}</Kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
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
