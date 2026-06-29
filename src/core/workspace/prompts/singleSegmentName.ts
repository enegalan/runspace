/**
 * Validates that a prompt value is a single path segment (no separators or traversal).
 * @param name - The name to validate.
 * @returns An error message, or null if valid.
 */
export function singleSegmentNameError(name: string): string | null {
  if (name.includes("/") || name.includes("\\")) {
    return "Name cannot contain path separators.";
  }
  if (name === "." || name === ".." || name.includes("..")) {
    return "Name cannot contain traversal segments.";
  }
  return null;
}
