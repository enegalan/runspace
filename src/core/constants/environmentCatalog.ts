import type { EnvironmentDefinition } from "../types/environment";

/**
 * The default file extension when no environment definition is available.
 */
export const DEFAULT_FILE_EXTENSION = "txt";

/**
 * Finds an environment definition in the given lists.
 * @param id - Environment id.
 * @param installed - Installed environments.
 * @param available - Available (not installed) definitions.
 */
export function findEnvironmentDefinition(
  id: string,
  installed: EnvironmentDefinition[],
  available: EnvironmentDefinition[],
): EnvironmentDefinition | undefined {
  return (
    installed.find((definition) => definition.id === id) ??
    available.find((definition) => definition.id === id)
  );
}

/**
 * Merges installed and available definitions into a single catalog.
 * @param installed - Installed environment definitions.
 * @param available - Available environment definitions.
 */
export function mergeEnvironmentCatalog(
  installed: EnvironmentDefinition[],
  available: EnvironmentDefinition[],
): EnvironmentDefinition[] {
  const map = new Map<string, EnvironmentDefinition>();
  for (const definition of available) {
    map.set(definition.id, definition);
  }
  for (const definition of installed) {
    map.set(definition.id, definition);
  }
  return Array.from(map.values()).sort((left, right) => left.name.localeCompare(right.name));
}
