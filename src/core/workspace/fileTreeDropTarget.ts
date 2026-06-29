import { createListenerSet } from "../sync/listenerSet";
import { DROP_TARGET_ATTR } from "./externalFileDrop";
import {
  canMoveToRoot,
  getActiveDragPayload,
  isInvalidMove,
  setFileTreeDragActive,
} from "./fileTreeDrag";

let activeDropTarget: string | null = null;
const dropTargetListeners = createListenerSet();
let editorDropActive = false;
const editorDropListeners = createListenerSet();

/**
 * Gets the file tree drop target.
 * @returns The file tree drop target.
 */
export function getFileTreeDropTarget(): string | null {
  return activeDropTarget;
}

/**
 * Subscribes to the file tree drop target.
 * @param listener - The listener to subscribe to.
 * @returns A function to unsubscribe from the file tree drop target.
 */
export function subscribeFileTreeDropTarget(listener: () => void): () => void {
  return dropTargetListeners.subscribe(listener);
}

export function setFileTreeDropTarget(path: string): void {
  if (activeDropTarget === path) {
    return;
  }
  activeDropTarget = path;
  dropTargetListeners.notify();
}

/**
 * Clears the file tree drop target.
 */
export function clearFileTreeDropTarget(): void {
  if (activeDropTarget === null) {
    return;
  }
  activeDropTarget = null;
  dropTargetListeners.notify();
}

/**
 * Checks if the editor drop is active.
 * @returns True if the editor drop is active, false otherwise.
 */
export function isEditorDropActive(): boolean {
  return editorDropActive;
}

/**
 * Subscribes to the editor drop active.
 * @param listener - The listener to subscribe to.
 * @returns A function to unsubscribe from the editor drop active.
 */
export function subscribeEditorDropActive(listener: () => void): () => void {
  return editorDropListeners.subscribe(listener);
}

/**
 * Sets the editor drop active.
 * @param active - True if the editor drop is active, false otherwise.
 */
export function setEditorDropActive(active: boolean): void {
  if (editorDropActive === active) {
    return;
  }
  editorDropActive = active;
  editorDropListeners.notify();
}

/**
 * Resolves the file tree drop target from the element.
 * @param element - The element to resolve the file tree drop target from.
 * @returns The file tree drop target.
 */
export function resolveFileTreeDropTargetFromElement(element: Element | null): string | null {
  const target = element?.closest(`[${DROP_TARGET_ATTR}]`);
  if (!target) {
    return null;
  }
  return target.getAttribute(DROP_TARGET_ATTR) ?? "";
}

/**
 * Resolves the file tree drop target from viewport coordinates.
 * @param x - The horizontal coordinate.
 * @param y - The vertical coordinate.
 * @returns The file tree drop target path, or null when not over a target.
 */
export function resolveDropTargetFromPoint(x: number, y: number): string | null {
  if (typeof document.elementFromPoint !== "function") {
    return null;
  }
  return resolveFileTreeDropTargetFromElement(document.elementFromPoint(x, y));
}

/**
 * Updates the native drop hover.
 * @param x - The horizontal coordinate.
 * @param y - The vertical coordinate.
 */
export function updateNativeDropHover(x: number, y: number): void {
  setFileTreeDragActive(true);

  const element =
    typeof document.elementFromPoint === "function" ? document.elementFromPoint(x, y) : null;

  if (element?.closest(".editor-area")) {
    setEditorDropActive(true);
    clearFileTreeDropTarget();
    return;
  }

  setEditorDropActive(false);
  const targetDir = resolveFileTreeDropTargetFromElement(element);
  if (targetDir === null) {
    clearFileTreeDropTarget();
    return;
  }
  setFileTreeDropTarget(targetDir);
}

/**
 * Clears the native drop hover.
 */
export function clearNativeDropHover(): void {
  setFileTreeDragActive(false);
  clearFileTreeDropTarget();
  setEditorDropActive(false);
}

/**
 * Resolves the pointer move target.
 * @param clientX - The horizontal coordinate.
 * @param clientY - The vertical coordinate.
 * @returns The pointer move target, or null when not over a target.
 */
export function resolvePointerMoveTarget(clientX: number, clientY: number): string | null {
  const element =
    typeof document.elementFromPoint === "function"
      ? document.elementFromPoint(clientX, clientY)
      : null;

  if (element?.closest(".editor-area")) {
    return null;
  }

  const targetDir = resolveFileTreeDropTargetFromElement(element);
  if (targetDir === null) {
    return null;
  }

  const payload = getActiveDragPayload();
  if (!payload) {
    return null;
  }
  if (targetDir === "") {
    return canMoveToRoot(payload.path) ? targetDir : null;
  }
  return isInvalidMove(payload.path, targetDir) ? null : targetDir;
}
