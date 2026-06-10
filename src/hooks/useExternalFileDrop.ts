import { getCurrentWebview } from "@tauri-apps/api/webview";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useEffect } from "react";
import {
  pickImportedFileToOpen,
  resolveDropTargetFromPoint,
  setExternalDropHighlight,
} from "../core/workspace/externalFileDrop";
import { isTauri } from "../core/platform/isTauri";
import { useEditorTabsStore } from "../stores/editorTabsStore";
import { useWorkspaceStore } from "../stores/workspaceStore";

export function useExternalFileDrop(): void {
  useEffect(() => {
    if (!isTauri()) {
      return;
    }

    let unlisten: (() => void) | undefined;
    let cancelled = false;
    let hoverTargetDir: string | null = null;

    const setup = async () => {
      const [webview, appWindow] = await Promise.all([
        getCurrentWebview(),
        getCurrentWindow(),
      ]);
      if (cancelled) {
        return;
      }

      const scaleFactor = await appWindow.scaleFactor();
      if (cancelled) {
        return;
      }

      unlisten = await webview.onDragDropEvent((event) => {
        const workspace = useWorkspaceStore.getState().workspace;
        if (!workspace) {
          setExternalDropHighlight(null);
          hoverTargetDir = null;
          return;
        }

        if (event.payload.type === "over") {
          const logical = event.payload.position.toLogical(scaleFactor);
          const targetDir = resolveDropTargetFromPoint(logical.x, logical.y);
          if (targetDir === hoverTargetDir) {
            return;
          }
          hoverTargetDir = targetDir;
          setExternalDropHighlight(targetDir);
          return;
        }

        if (event.payload.type === "leave") {
          hoverTargetDir = null;
          setExternalDropHighlight(null);
          return;
        }

        if (event.payload.type !== "drop") {
          return;
        }

        const paths = event.payload.paths;
        const logical = event.payload.position.toLogical(scaleFactor);
        const targetDir =
          resolveDropTargetFromPoint(logical.x, logical.y) ?? hoverTargetDir ?? "";
        hoverTargetDir = null;
        setExternalDropHighlight(null);

        if (paths.length === 0) {
          return;
        }

        void (async () => {
          try {
            const imported = await useWorkspaceStore
              .getState()
              .importExternalFiles(paths, targetDir);
            const fileToOpen = pickImportedFileToOpen(imported);
            if (fileToOpen) {
              await useEditorTabsStore.getState().openFile(fileToOpen);
            }
          } catch (error) {
            console.error("Failed to import dropped files:", error);
          }
        })();
      });
    };

    void setup();

    return () => {
      cancelled = true;
      unlisten?.();
      setExternalDropHighlight(null);
    };
  }, []);
}
