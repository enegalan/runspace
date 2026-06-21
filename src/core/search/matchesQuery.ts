/**
 * Checks if the given query matches the given terms.
 * @param query - The query to check.
 * @param terms - The terms to check.
 * @returns `true` if the query matches the terms, `false` otherwise.
 */
export function matchesQuery(query: string, ...terms: (string | undefined)[]): boolean {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    return true;
  }

  const haystack = terms.filter(Boolean).join(" ").toLowerCase();
  return haystack.includes(trimmed);
}
