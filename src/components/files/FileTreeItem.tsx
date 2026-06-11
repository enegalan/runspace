import { useCallback, useEffect, useState } from "react";
import { IconChevronDown, IconChevronRight } from "../ui/icons";
import { FileIcon } from "./FileIcon";
import type { FileEntry } from "../../core/types/workspace";
import {
  DROP_TARGET_ATTR,
  hasExternalFileDrag,
  importDroppedExternalFiles,
} from "../../core/workspace/externalFileDrop";
import {
  clearFileDragData,
  getActiveDragPayload,
  hasFileDrag,
  isInvalidMove,
  parentDir,
  readFileDragData,
  setFileDragData,
  siblingPath,
} from "../../core/workspace/fileTreeDrag";
import { ContextMenu } from "../ui/ContextMenu";
import { workspaceEntryExists } from "../../core/workspace/workspaceEntryExists";
import { useDialogStore } from "../../stores/dialogStore";
import { useEditorTabsStore } from "../../stores/editorTabsStore";
import { useWorkspaceStore } from "../../stores/workspaceStore";

interface FileTreeItemProps {
  entry: FileEntry;
  depth: number;
  workspaceId: string;
}

interface MenuState {
  x: number;
  y: number;
}

export function FileTreeItem({ entry, depth, workspaceId }: FileTreeItemProps) {
  const expandedDirs = useWorkspaceStore((state) => state.expandedDirs);
  const filesRevision = useWorkspaceStore((state) => state.filesRevision);
  const toggleDir = useWorkspaceStore((state) => state.toggleDir);
  const listDirectory = useWorkspaceStore((state) => state.listDirectory);
  const deleteFile = useWorkspaceStore((state) => state.deleteFile);
  const renameFile = useWorkspaceStore((state) => state.renameFile);
  const moveFile = useWorkspaceStore((state) => state.moveFile);
  const openFile = useEditorTabsStore((state) => state.openFile);
  const renameOpenFile = useEditorTabsStore((state) => state.renameOpenFile);
  const removeOpenFile = useEditorTabsStore((state) => state.removeOpenFile);
  const askConfirm = useDialogStore((state) => state.askConfirm);

  const [children, setChildren] = useState<FileEntry[]>([]);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(entry.name);
  const [menu, setMenu] = useState<MenuState | null>(null);
  const [dropTarget, setDropTarget] = useState(false);

  const expanded = expandedDirs.has(entry.path);

  const loadChildren = useCallback(async () => {
    const files = await listDirectory(entry.path);
    setChildren(files);
  }, [entry.path, listDirectory]);

  useEffect(() => {
    setChildren([]);
    setRenaming(false);
    setRenameValue(entry.name);
    setDropTarget(false);
  }, [workspaceId, entry.path, entry.name]);

  useEffect(() => {
    if (entry.is_directory && expanded) {
      void loadChildren();
    }
  }, [entry.is_directory, expanded, loadChildren, filesRevision]);

  const handleOpen = () => {
    if (entry.is_directory) {
      toggleDir(entry.path);
      return;
    }
    void openFile(entry.path);
  };

  const handleDragStart = (event: React.DragEvent) => {
    setFileDragData(event.dataTransfer, {
      path: entry.path,
      isDirectory: entry.is_directory,
    });
  };

  const handleDragEnd = () => {
    clearFileDragData();
    setDropTarget(false);
  };

  const handleDragOver = (event: React.DragEvent) => {
    if (hasExternalFileDrag(event.dataTransfer)) {
      if (!entry.is_directory) {
        event.stopPropagation();
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      event.dataTransfer.dropEffect = "copy";
      setDropTarget(true);
      return;
    }

    if (!hasFileDrag(event.dataTransfer.types)) {
      return;
    }
    const payload = getActiveDragPayload();
    if (!payload) {
      return;
    }

    if (!entry.is_directory) {
      event.stopPropagation();
      return;
    }

    if (isInvalidMove(payload.path, entry.path)) {
      event.stopPropagation();
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "move";
    setDropTarget(true);
  };

  const handleDragLeave = () => {
    setDropTarget(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDropTarget(false);

    if (hasExternalFileDrag(event.dataTransfer)) {
      if (!entry.is_directory) {
        return;
      }
      void importDroppedExternalFiles(event.dataTransfer, entry.path);
      return;
    }

    const payload = readFileDragData(event.dataTransfer);
    clearFileDragData();
    if (!payload || !entry.is_directory || isInvalidMove(payload.path, entry.path)) {
      return;
    }

    void moveFile(payload.path, entry.path);
  };

  const handleRename = async () => {
    const trimmed = renameValue.trim();
    if (!trimmed || trimmed === entry.name) {
      setRenaming(false);
      setRenameValue(entry.name);
      return;
    }

    const newPath = siblingPath(parentDir(entry.path), trimmed);
    if (await workspaceEntryExists(newPath)) {
      setRenameValue(entry.name);
      setRenaming(false);
      return;
    }

    await renameFile(entry.path, newPath);
    renameOpenFile(entry.path, newPath);
    setRenaming(false);
  };

  const handleDelete = async () => {
    const label = entry.is_directory ? "folder" : "file";
    const confirmed = await askConfirm(`Delete ${label} "${entry.name}"?`, {
      confirmLabel: "Delete",
      danger: true,
    });
    if (!confirmed) {
      return;
    }
    removeOpenFile(entry.path);
    await deleteFile(entry.path);
  };

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setMenu({ x: event.clientX, y: event.clientY });
  };

  const buildContextMenuItems = () => {
    const items = [];

    if (!entry.is_directory) {
      items.push({
        id: "open",
        label: "Open",
        onClick: () => void openFile(entry.path),
      });
    } else {
      items.push({
        id: "expand",
        label: expanded ? "Collapse" : "Expand",
        onClick: () => toggleDir(entry.path),
      });
    }

    items.push({
      id: "rename",
      label: "Rename",
      onClick: () => {
        setRenameValue(entry.name);
        setRenaming(true);
      },
    });

    items.push({
      id: "delete",
      label: "Delete",
      danger: true,
      onClick: () => void handleDelete(),
    });

    return items;
  };

  return (
    <div className="file-tree__branch" onClick={(event) => event.stopPropagation()}>
      <div
        className={`file-tree__row${expanded ? " file-tree__row--expanded" : ""}${
          dropTarget ? " file-tree__row--drop-target" : ""
        }`}
        style={{ paddingLeft: `${8 + depth * 14}px` }}
        {...(entry.is_directory ? { [DROP_TARGET_ATTR]: entry.path } : {})}
        onContextMenu={handleContextMenu}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {entry.is_directory ? (
          <button
            type="button"
            className="file-tree__chevron"
            onClick={() => toggleDir(entry.path)}
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
          </button>
        ) : (
          <span className="file-tree__chevron file-tree__chevron--spacer" />
        )}

        {renaming ? (
          <input
            className="file-tree__rename-input"
            value={renameValue}
            autoFocus
            onChange={(event) => setRenameValue(event.target.value)}
            onBlur={() => void handleRename()}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                void handleRename();
              }
              if (event.key === "Escape") {
                setRenaming(false);
                setRenameValue(entry.name);
              }
            }}
          />
        ) : (
          <button
            type="button"
            className="file-tree__label"
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onClick={handleOpen}
            title={entry.path}
          >
            <FileIcon path={entry.path} isDirectory={entry.is_directory} />
            <span className="file-tree__name">{entry.name}</span>
          </button>
        )}
      </div>

      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          items={buildContextMenuItems()}
          onClose={() => setMenu(null)}
        />
      )}

      {entry.is_directory && expanded && (
        <div className="file-tree__children">
          {children.map((child) => (
            <FileTreeItem
              key={`${workspaceId}:${child.path}`}
              entry={child}
              depth={depth + 1}
              workspaceId={workspaceId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
