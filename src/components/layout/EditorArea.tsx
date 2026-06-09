import { useState } from "react";
import { DEFAULT_RUNTIME_ID, RUNTIMES } from "../../core/runtimes";
import type { ExecutionStatus } from "../../core/types/execution";
import type { RuntimeId } from "../../core/types/runtime";

const DEFAULT_CODE = 'console.log("Hello, Runspace!");';

interface EditorAreaProps {
  status: ExecutionStatus;
  onRun: (code: string, options?: { runtime?: RuntimeId }) => void;
  onStop: () => void;
}

export function EditorArea({ status, onRun, onStop }: EditorAreaProps) {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [runtime, setRuntime] = useState<RuntimeId>(DEFAULT_RUNTIME_ID);
  const isRunning = status === "running";

  return (
    <main className="editor-area" data-testid="editor-area">
      <div className="editor-area__toolbar">
        <label className="runtime-select">
          <span className="runtime-select__label">Runtime</span>
          <select
            value={runtime}
            onChange={(event) => setRuntime(event.target.value as RuntimeId)}
            disabled={isRunning}
            data-testid="runtime-select"
          >
            {RUNTIMES.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => onRun(code, { runtime })}
          disabled={isRunning}
          data-testid="run-button"
        >
          Run
        </button>
        <button
          type="button"
          className="btn btn--danger"
          onClick={onStop}
          disabled={!isRunning}
          data-testid="stop-button"
        >
          Stop
        </button>
      </div>
      <textarea
        className="code-textarea"
        value={code}
        onChange={(event) => setCode(event.target.value)}
        spellCheck={false}
        data-testid="code-textarea"
      />
    </main>
  );
}
