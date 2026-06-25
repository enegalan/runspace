import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { useDialogStore } from "../../stores/dialogStore";
import { Button } from "./Button";
import { IconButton } from "./IconButton";
import { IconClose } from "./icons";
import { Input } from "./Input";

/**
 * The AppDialogs component.
 * @returns The AppDialogs component.
 */
export function AppDialogs() {
  const prompt = useDialogStore((state) => state.prompt);
  const confirm = useDialogStore((state) => state.confirm);
  const setPromptValue = useDialogStore((state) => state.setPromptValue);
  const submitPrompt = useDialogStore((state) => state.submitPrompt);
  const cancelPrompt = useDialogStore((state) => state.cancelPrompt);
  const answerConfirm = useDialogStore((state) => state.answerConfirm);
  const promptInputRef = useRef<HTMLInputElement>(null);
  const promptTitleId = useId();
  const confirmMessageId = useId();

  const promptKey = prompt?.key ?? null;

  useEffect(() => {
    if (promptKey === null) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      const input = promptInputRef.current;
      if (!input) {
        return;
      }
      input.focus({ preventScroll: true });
      const end = input.value.length;
      input.setSelectionRange(end, end);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [promptKey]);

  useEffect(() => {
    if (promptKey === null) {
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
  }, [promptKey, cancelPrompt]);

  useEffect(() => {
    if (!confirm) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        answerConfirm(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [confirm, answerConfirm]);

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <>
      {prompt && (
        <div className="app-dialog" data-testid="prompt-dialog">
          <div className="app-dialog__backdrop" onClick={cancelPrompt} />
          <form
            className="app-dialog__panel app-dialog__panel--structured"
            role="dialog"
            aria-modal="true"
            aria-labelledby={promptTitleId}
            onSubmit={(event) => {
              event.preventDefault();
              submitPrompt();
            }}
          >
            <header className="app-dialog__header">
              <h2 id={promptTitleId} className="app-dialog__title">
                {prompt.title}
              </h2>
              <IconButton label="Close" className="app-dialog__close" onClick={cancelPrompt}>
                <IconClose size={16} />
              </IconButton>
            </header>
            <div className="app-dialog__body">
              <Input
                ref={promptInputRef}
                value={prompt.value}
                placeholder={prompt.placeholder}
                error={prompt.error}
                autoCapitalize="off"
                autoCorrect="off"
                autoComplete="off"
                spellCheck={false}
                onChange={(event) => setPromptValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    event.preventDefault();
                    cancelPrompt();
                  }
                }}
              />
            </div>
            <footer className="app-dialog__footer">
              <Button variant="ghost" onClick={cancelPrompt}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                OK
              </Button>
            </footer>
          </form>
        </div>
      )}

      {confirm && (
        <div className="app-dialog" data-testid="confirm-dialog">
          <div className="app-dialog__backdrop" onClick={() => answerConfirm(false)} />
          <div
            className={`app-dialog__panel app-dialog__panel--structured${confirm.danger ? " app-dialog__panel--danger" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={confirmMessageId}
          >
            <header className="app-dialog__header">
              <h2 id={confirmMessageId} className="app-dialog__title">
                {confirm.danger ? "Confirm action" : "Confirm"}
              </h2>
              <IconButton
                label="Close"
                className="app-dialog__close"
                onClick={() => answerConfirm(false)}
              >
                <IconClose size={16} />
              </IconButton>
            </header>
            <div className="app-dialog__body">
              <p className="app-dialog__message" title={confirm.message}>
                {confirm.message}
              </p>
            </div>
            <footer className="app-dialog__footer">
              <Button variant="ghost" onClick={() => answerConfirm(false)}>
                Cancel
              </Button>
              <Button
                variant={confirm.danger ? "danger" : "primary"}
                dangerActive={confirm.danger}
                onClick={() => answerConfirm(true)}
              >
                {confirm.confirmLabel}
              </Button>
            </footer>
          </div>
        </div>
      )}
    </>,
    document.body,
  );
}
