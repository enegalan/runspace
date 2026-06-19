import { open } from "@tauri-apps/plugin-dialog";
import { fetchBackend } from "./fetchBackend";
import { isTauri } from "../platform/isTauri";

interface BrowseResponse {
  path: string | null;
}

export async function pickNativePath(directory: boolean): Promise<string | null> {
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

  if (! response.ok) {
    throw new Error("Failed to open file picker");
  }

  const body = (await response.json()) as BrowseResponse;
  return body.path;
}
