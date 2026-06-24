import { createListenerSet } from "../sync/listenerSet";
import { DROP_TARGET_ATTR, hasExternalFileDrag } from "./externalFileDrop";
import { canMoveToRoot, getActiveDragPayload, hasFileDrag, isInvalidMove } from "./fileTreeDrag";

let activeDropTarget: string | null = null;
const dropTargetListeners = createListenerSet();

/**
 * Gets the file tree drop target.
 * @returns The file tree drop target.
 */
export function getFileTreeDropTarget(): string | null {
  return activeDropTarget;
}

/**
 * Sets the file tree drop target.
 * @param path - The path to set the file tree drop target to.
 */
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
 * Subscribes to the file tree drop target.
 * @param listener - The listener to subscribe to.
 * @returns The function to unsubscribe from the file tree drop target.
 */
export function subscribeFileTreeDropTarget(listener: () => void): () => void {
  return dropTargetListeners.subscribe(listener);
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
  return resolveFileTreeDropTargetFromElement(document.elementFromPoint(x, y));
}

/**
 * Updates the file tree drop target from the drag event.
 * @param event - The drag event to update the file tree drop target from.
 */
export function updateFileTreeDropTargetFromDrag(event: {
  target: EventTarget | null;
  dataTransfer: DataTransfer;
}): void {
  const external = hasExternalFileDrag(event.dataTransfer);
  const internal = hasFileDrag(event.dataTransfer.types);
  if (!external && !internal) {
    return;
  }

  const target = resolveFileTreeDropTargetFromElement(
    event.target instanceof Element ? event.target : null,
  );
  if (target === null) {
    clearFileTreeDropTarget();
    return;
  }

  if (internal) {
    const payload = getActiveDragPayload();
    if (!payload) {
      clearFileTreeDropTarget();
      return;
    }
    if (target === "") {
      if (!canMoveToRoot(payload.path)) {
        clearFileTreeDropTarget();
        return;
      }
    } else if (isInvalidMove(payload.path, target)) {
      clearFileTreeDropTarget();
      return;
    }
  }

  setFileTreeDropTarget(target);
}
