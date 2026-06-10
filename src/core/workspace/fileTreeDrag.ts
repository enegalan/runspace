export const FILE_TREE_DRAG_TYPE = "application/x-runspace-file-path";

export interface FileTreeDragPayload {
  path: string;
  isDirectory: boolean;
}

let activeDragPayload: FileTreeDragPayload | null = null;

export function setFileDragData(
  dataTransfer: DataTransfer,
  payload: FileTreeDragPayload,
): void {
  activeDragPayload = payload;
  dataTransfer.setData(FILE_TREE_DRAG_TYPE, JSON.stringify(payload));
  dataTransfer.setData("text/plain", payload.path);
  dataTransfer.effectAllowed = payload.isDirectory ? "move" : "all";
}

export function clearFileDragData(): void {
  activeDragPayload = null;
}

export function getActiveDragPayload(): FileTreeDragPayload | null {
  return activeDragPayload;
}

export function hasFileDrag(types: DataTransfer["types"]): boolean {
  return Array.from(types).includes(FILE_TREE_DRAG_TYPE);
}

export function readFileDragData(
  dataTransfer: DataTransfer,
): FileTreeDragPayload | null {
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

export function parentDir(sourcePath: string): string {
  return sourcePath.includes("/")
    ? sourcePath.slice(0, sourcePath.lastIndexOf("/"))
    : "";
}

export function siblingPath(parentPath: string, name: string): string {
  return parentPath ? `${parentPath}/${name}` : name;
}

export function isInvalidMove(sourcePath: string, targetDir: string): boolean {
  if (sourcePath === targetDir) {
    return true;
  }
  if (targetDir && sourcePath.startsWith(`${targetDir}/`)) {
    return true;
  }
  return parentDir(sourcePath) === targetDir;
}

export function movedPath(sourcePath: string, targetDir: string): string {
  const name = sourcePath.split("/").pop() ?? sourcePath;
  return targetDir ? `${targetDir}/${name}` : name;
}

export function canMoveToRoot(sourcePath: string): boolean {
  return sourcePath.includes("/") && !isInvalidMove(sourcePath, "");
}
