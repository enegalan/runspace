import { getRuntimeFileExtension } from "./fileExtension";

export function nextUntitledFileName(
  existingPaths: string[],
  environmentId: string,
): string {
  const ext = getRuntimeFileExtension(environmentId);
  const existing = new Set(existingPaths);

  for (let n = 1; n < 10_000; n += 1) {
    const baseName = n === 1 ? "Untitled" : `Untitled (${n})`;
    const path = `${baseName}.${ext}`;
    if (!existing.has(path)) {
      return baseName;
    }
  }

  return "Untitled";
}
