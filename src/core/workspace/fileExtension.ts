import { getCatalogDefinition, DEFAULT_FILE_EXTENSION } from "../constants/environmentCatalog";
import { basename } from "../path/basename";

/**
 * Gets the file extension for the given environment ID.
 * @param environmentId - The ID of the environment.
 * @returns The file extension for the given environment ID.
 */
export function getFileExtension(environmentId: string): string {
  return getCatalogDefinition(environmentId)?.file_extension ?? DEFAULT_FILE_EXTENSION;
}

/**
 * Normalizes the file name for the given input and environment ID.
 * @param input - The input to normalize.
 * @param environmentId - The ID of the environment.
 * @returns The normalized file name.
 */
export function normalizeFileName(input: string, environmentId: string): string {
  const trimmed = input.trim();
  const baseName = basename(trimmed);
  if (!baseName.includes(".")) {
    return `${trimmed}.${getFileExtension(environmentId)}`;
  }
  return trimmed;
}
