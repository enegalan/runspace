interface RuntimeChangeDialogProps {
  open: boolean;
  environmentName: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function RuntimeChangeDialog({
  open,
  environmentName,
  onCancel,
  onConfirm,
}: RuntimeChangeDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="runtime-dialog" role="dialog" aria-modal="true" aria-labelledby="runtime-dialog-title">
      <div className="runtime-dialog__backdrop" onClick={onCancel} aria-hidden="true" />
      <div className="runtime-dialog__panel">
        <h2 id="runtime-dialog-title" className="runtime-dialog__title">
          Switch to {environmentName}?
        </h2>
        <p className="runtime-dialog__message">
          Your current code will be replaced with the {environmentName} template.
        </p>
        <div className="runtime-dialog__actions">
          <button type="button" className="runtime-dialog__btn" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="runtime-dialog__btn runtime-dialog__btn--primary"
            onClick={onConfirm}
          >
            Switch
          </button>
        </div>
      </div>
    </div>
  );
}
