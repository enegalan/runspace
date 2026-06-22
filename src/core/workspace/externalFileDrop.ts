import { hasFileDrag } from "./fileTreeDrag";
import { useEditorTabsStore } from "../../stores/editorTabsStore";
import { useWorkspaceStore } from "../../stores/workspaceStore";

/** Data attribute marking a directory drop target in the file tree. */
export const DROP_TARGET_ATTR = "data-drop-dir";

/**
 * Checks if the data transfer has external file drag.
 * @param dataTransfer - The data transfer to check.
 * @returns `true` if the data transfer has external file drag, `false` otherwise.
 */
export function hasExternalFileDrag(dataTransfer: DataTransfer): boolean {
  if (hasFileDrag(dataTransfer.types)) {
    return false;
  }
  return Array.from(dataTransfer.types).includes("Files") || dataTransfer.files.length > 0;
}

/**
 * Gets the external files from the data transfer.
 * @param dataTransfer - The data transfer to get the external files from.
 * @returns The external files.
 */
export function getExternalFiles(dataTransfer: DataTransfer): File[] {
  return Array.from(dataTransfer.files);
}

/**
 * Reads the file as text.
 * @param file - The file to read.
 * @returns The file as text.
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(typeof reader.result === "string" ? reader.result : "");
    };
    reader.onerror = () => {
      reject(reader.error ?? new Error(`Failed to read ${file.name}`));
    };
    reader.readAsText(file);
  });
}

/**
 * Picks the imported file to open.
 * @param paths - The paths to pick the imported file to open from.
 * @returns The imported file to open, or `null` if there is no imported file to open.
 */
export function pickImportedFileToOpen(paths: string[]): string | null {
  const file = paths.find((path) => !path.endsWith("/"));
  return file ?? null;
}

/**
 * Imports the dropped external files.
 * @param dataTransfer - The data transfer to import the dropped external files from.
 * @param targetDir - The target directory to import the dropped external files to.
 * @param options - The options for the import.
 * @returns The imported files.
 */
export async function importDroppedExternalFiles(
  dataTransfer: DataTransfer,
  targetDir: string,
  options: { openFile?: boolean } = {},
): Promise<void> {
  if (!hasExternalFileDrag(dataTransfer)) {
    return;
  }

  const files = getExternalFiles(dataTransfer);
  if (files.length === 0 || !useWorkspaceStore.getState().workspace) {
    return;
  }

  try {
    const imported = await useWorkspaceStore.getState().importExternalFiles(files, targetDir);
    if (options.openFile) {
      const fileToOpen = pickImportedFileToOpen(imported);
      if (fileToOpen) {
        await useEditorTabsStore.getState().openFile(fileToOpen);
      }
    }
  } catch (error) {
    console.error("Failed to import dropped files:", error);
  }
}
