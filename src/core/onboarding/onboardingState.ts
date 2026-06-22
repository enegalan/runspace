import { runspaceInvoke } from "../api/runspaceInvoke";
import type { SessionData } from "../types/workspace";

const STORAGE_KEY = "runspace.onboarding.complete";

let sessionComplete = false;

/**
 * Reads the local onboarding complete flag.
 * @returns The local onboarding complete flag.
 */
function readLocalOnboardingComplete(): boolean {
  if (typeof localStorage === "undefined") {
    return false;
  }
  return localStorage.getItem(STORAGE_KEY) === "1";
}

/**
 * Syncs the onboarding from the session.
 * @param session - The session data.
 * @returns The onboarding complete flag.
 */
export function syncOnboardingFromSession(session: SessionData): boolean {
  sessionComplete = session.onboarding_complete === true || readLocalOnboardingComplete();
  if (sessionComplete && typeof localStorage !== "undefined") {
    localStorage.setItem(STORAGE_KEY, "1");
  }
  return sessionComplete;
}

/**
 * Checks if the onboarding is complete.
 * @returns The onboarding complete flag.
 */
export function isOnboardingComplete(): boolean {
  return sessionComplete || readLocalOnboardingComplete();
}

/**
 * Marks the onboarding as complete.
 */
export async function markOnboardingComplete(): Promise<void> {
  sessionComplete = true;
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(STORAGE_KEY, "1");
  }

  try {
    const session = await runspaceInvoke<SessionData>("read_session");
    if (session.onboarding_complete) {
      return;
    }
    await runspaceInvoke("write_session", {
      session: { ...session, onboarding_complete: true },
    });
  } catch {
    // Session persistence is best-effort; local flag still applies this session.
  }
}

/**
 * Clears the onboarding complete flag.
 */
export function clearOnboardingComplete(): void {
  sessionComplete = false;
  if (typeof localStorage === "undefined") {
    return;
  }
  localStorage.removeItem(STORAGE_KEY);
}
