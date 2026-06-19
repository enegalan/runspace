export function matchesEnvironmentSearch(
  name: string,
  categoryLabel: string,
  query: string,
): boolean {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    return true;
  }
  const haystack = `${name} ${categoryLabel}`.toLowerCase();
  return haystack.includes(trimmed);
}
