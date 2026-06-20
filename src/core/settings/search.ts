export function matchesSettingsSearch(query: string, ...terms: (string | undefined)[]): boolean {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    return true;
  }

  const haystack = terms.filter(Boolean).join(" ").toLowerCase();
  return haystack.includes(trimmed);
}
