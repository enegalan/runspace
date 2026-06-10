import { getCatalogDefinition } from "../constants/environmentCatalog";
import { getMonacoLanguage, getRuntimeTemplate } from "../templates";

export function environmentEditorState(environmentId: string): {
  code: string;
  language: string;
} {
  const definition = getCatalogDefinition(environmentId);
  return {
    code: getRuntimeTemplate(environmentId),
    language: definition?.monaco_language ?? getMonacoLanguage(environmentId),
  };
}
