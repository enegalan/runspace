import { useEffect, useState } from "react";
import {
  DROP_TARGET_ATTR,
  hasExternalFileDrag,
  importDroppedExternalFiles,
} from "../../core/workspace/externalFileDrop";
import {
  clearFileTreeDropTarget,
  updateFileTreeDropTargetFromDrag,
} from "../../core/workspace/fileTreeDropTarget";
import {
  canMoveToRoot,
  clearFileDragData,
  getActiveDragPayload,
  hasFileDrag,
  readFileDragData,
  setFileTreeDragActive,
} from "../../core/workspace/fileTreeDrag";
import { useFileTreeDragActive } from "../../hooks/useFileTreeDragActive";
import { useFileTreeDropTarget } from "../../hooks/useFileTreeDropTarget";
import { workspaceEntryExists } from "../../core/workspace/workspaceEntryExists";
import { useDialogStore } from "../../stores/dialogStore";
import { useNewFile } from "../../hooks/useNewFile";
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

export function FileTree() {
  const workspace = useWorkspaceStore((state) => state.workspace);
  const workspaceId = workspace?.id ?? "";
  const rootFiles = useWorkspaceStore((state) => state.rootFiles);
  const refreshFiles = useWorkspaceStore((state) => state.refreshFiles);
  const moveFile = useWorkspaceStore((state) => state.moveFile);
  const createFolder = useWorkspaceStore((state) => state.createFolder);
  const { createAndOpenFile } = useNewFile();
  const askPrompt = useDialogStore((state) => state.askPrompt);

  const [sidebarMenu, setSidebarMenu] = useState<SidebarMenuState | null>(null);
  const [environmentPickerOpen, setEnvironmentPickerOpen] = useState(false);
  const dropTargetPath = useFileTreeDropTarget();
  const rootDropTarget = dropTargetPath === "";
  const isDragging = useFileTreeDragActive();

  useEffect(() => {
    const onDragEnd = () => {
      setFileTreeDragActive(false);
      clearFileTreeDropTarget();
    };
    window.addEventListener("dragend", onDragEnd);
    return () => {
      window.removeEventListener("dragend", onDragEnd);
    };
  }, []);

  const handleTreeDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    if (
      hasExternalFileDrag(event.dataTransfer) ||
      hasFileDrag(event.dataTransfer.types)
    ) {
      setFileTreeDragActive(true);
    }
  };

  const isDirectBodyTarget = (event: React.DragEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    return (
      target === event.currentTarget ||
      target.classList.contains("file-tree__empty")
    );
  };

  const handleBodyDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    if (!isDirectBodyTarget(event) || !workspace) {
      return;
    }

    if (hasExternalFileDrag(event.dataTransfer)) {
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
      return;
    }

    if (!hasFileDrag(event.dataTransfer.types)) {
      return;
    }
    const payload = getActiveDragPayload();
    if (!payload || !canMoveToRoot(payload.path)) {
      return;
    }
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const handleTreeDragOverCapture = (event: React.DragEvent<HTMLDivElement>) => {
    if (!workspace) {
      return;
    }
    updateFileTreeDropTargetFromDrag(event);
  };

  const handleTreeDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      clearFileTreeDropTarget();
    }
  };

  const handleBodyDrop = (event: React.DragEvent<HTMLDivElement>) => {
    if (!isDirectBodyTarget(event)) {
      return;
    }
    event.preventDefault();
    clearFileTreeDropTarget();

    if (hasExternalFileDrag(event.dataTransfer)) {
      void importDroppedExternalFiles(event.dataTransfer, "");
      return;
    }

    const payload = readFileDragData(event.dataTransfer);
    clearFileDragData();
    if (!payload || !canMoveToRoot(payload.path)) {
      return;
    }
    void moveFile(payload.path, "");
  };

  const openSidebarMenu = (event: React.MouseEvent) => {
    if (!workspace) {
      return;
    }
    event.preventDefault();
    setSidebarMenu({ x: event.clientX, y: event.clientY });
  };

  const handleNewFolder = async () => {
    let label = "New folder name";
    let initialValue = "";

    while (true) {
      const raw = await askPrompt(label, { initialValue });
      if (!raw) {
        return;
      }
      const trimmed = raw.trim();
      if (!trimmed) {
        label = "Folder name cannot be empty.";
        initialValue = "";
        continue;
      }
      if (await workspaceEntryExists(trimmed)) {
        label = `"${trimmed}" already exists.`;
        initialValue = trimmed;
        continue;
      }
      await createFolder(trimmed);
      return;
    }
  };

  return (
    <div
      className={`file-tree${isDragging ? " file-tree--dragging" : ""}`}
      data-testid="file-tree"
      onDragEnter={handleTreeDragEnter}
      onDragOverCapture={handleTreeDragOverCapture}
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
            onClick={() => void handleNewFolder()}
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
        className={`file-tree__body${rootDropTarget ? " file-tree__body--drop-target" : ""}`}
        {...{ [DROP_TARGET_ATTR]: "" }}
        onContextMenu={openSidebarMenu}
        onDragOver={handleBodyDragOver}
        onDrop={handleBodyDrop}
        role="presentation"
      >
        {!workspace ? (
          <p className="file-tree__empty">
            No projects yet — open the project menu and create a new project.
          </p>
        ) : rootFiles.length === 0 ? (
          <p className="file-tree__empty">
            No files yet — drag files here or right-click for actions
          </p>
        ) : (
          rootFiles.map((entry) => (
            <FileTreeItem
              key={`${workspaceId}:${entry.path}`}
              entry={entry}
              depth={0}
              workspaceId={workspaceId}
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
              onClick: () => void handleNewFolder(),
            },
          ]}
          onClose={() => setSidebarMenu(null)}
        />
      )}
    </div>
  );
}
