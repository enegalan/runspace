import { useEffect } from "react";
import { openUrl } from "@tauri-apps/plugin-opener";
import { createPortal } from "react-dom";
import {
  APP_GITHUB_URL,
  APP_ICON_URL,
  APP_ISSUES_URL,
  APP_TAGLINE,
} from "../../core/constants/appMetadata";
import { isTauri } from "../../core/platform/isTauri";
import { useAboutInfo } from "../../hooks/useAboutInfo";
import { Button } from "../ui/Button";
import { IconButton } from "../ui/IconButton";
import { IconClose } from "../ui/icons";

interface AboutDialogProps {
  open: boolean;
  onClose: () => void;
}

async function openExternal(url: string) {
  if (isTauri()) {
    await openUrl(url);
    return;
  }
  window.open(url, "_blank");
}

export function AboutDialog({ open, onClose }: AboutDialogProps) {
  const aboutInfo = useAboutInfo(open);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="app-dialog"
      data-testid="about-dialog"
      role="dialog"
      aria-modal="true"
      aria-label={`About ${aboutInfo.appName}`}
    >
      <div className="app-dialog__backdrop" onClick={onClose} />
      <div className="app-dialog__panel app-dialog__panel--structured about-dialog">
        <header className="app-dialog__header">
          <h2 className="app-dialog__title">About {aboutInfo.appName}</h2>
          <IconButton label="Close" className="app-dialog__close" onClick={onClose}>
            <IconClose size={18} />
          </IconButton>
        </header>

        <div className="app-dialog__body about-dialog__body">
          <div className="about-dialog__hero">
            <img className="about-dialog__icon" src={APP_ICON_URL} alt="" width={64} height={64} />
            <p className="about-dialog__title">
              {aboutInfo.appName}{" "}
              <span className="about-dialog__version">v{aboutInfo.version}</span>
            </p>
            <p className="about-dialog__tagline">{APP_TAGLINE}</p>
          </div>

          <div className="about-dialog__meta">
            <p>
              © {aboutInfo.copyrightYear} {aboutInfo.author}
            </p>
            <p>{aboutInfo.license} license</p>
            {aboutInfo.tauriVersion ? (
              <p className="about-dialog__build">Built with Tauri {aboutInfo.tauriVersion}</p>
            ) : null}
          </div>

          <div className="about-dialog__links">
            <Button variant="ghost" onClick={() => void openExternal(APP_GITHUB_URL)}>
              GitHub
            </Button>
            <Button variant="ghost" onClick={() => void openExternal(APP_ISSUES_URL)}>
              Report issue
            </Button>
          </div>
        </div>

        <footer className="app-dialog__footer">
          <Button variant="primary" onClick={onClose}>
            Close
          </Button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
