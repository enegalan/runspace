import { createListenerSet } from "../sync/listenerSet";
import { basename } from "../path/basename";

export const FILE_TREE_DRAG_TYPE = "application/x-runspace-file-path";

interface FileTreeDragPayload {
  path: string;
  isDirectory: boolean;
}

let activeDragPayload: FileTreeDragPayload | null = null;

let fileTreeDragActive = false;
const dragActiveListeners = createListenerSet();

/**
 * Checks if the file tree drag is active.
 * @returns `true` if the file tree drag is active, `false` otherwise.
 */
export function isFileTreeDragActive(): boolean {
  return fileTreeDragActive;
}

/**
 * Sets the file tree drag active.
 * @param active - Whether the file tree drag is active.
 */
export function setFileTreeDragActive(active: boolean): void {
  if (fileTreeDragActive === active) {
    return;
  }
  fileTreeDragActive = active;
  dragActiveListeners.notify();
}

/**
 * Subscribes to the file tree drag active.
 * @param listener - The listener to subscribe to.
 * @returns The function to unsubscribe from the file tree drag active.
 */
export function subscribeFileTreeDragActive(listener: () => void): () => void {
  return dragActiveListeners.subscribe(listener);
}

/**
 * Sets the file drag data.
 * @param dataTransfer - The data transfer to set the file drag data on.
 * @param payload - The payload to set the file drag data on.
 */
export function setFileDragData(dataTransfer: DataTransfer, payload: FileTreeDragPayload): void {
  activeDragPayload = payload;
  setFileTreeDragActive(true);
  dataTransfer.setData(FILE_TREE_DRAG_TYPE, JSON.stringify(payload));
  dataTransfer.setData("text/plain", payload.path);
  dataTransfer.effectAllowed = payload.isDirectory ? "move" : "all";
}

/**
 * Clears the file drag data.
 */
export function clearFileDragData(): void {
  activeDragPayload = null;
  setFileTreeDragActive(false);
}

/**
 * Gets the active drag payload.
 * @returns The active drag payload.
 */
export function getActiveDragPayload(): FileTreeDragPayload | null {
  return activeDragPayload;
}

/**
 * Checks if the data transfer has file drag.
 * @param types - The types of the data transfer.
 * @returns `true` if the data transfer has file drag, `false` otherwise.
 */
export function hasFileDrag(types: DataTransfer["types"]): boolean {
  return Array.from(types).includes(FILE_TREE_DRAG_TYPE);
}

/**
 * Reads the file drag data.
 * @param dataTransfer - The data transfer to read the file drag data from.
 * @returns The file drag data.
 */
export function readFileDragData(dataTransfer: DataTransfer): FileTreeDragPayload | null {
  const raw = dataTransfer.getData(FILE_TREE_DRAG_TYPE);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as FileTreeDragPayload;
      if (typeof parsed.path === "string") {
        return {
          path: parsed.path,
          isDirectory: Boolean(parsed.isDirectory),
        };
      }
    } catch {
      // fall through
    }
  }

  if (activeDragPayload) {
    return activeDragPayload;
  }

  const plain = dataTransfer.getData("text/plain");
  if (plain) {
    return { path: plain, isDirectory: false };
  }

  return null;
}

/**
 * Gets the parent directory of the given source path.
 * @param sourcePath - The source path to get the parent directory of.
 * @returns The parent directory of the given source path.
 */
export function parentDir(sourcePath: string): string {
  return sourcePath.includes("/") ? sourcePath.slice(0, sourcePath.lastIndexOf("/")) : "";
}

/**
 * Gets the sibling path of the given parent path and name.
 * @param parentPath - The parent path to get the sibling path of.
 * @param name - The name to get the sibling path of.
 * @returns The sibling path of the given parent path and name.
 */
export function siblingPath(parentPath: string, name: string): string {
  return parentPath ? `${parentPath}/${name}` : name;
}

/**
 * Checks if the move is invalid.
 * @param sourcePath - The source path to check.
 * @param targetDir - The target directory to check.
 * @returns `true` if the move is invalid, `false` otherwise.
 */
export function isInvalidMove(sourcePath: string, targetDir: string): boolean {
  if (sourcePath === targetDir) {
    return true;
  }
  if (sourcePath && targetDir.startsWith(`${sourcePath}/`)) {
    return true;
  }
  return parentDir(sourcePath) === targetDir;
}

/**
 * Gets the moved path of the given source path and target directory.
 * @param sourcePath - The source path to get the moved path of.
 * @param targetDir - The target directory to get the moved path of.
 * @returns The moved path of the given source path and target directory.
 */
export function movedPath(sourcePath: string, targetDir: string): string {
  const name = basename(sourcePath);
  return targetDir ? `${targetDir}/${name}` : name;
}

/**
 * Checks if the source path can be moved to the root.
 * @param sourcePath - The source path to check.
 * @returns `true` if the source path can be moved to the root, `false` otherwise.
 */
export function canMoveToRoot(sourcePath: string): boolean {
  return sourcePath.includes("/") && !isInvalidMove(sourcePath, "");
}
