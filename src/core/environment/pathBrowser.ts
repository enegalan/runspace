import { open } from "@tauri-apps/plugin-dialog";
import { fetchBackend } from "../api/fetchBackend";
import { isTauri } from "../platform/isTauri";
import type { ConfigFieldType } from "../types/environment";

interface BrowseResponse {
  path: string | null;
}

/**
 * Opens the path browser.
 * @param fieldType - The type of field to browse.
 * @param onSelected - The function to call when a path is selected.
 * @param onError - The function to call when an error occurs.
 */
export async function openPathBrowser(
  fieldType: ConfigFieldType,
  onSelected: (path: string) => void,
  onError: (message: string) => void,
): Promise<void> {
  if (fieldType !== "file_path" && fieldType !== "directory_path") {
    onError(`Invalid field type for path browser: ${fieldType}`);
    return;
  }

  try {
    const selected = await pickNativePath(fieldType === "directory_path");
    if (selected) {
      onSelected(selected);
    }
  } catch (err) {
    onError(err instanceof Error ? err.message : String(err));
  }
}

/**
 * Picks the native path.
 * @param directory - Whether to pick a directory.
 * @returns The native path.
 */
async function pickNativePath(directory: boolean): Promise<string | null> {
  if (isTauri()) {
    const selected = await open({
      multiple: false,
      directory,
    });
    return typeof selected === "string" ? selected : null;
  }

  const response = await fetchBackend("/api/browse", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ directory }),
  });

  if (!response.ok) {
    throw new Error("Failed to open file picker");
  }

  const body = (await response.json()) as BrowseResponse;
  return body.path;
}
