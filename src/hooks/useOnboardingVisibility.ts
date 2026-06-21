import { useEffect, useRef } from "react";
import { isOnboardingComplete } from "../core/onboarding/onboardingState";
import { useWorkspaceStore } from "../stores/workspaceStore";

/**
 * The useOnboardingVisibility hook.
 * @returns The useOnboardingVisibility hook.
 */
export function useOnboardingVisibility() {
  const workspace = useWorkspaceStore((state) => state.workspace);
  const onboardingRequired = useWorkspaceStore((state) => state.onboardingRequired);
  const onboardingComplete = useWorkspaceStore((state) => state.onboardingComplete);
  const hasEnteredMainShell = useRef(
    useWorkspaceStore.getState().onboardingComplete || isOnboardingComplete(),
  );

  useEffect(() => {
    if (workspace !== null || onboardingComplete || isOnboardingComplete()) {
      hasEnteredMainShell.current = true;
    }
  }, [workspace, onboardingComplete]);

  const showWelcome =
    onboardingRequired &&
    !onboardingComplete &&
    !isOnboardingComplete() &&
    !hasEnteredMainShell.current;

  return { showWelcome };
}
