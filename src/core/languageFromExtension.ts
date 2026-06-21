import { basename } from "./path/basename";

/** The default language when no extension mapping matches. */
const DEFAULT_LANGUAGE = "plaintext";

/**
 * This maps file extensions to languages.
 */
const EXTENSION_LANGUAGE_MAP: Record<string, string> = {
  js: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  ts: "typescript",
  tsx: "typescript",
  php: "php",
  py: "python",
  rb: "ruby",
  c: "c",
  cpp: "cpp",
  cc: "cpp",
  h: "c",
  hpp: "cpp",
  json: "json",
  md: "markdown",
  html: "html",
  css: "css",
};

/**
 * This function is used to get the language for a given file extension.
 * @param path - The path of the file.
 * @returns The language for the given file extension.
 */
export function languageFromExtension(path: string): string {
  const base = basename(path);
  const dot = base.lastIndexOf(".");
  if (dot <= 0) {
    return DEFAULT_LANGUAGE;
  }
  const ext = base.slice(dot + 1).toLowerCase();
  return EXTENSION_LANGUAGE_MAP[ext] ?? DEFAULT_LANGUAGE;
}
