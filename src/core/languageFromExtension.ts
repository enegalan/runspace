import langMap from "lang-map";
import { basename } from "./path/basename";

/**
 * The default language when no extension mapping matches.
 */
const DEFAULT_LANGUAGE = "plaintext";

/**
 * Linguist language ids that differ from Monaco language ids.
 */
const MONACO_LANGUAGE_IDS: Record<string, string> = {
  "c++": "cpp",
  cjs: "javascript",
  mjs: "javascript",
  tsx: "typescript",
};

/**
 * Resolves the Monaco editor language for a file path.
 */
export function languageFromExtension(path: string): string {
  const base = basename(path);
  const dot = base.lastIndexOf(".");
  if (dot <= 0) {
    return DEFAULT_LANGUAGE;
  }
  const ext = base.slice(dot + 1).toLowerCase();
  const languages = langMap.languages(ext);
  const isMapped = Object.prototype.hasOwnProperty.call(langMap().languages, ext);
  const isMonacoOverride = Object.prototype.hasOwnProperty.call(
    MONACO_LANGUAGE_IDS,
    ext,
  );
  if ((!isMapped && !isMonacoOverride) || languages.length === 0) {
    return DEFAULT_LANGUAGE;
  }
  const languageId = languages.find((id: string) => id === ext) ?? languages[0];
  return MONACO_LANGUAGE_IDS[languageId] ?? languageId;
}
