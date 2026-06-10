import { runspaceInvoke } from "../api/runspaceInvoke";
import type { SessionData } from "../types/workspace";

const STORAGE_KEY = "runspace.onboarding.complete";

let sessionComplete = false;

function readLocalOnboardingComplete(): boolean {
  if (typeof localStorage === "undefined") {
    return false;
  }
  return localStorage.getItem(STORAGE_KEY) === "1";
}

export function syncOnboardingFromSession(session: SessionData): boolean {
  sessionComplete = session.onboarding_complete === true || readLocalOnboardingComplete();
  if (sessionComplete && typeof localStorage !== "undefined") {
    localStorage.setItem(STORAGE_KEY, "1");
  }
  return sessionComplete;
}

export function isOnboardingComplete(): boolean {
  return sessionComplete || readLocalOnboardingComplete();
}

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

export function clearOnboardingComplete(): void {
  sessionComplete = false;
  if (typeof localStorage === "undefined") {
    return;
  }
  localStorage.removeItem(STORAGE_KEY);
}
