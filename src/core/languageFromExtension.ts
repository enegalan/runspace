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

export function languageFromExtension(path: string): string {
  const base = path.split("/").pop() ?? path;
  const dot = base.lastIndexOf(".");
  if (dot <= 0) {
    return "plaintext";
  }
  const ext = base.slice(dot + 1).toLowerCase();
  return EXTENSION_LANGUAGE_MAP[ext] ?? "plaintext";
}
