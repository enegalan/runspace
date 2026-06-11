import type { ExecutionPhase, ExecutionStatus } from "../../core/types/execution";
import {
  OUTPUT_WIDTH_MAX,
  OUTPUT_WIDTH_MIN,
} from "../../core/layout/panelLayout";
import { isTauri } from "../../core/platform/isTauri";
import { usePointerDragResize } from "../../hooks/usePointerDragResize";
import { ResizeHandle } from "../layout/ResizeHandle";
import { IconButton } from "../ui/IconButton";
import { IconClear, IconCopy } from "../ui/icons";
import { OutputStream } from "./OutputStream";

interface OutputPanelProps {
  stdout: string;
  stderr: string;
  status: ExecutionStatus;
  phase: ExecutionPhase | null;
  timedOut: boolean;
  error: string | null;
  width: number;
  onWidthChange: (width: number) => void;
  onClear: () => void;
}

export function OutputPanel({
  stdout,
  stderr,
  status,
  phase,
  timedOut,
  error,
  width,
  onWidthChange,
  onClear,
}: OutputPanelProps) {
  const isRunning = status === "running";
  const hasContent =
    stdout.length > 0 ||
    stderr.length > 0 ||
    error !== null ||
    timedOut ||
    isRunning;

  const onResizePointerDown = usePointerDragResize(width, onWidthChange, {
    min: OUTPUT_WIDTH_MIN,
    max: OUTPUT_WIDTH_MAX,
    side: "left",
  });

  const handleCopyAll = async () => {
    const text = [stdout, stderr, error ? `Error: ${error}` : ""]
      .filter(Boolean)
      .join("\n");
    if (text) {
      await navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="output-shell" style={{ width }} data-testid="output-panel">
      <ResizeHandle
        side="left"
        onPointerDown={onResizePointerDown}
        data-testid="output-resize-handle"
      />
      <aside className="output-panel">
        <div
          className={`output-panel__header${isTauri() ? " output-panel__header--titlebar" : ""}`}
          {...(isTauri() ? { "data-tauri-drag-region": true } : {})}
        >
          <h2 className="output-panel__title">Output</h2>
          <div className="output-panel__actions">
            <IconButton
              label="Clear output"
              onClick={onClear}
              disabled={!hasContent}
              data-testid="clear-button"
            >
              <IconClear size={16} />
            </IconButton>
            {hasContent && (
              <IconButton label="Copy all output" onClick={() => void handleCopyAll()}>
                <IconCopy size={16} />
              </IconButton>
            )}
          </div>
        </div>
        <div className="output-panel__body">
          {hasContent ? (
            <OutputStream
              stdout={stdout}
              stderr={stderr}
              error={error}
              timedOut={timedOut}
              isRunning={isRunning}
              phase={phase}
            />
          ) : (
            <p className="output-panel__placeholder">
              Run your code to see output here
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
