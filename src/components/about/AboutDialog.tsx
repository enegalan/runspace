import { openUrl } from "@tauri-apps/plugin-opener";
import { createPortal } from "react-dom";
import { isTauri } from "../../core/platform/isTauri";
import { Button } from "../ui/Button";

interface AboutDialogProps {
  open: boolean;
  onClose: () => void;
}

const GITHUB_URL = "https://github.com/enegalan/runspace";
const ISSUES_URL = "https://github.com/enegalan/runspace/issues";

async function openExternal(url: string) {
  if (isTauri()) {
    await openUrl(url);
    return;
  }
  window.open(url, "_blank");
}

export function AboutDialog({ open, onClose }: AboutDialogProps) {
  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="app-dialog" data-testid="about-dialog" role="dialog" aria-label="About Runspace">
      <div className="app-dialog__backdrop" onClick={onClose} />
      <div className="app-dialog__panel">
        <h2 className="about-dialog__version">Runspace v0.1.0</h2>
        <p className="about-dialog__tagline">Desktop sandbox for multiple runtimes.</p>
        <p className="about-dialog__runtimes">
          Runtimes: Node.js, PHP, Python, Ruby, C, C++
        </p>
        <p className="about-dialog__meta">
          © 2026 Eneko Galan
          <br />
          MIT License
        </p>
        <div className="about-dialog__links">
          <Button variant="ghost" onClick={() => void openExternal(GITHUB_URL)}>
            GitHub
          </Button>
          <Button variant="ghost" onClick={() => void openExternal(ISSUES_URL)}>
            Report issue
          </Button>
        </div>
        <div className="app-dialog__actions" style={{ marginTop: 16 }}>
          <Button variant="primary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
