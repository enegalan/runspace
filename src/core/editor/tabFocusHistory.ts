export function rememberTabFocus(history: string[], previousActive: string | null): string[] {
  if (!previousActive) {
    return history;
  }

  return [previousActive, ...history.filter((path) => path !== previousActive)];
}

export function removeFromTabFocusHistory(history: string[], path: string): string[] {
  return history.filter((item) => item !== path);
}

export function pickNextActiveTab(
  history: string[],
  openPaths: string[],
  closedIndex: number,
): string | null {
  if (openPaths.length === 0) {
    return null;
  }

  const openSet = new Set(openPaths);
  const fromHistory = history.find((path) => openSet.has(path));
  if (fromHistory) {
    return fromHistory;
  }

  return openPaths[closedIndex] ?? openPaths[closedIndex - 1] ?? null;
}
