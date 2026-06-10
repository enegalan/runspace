const RUNTIME_EXTENSIONS: Record<string, string> = {
  nodejs: "js",
  php: "php",
  python: "py",
  ruby: "rb",
  laravel: "php",
  symfony: "php",
};

export function getRuntimeFileExtension(environmentId: string): string {
  return RUNTIME_EXTENSIONS[environmentId] ?? "txt";
}

export function normalizeFileName(input: string, environmentId: string): string {
  const trimmed = input.trim();
  const baseName = trimmed.split("/").pop() ?? trimmed;
  if (!baseName.includes(".")) {
    return `${trimmed}.${getRuntimeFileExtension(environmentId)}`;
  }
  return trimmed;
}
