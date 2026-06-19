import { useEffect, useRef, useState } from "react";

import type { ExecutionPhase } from "../../core/types/execution";

interface OutputStreamProps {
  stdout: string;
  stderr: string;
  error: string | null;
  timedOut: boolean;
  isRunning: boolean;
  phase: ExecutionPhase | null;
  autoScrollEnabled: boolean;
}

export function OutputStream({
  stdout,
  stderr,
  error,
  timedOut,
  isRunning,
  phase,
  autoScrollEnabled,
}: OutputStreamProps) {
  const containerRef = useRef<HTMLPreElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (autoScrollEnabled) {
      setAutoScroll(true);
    }
  }, [autoScrollEnabled, isRunning]);

  const hasContent = stdout.length > 0 || stderr.length > 0 || error !== null || timedOut;

  useEffect(() => {
    if (!autoScrollEnabled || !autoScroll || !containerRef.current) {
      return;
    }
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [stdout, stderr, error, timedOut, autoScroll, autoScrollEnabled, isRunning]);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) {
      return;
    }
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
    setAutoScroll(atBottom);
  };

  return (
    <pre
      ref={containerRef}
      className="output-stream"
      onScroll={handleScroll}
      data-testid="output-stream"
    >
      {timedOut && (
        <>
          <span className="output-timeout">Execution timed out.</span>
          {(error || stdout || stderr) && "\n"}
        </>
      )}
      {error && (
        <>
          <span className="output-stderr">{error}</span>
          {(stdout || stderr) && "\n"}
        </>
      )}
      {stdout.length > 0 && <span className="output-stdout">{stdout}</span>}
      {stdout.length > 0 && stderr.length > 0 && "\n"}
      {stderr.length > 0 && <span className="output-stderr">{stderr}</span>}
      {isRunning && !hasContent && (
        <span className="output-stream__running">
          {phase === "compile" ? "Compiling..." : "Running..."}
        </span>
      )}
    </pre>
  );
}
