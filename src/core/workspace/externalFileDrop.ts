import { isTauri } from "../platform/isTauri";
import { hasFileDrag } from "./fileTreeDrag";
import { useEditorTabsStore } from "../../stores/editorTabsStore";
import { useWorkspaceStore } from "../../stores/workspaceStore";

export const DROP_TARGET_ATTR = "data-drop-dir";

export function hasExternalFileDrag(dataTransfer: DataTransfer): boolean {
  if (hasFileDrag(dataTransfer.types)) {
    return false;
  }
  return (
    Array.from(dataTransfer.types).includes("Files") ||
    dataTransfer.files.length > 0
  );
}

export function getExternalFiles(dataTransfer: DataTransfer): File[] {
  return Array.from(dataTransfer.files);
}

export function resolveDropTargetFromPoint(x: number, y: number): string | null {
  const element = document.elementFromPoint(x, y);
  if (!element) {
    return null;
  }
  const target = element.closest(`[${DROP_TARGET_ATTR}]`);
  if (!target) {
    return null;
  }
  return target.getAttribute(DROP_TARGET_ATTR) ?? "";
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

let highlightedTarget: Element | null = null;

export function setExternalDropHighlight(targetDir: string | null): void {
  if (highlightedTarget) {
    highlightedTarget.classList.remove("external-drop-target");
    highlightedTarget = null;
  }
  if (targetDir === null) {
    return;
  }
  const selector =
    targetDir === ""
      ? `[${DROP_TARGET_ATTR}=""]`
      : `[${DROP_TARGET_ATTR}="${CSS.escape(targetDir)}"]`;
  const next = document.querySelector(selector);
  if (next) {
    next.classList.add("external-drop-target");
    highlightedTarget = next;
  }
}

export function pickImportedFileToOpen(paths: string[]): string | null {
  const file = paths.find((path) => !path.endsWith("/"));
  return file ?? null;
}

export async function importDroppedExternalFiles(
  dataTransfer: DataTransfer,
  targetDir: string,
  options: { openFile?: boolean } = {},
): Promise<void> {
  if (isTauri() || !hasExternalFileDrag(dataTransfer)) {
    return;
  }

  const files = getExternalFiles(dataTransfer);
  if (files.length === 0 || !useWorkspaceStore.getState().workspace) {
    return;
  }

  try {
    const imported = await useWorkspaceStore
      .getState()
      .importExternalFiles(files, targetDir);
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
