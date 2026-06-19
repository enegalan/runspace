export function AppLoadingScreen() {
  return (
    <div className="app-loading" data-testid="app-loading-screen" role="status" aria-live="polite" aria-busy="true">
      <p className="app-loading__message">Loading Runspace...</p>
      <div
        className="app-loading__bar"
        role="progressbar"
        aria-valuetext="Loading"
        aria-label="Loading"
      >
        <span className="app-loading__bar-indicator" />
      </div>
    </div>
  );
}
