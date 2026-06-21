import { ENVIRONMENT_CATALOG } from "./environmentCatalog";
import type { EnvironmentCategory, EnvironmentDefinition } from "../types/environment";

/**
 * The environment category labels.
 * @returns The environment category labels.
 */
export const ENVIRONMENT_CATEGORY_LABELS: Record<EnvironmentCategory, string> = {
  language: "Languages",
  framework: "Frameworks",
};

/**
 * The environment category row labels.
 * @returns The environment category row labels.
 */
export const ENVIRONMENT_CATEGORY_ROW_LABELS: Record<EnvironmentCategory, string> = {
  language: "Language",
  framework: "Framework",
};

/**
 * Groups the given items by category.
 * @param items - The items to group.
 * @returns The items grouped by category.
 */
export function groupByCategory<T extends { definition: { category: EnvironmentCategory } }>(
  items: T[],
): Record<EnvironmentCategory, T[]> {
  const groups: Record<EnvironmentCategory, T[]> = {
    language: [],
    framework: [],
  };
  for (const item of items) {
    groups[item.definition.category].push(item);
  }
  return groups;
}

/**
 * Groups the catalog by category.
 * @returns The catalog grouped by category.
 */
export function groupCatalogByCategory(): Record<EnvironmentCategory, EnvironmentDefinition[]> {
  const groups: Record<EnvironmentCategory, EnvironmentDefinition[]> = {
    language: [],
    framework: [],
  };
  for (const definition of ENVIRONMENT_CATALOG) {
    groups[definition.category].push(definition);
  }
  return groups;
}
