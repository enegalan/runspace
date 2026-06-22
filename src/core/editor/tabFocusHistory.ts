/**
 * Remembers the focus of the given tab.
 * @param history - The history of the tab focus.
 * @param previousActive - The previous active tab.
 * @returns The history of the tab focus.
 */
export function rememberTabFocus(history: string[], previousActive: string | null): string[] {
  if (!previousActive) {
    return history;
  }

  return [previousActive, ...removeFromTabFocusHistory(history, previousActive)];
}

/**
 * Removes the given path from the tab focus history.
 * @param history - The history of the tab focus.
 * @param path - The path to remove from the history.
 * @returns The history of the tab focus.
 */
export function removeFromTabFocusHistory(history: string[], path: string): string[] {
  return history.filter((item) => item !== path);
}

/**
 * Picks the next active tab from the given history.
 * @param history - The history of the tab focus.
 * @param openPaths - The open paths.
 * @param closedIndex - The index of the closed tab.
 * @returns The next active tab.
 */
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
