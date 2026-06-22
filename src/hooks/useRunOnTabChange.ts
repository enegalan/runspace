import { useEffect, useRef } from "react";

interface UseRunOnTabChangeOptions {
  tabsLoaded: boolean;
  activePath: string | null;
  isRunning: boolean;
  runOnTabChange: boolean;
  runDisabled: boolean;
  handleRun: () => void;
  stop: () => Promise<void>;
  clear: () => void;
}

/**
 * The useRunOnTabChange hook.
 * @param tabsLoaded - Whether the tabs are loaded.
 * @param activePath - The active path.
 * @param isRunning - Whether the execution is running.
 * @param runOnTabChange - Whether to run on tab change.
 * @param runDisabled - Whether the run is disabled.
 * @param handleRun - The function to call when the run is triggered.
 * @param stop - The function to call when the execution is stopped.
 * @param clear - The function to call when the execution is cleared.
 * @returns The useRunOnTabChange hook.
 */
export function useRunOnTabChange({
  tabsLoaded,
  activePath,
  isRunning,
  runOnTabChange,
  runDisabled,
  handleRun,
  stop,
  clear,
}: UseRunOnTabChangeOptions): void {
  const tabChangeReadyRef = useRef(false);
  const prevActivePathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!tabsLoaded) {
      return;
    }
    if (!tabChangeReadyRef.current) {
      tabChangeReadyRef.current = true;
      prevActivePathRef.current = activePath;
      return;
    }
    if (prevActivePathRef.current === activePath) {
      return;
    }
    prevActivePathRef.current = activePath;
    void (async () => {
      if (isRunning) {
        await stop();
      }
      clear();
      if (runOnTabChange && activePath && !runDisabled) {
        handleRun();
      }
    })();
  }, [tabsLoaded, activePath, clear, stop, isRunning, runOnTabChange, runDisabled, handleRun]);
}
