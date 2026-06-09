interface OutputPanelProps {
  stdout: string;
  stderr: string;
  timedOut: boolean;
  error: string | null;
}

export function OutputPanel({ stdout, stderr, timedOut, error }: OutputPanelProps) {
  const hasOutput = stdout.length > 0 || stderr.length > 0 || timedOut || error;

  return (
    <aside className="output-panel" data-testid="output-panel">
      <div className="panel">
        <h2 className="panel__heading">Output</h2>
        {error && <p className="output-view__error">{error}</p>}
        {timedOut && <p className="output-view__timeout">Execution timed out.</p>}
        {hasOutput ? (
          <pre className="output-view" data-testid="output-view">
            {stdout}
            {stderr.length > 0 && (
              <span className="output-view__stderr">{stderr}</span>
            )}
          </pre>
        ) : (
          <p className="panel__placeholder">No output yet</p>
        )}
      </div>
    </aside>
  );
}
