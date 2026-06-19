import { hasFileDrag } from "./fileTreeDrag";
import { useEditorTabsStore } from "../../stores/editorTabsStore";
import { useWorkspaceStore } from "../../stores/workspaceStore";

export const DROP_TARGET_ATTR = "data-drop-dir";

export function hasExternalFileDrag(dataTransfer: DataTransfer): boolean {
  if (hasFileDrag(dataTransfer.types)) {
    return false;
  }
  return Array.from(dataTransfer.types).includes("Files") || dataTransfer.files.length > 0;
}

export function getExternalFiles(dataTransfer: DataTransfer): File[] {
  return Array.from(dataTransfer.files);
}

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

export function pickImportedFileToOpen(paths: string[]): string | null {
  const file = paths.find((path) => ! path.endsWith("/"));
  return file ?? null;
}

export async function importDroppedExternalFiles(
  dataTransfer: DataTransfer,
  targetDir: string,
  options: { openFile?: boolean } = {},
): Promise<void> {
  if (! hasExternalFileDrag(dataTransfer)) {
    return;
  }

  const files = getExternalFiles(dataTransfer);
  if (files.length === 0 || ! useWorkspaceStore.getState().workspace) {
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
