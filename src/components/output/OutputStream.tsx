import { useEffect, useRef, useState } from "react";

interface OutputStreamProps {
  stdout: string;
  stderr: string;
  error: string | null;
  timedOut: boolean;
  isRunning: boolean;
}

export function OutputStream({
  stdout,
  stderr,
  error,
  timedOut,
  isRunning,
}: OutputStreamProps) {
  const containerRef = useRef<HTMLPreElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const hasContent =
    stdout.length > 0 ||
    stderr.length > 0 ||
    error !== null ||
    timedOut;

  useEffect(() => {
    if (!autoScroll || !containerRef.current) {
      return;
    }
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [stdout, stderr, error, timedOut, autoScroll, isRunning]);

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
        <span className="output-stream__running">Running...</span>
      )}
    </pre>
  );
}
