import { useState } from "react";
import {
  canMoveToRoot,
  clearFileDragData,
  getActiveDragPayload,
  hasFileDrag,
  readFileDragData,
} from "../../core/workspace/fileTreeDrag";
import { workspaceEntryExists } from "../../core/workspace/workspaceEntryExists";
import { useDialogStore } from "../../stores/dialogStore";
import { useNewFile } from "../../hooks/useNewFile";
import { useWorkspaceStore } from "../../stores/workspaceStore";
import { ContextMenu } from "../ui/ContextMenu";
import { FileTreeItem } from "./FileTreeItem";
import { EnvironmentIndicator } from "../environment/EnvironmentIndicator";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";

interface SidebarMenuState {
  x: number;
  y: number;
}

export function FileTree() {
  const workspaceId = useWorkspaceStore((state) => state.workspace?.id ?? "");
  const rootFiles = useWorkspaceStore((state) => state.rootFiles);
  const refreshFiles = useWorkspaceStore((state) => state.refreshFiles);
  const moveFile = useWorkspaceStore((state) => state.moveFile);
  const createFolder = useWorkspaceStore((state) => state.createFolder);
  const { createAndOpenFile } = useNewFile();
  const askPrompt = useDialogStore((state) => state.askPrompt);

  const [sidebarMenu, setSidebarMenu] = useState<SidebarMenuState | null>(null);
  const [rootDropTarget, setRootDropTarget] = useState(false);

  const isDirectBodyTarget = (event: React.DragEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    return (
      target === event.currentTarget ||
      target.classList.contains("file-tree__empty")
    );
  };

  const handleBodyDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    if (!isDirectBodyTarget(event) || !hasFileDrag(event.dataTransfer.types)) {
      return;
    }
    const payload = getActiveDragPayload();
    if (!payload || !canMoveToRoot(payload.path)) {
      return;
    }
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setRootDropTarget(true);
  };

  const handleBodyDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setRootDropTarget(false);
    }
  };

  const handleBodyDrop = (event: React.DragEvent<HTMLDivElement>) => {
    if (!isDirectBodyTarget(event)) {
      return;
    }
    event.preventDefault();
    setRootDropTarget(false);
    const payload = readFileDragData(event.dataTransfer);
    clearFileDragData();
    if (!payload || !canMoveToRoot(payload.path)) {
      return;
    }
    void moveFile(payload.path, "");
  };

  const openSidebarMenu = (event: React.MouseEvent) => {
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
    <div className="file-tree" data-testid="file-tree">
      <EnvironmentIndicator />
      <div className="file-tree__header">
        <WorkspaceSwitcher />
        <div className="file-tree__actions">
          <button
            type="button"
            className="file-tree__action"
            onClick={() => void createAndOpenFile()}
            title="New file"
            aria-label="New file"
          >
            +
          </button>
          <button
            type="button"
            className="file-tree__action"
            onClick={() => void handleNewFolder()}
            title="New folder"
            aria-label="New folder"
          >
            📁
          </button>
          <button
            type="button"
            className="file-tree__action"
            onClick={() => void refreshFiles()}
            title="Refresh"
            aria-label="Refresh"
          >
            ↻
          </button>
        </div>
      </div>

      <div
        className={`file-tree__body${rootDropTarget ? " file-tree__body--drop-target" : ""}`}
        onContextMenu={openSidebarMenu}
        onDragOver={handleBodyDragOver}
        onDragLeave={handleBodyDragLeave}
        onDrop={handleBodyDrop}
        role="presentation"
      >
        {rootFiles.length === 0 ? (
          <p className="file-tree__empty">No files yet — right-click for actions</p>
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
