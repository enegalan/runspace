import { useCallback, useEffect, useRef } from "react";
import { isInvalidPaste, resolvePasteTarget } from "../core/workspace/fileTreeDrag";
import { useFileClipboardStore, clipboardMatchesWorkspace } from "../stores/fileClipboardStore";
import { useFileTreeSelectionStore } from "../stores/fileTreeSelectionStore";

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
}

/**
 * Handles keyboard copy, cut, and paste for the file tree.
 * @param workspaceId - The active workspace ID.
 * @param enabled - Whether shortcuts should be active.
 */
export function useFileTreeKeyboardShortcuts(workspaceId: string, enabled: boolean) {
  const treeRef = useRef<HTMLDivElement>(null);
  const selection = useFileTreeSelectionStore((state) => state.selection);
  const clipboardEntry = useFileClipboardStore((state) => state.entry);
  const cutToClipboard = useFileClipboardStore((state) => state.cut);
  const copyToClipboard = useFileClipboardStore((state) => state.copy);
  const pasteIntoFolder = useFileClipboardStore((state) => state.pasteInto);

  const focusTree = useCallback(() => {
    treeRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!enabled || !workspaceId) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (!treeRef.current || isEditableTarget(event.target)) {
        return;
      }

      const treeFocused = treeRef.current.contains(document.activeElement);
      if (!treeFocused) {
        return;
      }

      const mod = event.metaKey || event.ctrlKey;
      if (!mod) {
        return;
      }

      const key = event.key.toLowerCase();
      const activeSelection =
        selection?.workspaceId === workspaceId ? selection : null;
      const activeClipboard = clipboardMatchesWorkspace(clipboardEntry, workspaceId)
        ? clipboardEntry
        : null;

      if (key === "c" && activeSelection) {
        event.preventDefault();
        copyToClipboard(activeSelection.path, workspaceId);
        return;
      }

      if (key === "x" && activeSelection) {
        event.preventDefault();
        cutToClipboard(activeSelection.path, workspaceId);
        return;
      }

      if (key === "v" && activeClipboard) {
        const targetDir = resolvePasteTarget(activeSelection?.path, activeSelection?.isDirectory ?? false);
        if (isInvalidPaste(activeClipboard.path, targetDir, activeClipboard.mode)) {
          return;
        }
        event.preventDefault();
        void pasteIntoFolder(targetDir);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [
    clipboardEntry,
    copyToClipboard,
    cutToClipboard,
    enabled,
    pasteIntoFolder,
    selection,
    workspaceId,
  ]);

  return { treeRef, focusTree };
}
