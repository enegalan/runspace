import { getCatalogDefinition } from "../constants/environmentCatalog";
import { getMonacoLanguage, getRuntimeTemplate } from "../templates";

export function shouldConfirmEnvironmentSwitch(code: string, currentEnvironmentId: string): boolean {
  const trimmed = code.trim();
  if (!trimmed) {
    return false;
  }

  const currentTemplate = getRuntimeTemplate(currentEnvironmentId);
  return code !== currentTemplate && trimmed !== currentTemplate.trim();
}

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
