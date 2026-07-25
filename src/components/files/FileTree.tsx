import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import {
  DROP_TARGET_ATTR,
  hasExternalFileDrag,
  importDroppedExternalFiles,
} from "../../core/workspace/externalFileDrop";
import {
  clearFileTreeDropTarget,
  getFileTreeDropTarget,
  setFileTreeDropTarget,
  subscribeFileTreeDropTarget,
} from "../../core/workspace/fileTreeDropTarget";
import {
  isFileTreeDragActive,
  isInvalidPaste,
  resolvePasteTarget,
  subscribeFileTreeDragActive,
} from "../../core/workspace/fileTreeDrag";
import { useFileTreeKeyboardShortcuts } from "../../hooks/useFileTreeKeyboardShortcuts";
import { useFileTreePointerMove } from "../../hooks/useFileTreePointerMove";
import { useNewFile } from "../../hooks/useNewFile";
import { useNewFolder } from "../../hooks/useNewFolder";
import { useEditorTabsStore } from "../../stores/editorTabsStore";
import { useFileClipboardStore, clipboardMatchesWorkspace } from "../../stores/fileClipboardStore";
import { useFileTreeSelectionStore } from "../../stores/fileTreeSelectionStore";
import { useWorkspaceStore } from "../../stores/workspaceStore";
import { ContextMenu } from "../ui/ContextMenu";
import { IconFilePlus, IconFolderPlus, IconRefresh } from "../ui/icons";
import { FileTreeItem } from "./FileTreeItem";
import { EnvironmentIndicator } from "../environment/EnvironmentIndicator";
import { EnvironmentPickerDialog } from "../environment/EnvironmentPickerDialog";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";

interface SidebarMenuState {
  x: number;
  y: number;
}

/**
 * This component is used to display the file tree.
 * @returns The FileTree component.
 */
export function FileTree() {
  const workspace = useWorkspaceStore((state) => state.workspace);
  const workspaceId = workspace?.id ?? "";
  const rootFiles = useWorkspaceStore((state) => state.rootFiles);
  const expandedDirs = useWorkspaceStore((state) => state.expandedDirs);
  const refreshFiles = useWorkspaceStore((state) => state.refreshFiles);
  const moveFile = useWorkspaceStore((state) => state.moveFile);
  const expandDir = useWorkspaceStore((state) => state.expandDir);
  const openFile = useEditorTabsStore((state) => state.openFile);
  const { createAndOpenFile } = useNewFile();
  const { createNewFolder } = useNewFolder();
  const clipboardEntry = useFileClipboardStore((state) => state.entry);
  const pasteIntoFolder = useFileClipboardStore((state) => state.pasteInto);
  const setSelection = useFileTreeSelectionStore((state) => state.setSelection);
  const clearSelection = useFileTreeSelectionStore((state) => state.clearSelection);
  const selection = useFileTreeSelectionStore((state) => state.selection);
  const { treeRef, focusTree } = useFileTreeKeyboardShortcuts(workspaceId, Boolean(workspace));
  const handleSelectEntry = useCallback(
    (entry: { path: string; is_directory: boolean }) => {
      setSelection({
        path: entry.path,
        workspaceId,
        isDirectory: entry.is_directory,
      });
      focusTree();
    },
    [focusTree, setSelection, workspaceId],
  );
  const { onRowPointerDown } = useFileTreePointerMove({
    moveFile,
    openFile,
    expandDir,
    expandedDirs,
    onSelect: handleSelectEntry,
  });

  useEffect(() => {
    clearSelection();
  }, [clearSelection, workspaceId]);

  const [sidebarMenu, setSidebarMenu] = useState<SidebarMenuState | null>(null);
  const [environmentPickerOpen, setEnvironmentPickerOpen] = useState(false);
  const dropTargetPath = useSyncExternalStore(
    subscribeFileTreeDropTarget,
    getFileTreeDropTarget,
    getFileTreeDropTarget,
  );
  const rootDropTarget = dropTargetPath === "";
  const isDragging = useSyncExternalStore(
    subscribeFileTreeDragActive,
    isFileTreeDragActive,
    isFileTreeDragActive,
  );
  const activeSelection = selection?.workspaceId === workspaceId ? selection : null;
  const pasteTarget = resolvePasteTarget(
    activeSelection?.path,
    activeSelection?.isDirectory ?? false,
  );

  const isDirectBodyTarget = (event: React.DragEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    return target === event.currentTarget || target.classList.contains("file-tree__empty");
  };

  const handleBodyDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    if (!isDirectBodyTarget(event) || !workspace || !hasExternalFileDrag(event.dataTransfer)) {
      return;
    }
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setFileTreeDropTarget("");
  };

  const handleBodyDrop = (event: React.DragEvent<HTMLDivElement>) => {
    if (!isDirectBodyTarget(event) || !hasExternalFileDrag(event.dataTransfer)) {
      return;
    }
    event.preventDefault();
    clearFileTreeDropTarget();
    void importDroppedExternalFiles(event.dataTransfer, "");
  };

  const handleTreeDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    const relatedTarget = event.relatedTarget;
    if (
      relatedTarget === null ||
      (relatedTarget instanceof Node && !event.currentTarget.contains(relatedTarget))
    ) {
      clearFileTreeDropTarget();
    }
  };

  const openSidebarMenu = (event: React.MouseEvent) => {
    if (!workspace) {
      return;
    }
    event.preventDefault();
    setSidebarMenu({ x: event.clientX, y: event.clientY });
  };

  return (
    <div
      className={`file-tree${isDragging ? " file-tree--dragging" : ""}`}
      data-testid="file-tree"
      onDragLeave={handleTreeDragLeave}
    >
      <EnvironmentIndicator onOpenPicker={() => setEnvironmentPickerOpen(true)} />
      <EnvironmentPickerDialog
        open={environmentPickerOpen}
        onClose={() => setEnvironmentPickerOpen(false)}
      />
      <div className="file-tree__header">
        <WorkspaceSwitcher />
        <div className="file-tree__actions">
          <button
            type="button"
            className="file-tree__action"
            onClick={() => void createAndOpenFile()}
            title="New file"
            aria-label="New file"
            disabled={!workspace}
          >
            <IconFilePlus size={18} />
          </button>
          <button
            type="button"
            className="file-tree__action"
            onClick={() => void createNewFolder()}
            title="New folder"
            aria-label="New folder"
            disabled={!workspace}
          >
            <IconFolderPlus size={18} />
          </button>
          <button
            type="button"
            className="file-tree__action"
            onClick={() => void refreshFiles()}
            title="Refresh"
            aria-label="Refresh"
            disabled={!workspace}
          >
            <IconRefresh size={18} />
          </button>
        </div>
      </div>

      <div
        ref={treeRef}
        tabIndex={workspace ? -1 : undefined}
        className={`file-tree__body${rootDropTarget ? " file-tree__body--drop-target" : ""}`}
        data-testid="file-tree-body"
        {...{ [DROP_TARGET_ATTR]: "" }}
        onContextMenu={openSidebarMenu}
        onDragOver={handleBodyDragOver}
        onDrop={handleBodyDrop}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            clearSelection();
          }
          focusTree();
        }}
        role="tree"
        aria-label="Files"
      >
        {!workspace ? (
          <p className="file-tree__empty">
            No workspaces yet — open the workspace menu and create a new workspace.
          </p>
        ) : rootFiles.length === 0 ? (
          <p className="file-tree__empty">
            No files yet — drag files or folders here or right-click for actions
          </p>
        ) : (
          rootFiles.map((entry) => (
            <FileTreeItem
              key={`${workspaceId}:${entry.path}`}
              entry={entry}
              depth={0}
              workspaceId={workspaceId}
              onRowPointerDown={onRowPointerDown}
              onSelect={handleSelectEntry}
            />
          ))
        )}
      </div>

      {sidebarMenu && (
        <ContextMenu
          x={sidebarMenu.x}
          y={sidebarMenu.y}
          items={[
            {
              id: "new-file",
              label: "New file",
              onClick: () => void createAndOpenFile(),
            },
            {
              id: "new-folder",
              label: "New folder",
              onClick: () => void createNewFolder(),
            },
            ...(clipboardEntry && clipboardMatchesWorkspace(clipboardEntry, workspaceId)
              ? [
                  {
                    id: "paste",
                    label: "Paste",
                    disabled: isInvalidPaste(clipboardEntry.path, pasteTarget, clipboardEntry.mode),
                    onClick: () => void pasteIntoFolder(pasteTarget),
                  },
                ]
              : []),
          ]}
          onClose={() => setSidebarMenu(null)}
        />
      )}
    </div>
  );
}
