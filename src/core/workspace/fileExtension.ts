import { getCatalogDefinition } from "../constants/environmentCatalog";

export function getRuntimeFileExtension(environmentId: string): string {
  return getCatalogDefinition(environmentId)?.file_extension ?? "txt";
}

export function normalizeFileName(input: string, environmentId: string): string {
  const trimmed = input.trim();
  const baseName = trimmed.split("/").pop() ?? trimmed;
  if (!baseName.includes(".")) {
    return `${trimmed}.${getRuntimeFileExtension(environmentId)}`;
  }
  return trimmed;
}
