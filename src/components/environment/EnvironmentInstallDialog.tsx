import { createPortal } from "react-dom";
import { useEnvironmentStore } from "../../stores/environmentStore";

/**
 * Blocking overlay shown while a framework environment is being prepared.
 * @returns The EnvironmentInstallDialog component.
 */
export function EnvironmentInstallDialog() {
  const installingEnvironment = useEnvironmentStore((state) => state.installingEnvironment);

  if (!installingEnvironment || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="app-dialog" data-testid="environment-install-dialog">
      <div className="app-dialog__backdrop app-dialog__backdrop--blocking" />
      <div
        className="app-dialog__panel app-dialog__panel--structured environment-install-dialog__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="environment-install-dialog-title"
        aria-busy="true"
      >
        <header className="app-dialog__header">
          <h2 id="environment-install-dialog-title" className="app-dialog__title">
            Preparing {installingEnvironment.name}
          </h2>
        </header>
        <div className="app-dialog__body environment-install-dialog__body">
          <p className="environment-install-dialog__message">
            Generating the framework sandbox and installing dependencies. This may take a few
            minutes.
          </p>
          <div
            className="app-loading__bar environment-install-dialog__bar"
            role="progressbar"
            aria-valuetext="Preparing environment"
          >
            <span className="app-loading__bar-indicator" />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
