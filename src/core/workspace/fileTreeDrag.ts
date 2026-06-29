import { createListenerSet } from "../sync/listenerSet";
import { basename } from "../path/basename";

interface FileTreeDragPayload {
  path: string;
  isDirectory: boolean;
}

export interface FileTreeDragPreviewState {
  label: string;
  path: string;
  isDirectory: boolean;
  x: number;
  y: number;
}

let activeDragPayload: FileTreeDragPayload | null = null;
let fileTreeDragActive = false;
const dragActiveListeners = createListenerSet();

let preview: FileTreeDragPreviewState | null = null;
const previewListeners = createListenerSet();

/**
 * Checks if the file tree is dragging.
 * @returns `true` if the file tree is dragging, `false` otherwise.
 */
export function isFileTreeDragActive(): boolean {
  return fileTreeDragActive;
}

/**
 * Sets the file tree drag active.
 * @param active - The active state to set.
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
 * @returns The function to unsubscribe from the listener.
 */
export function subscribeFileTreeDragActive(listener: () => void): () => void {
  return dragActiveListeners.subscribe(listener);
}

/**
 * Sets the active file tree move.
 * @param payload - The payload to set.
 */
export function setActiveFileTreeMove(payload: FileTreeDragPayload): void {
  activeDragPayload = payload;
  setFileTreeDragActive(true);
}

/**
 * Clears the file tree drag data.
 */
export function clearFileDragData(): void {
  activeDragPayload = null;
  setFileTreeDragActive(false);
  clearFileTreeDragPreview();
}

/**
 * Gets the active drag payload.
 * @returns The active drag payload.
 */
export function getActiveDragPayload(): FileTreeDragPayload | null {
  return activeDragPayload;
}

/**
 * Gets the file tree drag preview.
 * @returns The file tree drag preview.
 */
export function getFileTreeDragPreview(): FileTreeDragPreviewState | null {
  return preview;
}

/**
 * Subscribes to the file tree drag preview.
 * @param listener - The listener to subscribe to.
 * @returns The function to unsubscribe from the listener.
 */
export function subscribeFileTreeDragPreview(listener: () => void): () => void {
  return previewListeners.subscribe(listener);
}

/**
 * Sets the file tree drag preview.
 * @param state - The state to set.
 */
export function setFileTreeDragPreview(
  state: Pick<FileTreeDragPreviewState, "label" | "path" | "isDirectory" | "x" | "y">,
): void {
  preview = state;
  previewListeners.notify();
}

/**
 * Updates the file tree drag preview position.
 * @param x - The x position to update.
 * @param y - The y position to update.
 */
export function updateFileTreeDragPreviewPosition(x: number, y: number): void {
  if (!preview || (preview.x === x && preview.y === y)) {
    return;
  }
  preview = { ...preview, x, y };
  previewListeners.notify();
}

/**
 * Clears the file tree drag preview.
 */
export function clearFileTreeDragPreview(): void {
  if (preview === null) {
    return;
  }
  preview = null;
  previewListeners.notify();
}

/**
 * Gets the parent directory of a source path.
 * @param sourcePath - The source path to get the parent directory of.
 * @returns The parent directory of the source path.
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
