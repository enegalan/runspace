import { useSyncExternalStore } from "react";
import {
  getFileTreeDropTarget,
  subscribeFileTreeDropTarget,
} from "../core/workspace/fileTreeDropTarget";

export function useFileTreeDropTarget(): string | null {
  return useSyncExternalStore(
    subscribeFileTreeDropTarget,
    getFileTreeDropTarget,
    getFileTreeDropTarget,
  );
}
