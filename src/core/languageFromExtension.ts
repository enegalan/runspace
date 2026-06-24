import { mergeEnvironmentCatalog } from "./constants/environmentCatalog";
import { useEnvironmentStore } from "../stores/environmentStore";
import { basename } from "./path/basename";

/**
 * The default language when no extension mapping matches.
 */
const DEFAULT_LANGUAGE = "plaintext";

// TODO: Use a library for this mapping.
/**
 * Extensions shared across workspaces, not tied to a single environment manifest.
 */
const AUXILIARY_EXTENSION_LANGUAGE_MAP: Record<string, string> = {
  mjs: "javascript",
  cjs: "javascript",
  ts: "typescript",
  tsx: "typescript",
  cc: "cpp",
  h: "c",
  hpp: "cpp",
  json: "json",
  md: "markdown",
  html: "html",
  css: "css",
};

/**
 * Maps runtime extensions to Monaco editor languages.
 * @returns The map of runtime extensions to Monaco editor languages.
 */
function runtimeExtensionLanguageMap(): Map<string, string> {
  const state = useEnvironmentStore.getState();
  const catalog = mergeEnvironmentCatalog(
    state.environments.map((env) => env.definition),
    state.available,
  );
  const map = new Map<string, string>();
  for (const definition of catalog) {
    map.set(definition.file_extension.toLowerCase(), definition.monaco_language);
  }
  return map;
}

/**
 * Resolves the Monaco editor language for a file path.
 * Primary runtime extensions come from bundled environment manifests.
 */
export function languageFromExtension(path: string): string {
  const base = basename(path);
  const dot = base.lastIndexOf(".");
  if (dot <= 0) {
    return DEFAULT_LANGUAGE;
  }
  const ext = base.slice(dot + 1).toLowerCase();
  const runtimeLanguage = runtimeExtensionLanguageMap().get(ext);
  if (runtimeLanguage) {
    return runtimeLanguage;
  }

  return AUXILIARY_EXTENSION_LANGUAGE_MAP[ext] ?? DEFAULT_LANGUAGE;
}
