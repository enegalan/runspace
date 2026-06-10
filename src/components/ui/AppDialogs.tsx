import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useDialogStore } from "../../stores/dialogStore";

export function AppDialogs() {
  const prompt = useDialogStore((state) => state.prompt);
  const confirm = useDialogStore((state) => state.confirm);
  const setPromptValue = useDialogStore((state) => state.setPromptValue);
  const submitPrompt = useDialogStore((state) => state.submitPrompt);
  const cancelPrompt = useDialogStore((state) => state.cancelPrompt);
  const answerConfirm = useDialogStore((state) => state.answerConfirm);

  useEffect(() => {
    if (!prompt) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        cancelPrompt();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [prompt, cancelPrompt]);

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <>
      {prompt && (
        <div className="app-dialog" data-testid="prompt-dialog">
          <div className="app-dialog__backdrop" onClick={cancelPrompt} />
          <form
            className="app-dialog__panel"
            onSubmit={(event) => {
              event.preventDefault();
              submitPrompt();
            }}
          >
            <h3 className="app-dialog__title">{prompt.title}</h3>
            <input
              className="app-dialog__input"
              value={prompt.value}
              placeholder={prompt.placeholder}
              autoFocus
              onChange={(event) => setPromptValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.preventDefault();
                  cancelPrompt();
                }
              }}
            />
            <div className="app-dialog__actions">
              <button
                type="button"
                className="app-dialog__btn"
                onClick={cancelPrompt}
              >
                Cancel
              </button>
              <button type="submit" className="app-dialog__btn app-dialog__btn--primary">
                OK
              </button>
            </div>
          </form>
        </div>
      )}

      {confirm && (
        <div className="app-dialog" data-testid="confirm-dialog">
          <div className="app-dialog__backdrop" onClick={() => answerConfirm(false)} />
          <div className="app-dialog__panel">
            <p className="app-dialog__message">{confirm.message}</p>
            <div className="app-dialog__actions">
              <button
                type="button"
                className="app-dialog__btn"
                onClick={() => answerConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`app-dialog__btn${
                  confirm.danger ? " app-dialog__btn--danger" : " app-dialog__btn--primary"
                }`}
                onClick={() => answerConfirm(true)}
              >
                {confirm.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body,
  );
}
