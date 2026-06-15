import { useSyncExternalStore } from "react";
import {
  isFileTreeDragActive,
  subscribeFileTreeDragActive,
} from "../core/workspace/fileTreeDrag";

export function useFileTreeDragActive(): boolean {
  return useSyncExternalStore(
    subscribeFileTreeDragActive,
    isFileTreeDragActive,
    isFileTreeDragActive,
  );
}
