import {
  DROP_TARGET_ATTR,
  hasExternalFileDrag,
} from "./externalFileDrop";
import {
  canMoveToRoot,
  getActiveDragPayload,
  hasFileDrag,
  isInvalidMove,
} from "./fileTreeDrag";

type Listener = () => void;

let activeDropTarget: string | null = null;
const listeners = new Set<Listener>();

function notify(): void {
  for (const listener of listeners) {
    listener();
  }
}

export function getFileTreeDropTarget(): string | null {
  return activeDropTarget;
}

export function setFileTreeDropTarget(path: string): void {
  if (activeDropTarget === path) {
    return;
  }
  activeDropTarget = path;
  notify();
}

export function clearFileTreeDropTarget(): void {
  if (activeDropTarget === null) {
    return;
  }
  activeDropTarget = null;
  notify();
}

export function subscribeFileTreeDropTarget(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function resolveFileTreeDropTargetFromElement(
  element: Element | null,
): string | null {
  const target = element?.closest(`[${DROP_TARGET_ATTR}]`);
  if (!target) {
    return null;
  }
  return target.getAttribute(DROP_TARGET_ATTR) ?? "";
}

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
