import { useCallback, useEffect, useRef, useState } from "react";
import { useFileTreeDropTarget } from "../../hooks/useFileTreeDropTarget";
import { IconChevronDown, IconChevronRight } from "../ui/icons";
import { FileIcon } from "./FileIcon";
import type { FileEntry } from "../../core/types/workspace";
import {
  DROP_TARGET_ATTR,
  hasExternalFileDrag,
  importDroppedExternalFiles,
} from "../../core/workspace/externalFileDrop";
import {
  clearFileTreeDropTarget,
  setFileTreeDropTarget,
} from "../../core/workspace/fileTreeDropTarget";
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
  const autoExpandTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropTargetPath = useFileTreeDropTarget();

  const expanded = expandedDirs.has(entry.path);
  const isDropTarget = entry.is_directory && dropTargetPath === entry.path;

  const clearAutoExpandTimer = useCallback(() => {
    if (autoExpandTimerRef.current !== null) {
      clearTimeout(autoExpandTimerRef.current);
      autoExpandTimerRef.current = null;
    }
  }, []);

  const scheduleAutoExpand = useCallback(() => {
    if (! entry.is_directory || expanded || autoExpandTimerRef.current !== null) {
      return;
    }
    autoExpandTimerRef.current = setTimeout(() => {
      autoExpandTimerRef.current = null;
      toggleDir(entry.path);
    }, 400);
  }, [entry.is_directory, entry.path, expanded, toggleDir]);

  const loadChildren = useCallback(async () => {
    const files = await listDirectory(entry.path);
    setChildren(files);
  }, [entry.path, listDirectory]);

  useEffect(() => {
    setChildren([]);
    setRenaming(false);
    setRenameValue(entry.name);
    clearAutoExpandTimer();
  }, [workspaceId, entry.path, entry.name, clearAutoExpandTimer]);

  useEffect(() => () => clearAutoExpandTimer(), [clearAutoExpandTimer]);

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
    if ((event.target as HTMLElement).closest(".file-tree__chevron")) {
      event.preventDefault();
      return;
    }
    setFileDragData(event.dataTransfer, {
      path: entry.path,
      isDirectory: entry.is_directory,
    });
  };

  const handleDragEnd = () => {
    clearFileDragData();
    clearAutoExpandTimer();
    clearFileTreeDropTarget();
  };

  const handleFolderDragOver = (event: React.DragEvent, options: { fromRow?: boolean } = {}) => {
    const external = hasExternalFileDrag(event.dataTransfer);
    const internal = hasFileDrag(event.dataTransfer.types);

    if (! external && ! internal) {
      return;
    }

    if (internal) {
      const payload = getActiveDragPayload();
      if (! payload || isInvalidMove(payload.path, entry.path)) {
        event.stopPropagation();
        return;
      }
    }

    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = external ? "copy" : "move";
    setFileTreeDropTarget(entry.path);

    if (options.fromRow || ! expanded) {
      scheduleAutoExpand();
    }
  };

  const handleFolderDragLeave = (event: React.DragEvent) => {
    if (! event.currentTarget.contains(event.relatedTarget as Node | null)) {
      clearAutoExpandTimer();
    }
  };

  const handleFolderDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    clearAutoExpandTimer();
    clearFileTreeDropTarget();

    if (hasExternalFileDrag(event.dataTransfer)) {
      void importDroppedExternalFiles(event.dataTransfer, entry.path);
      return;
    }

    const payload = readFileDragData(event.dataTransfer);
    clearFileDragData();
    if (! payload || isInvalidMove(payload.path, entry.path)) {
      return;
    }

    void moveFile(payload.path, entry.path);
  };

  const handleFileDragOver = (event: React.DragEvent) => {
    if (hasExternalFileDrag(event.dataTransfer)) {
      return;
    }
    if (! hasFileDrag(event.dataTransfer.types)) {
      return;
    }

    const containingFolder = (event.currentTarget as HTMLElement).closest(`[${DROP_TARGET_ATTR}]`);
    if (! containingFolder) {
      event.stopPropagation();
      return;
    }

    const payload = getActiveDragPayload();
    const targetDir = containingFolder.getAttribute(DROP_TARGET_ATTR) ?? "";
    if (! payload || isInvalidMove(payload.path, targetDir)) {
      event.stopPropagation();
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const handleRename = async () => {
    const trimmed = renameValue.trim();
    if (! trimmed || trimmed === entry.name) {
      setRenaming(false);
      setRenameValue(entry.name);
      return;
    }

    const newPath = siblingPath(parentDir(entry.path), trimmed);
    if (await workspaceEntryExists(workspaceId, newPath)) {
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
    if (! confirmed) {
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

    if (! entry.is_directory) {
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

  const row = (
    <div
      className={`file-tree__row${expanded ? " file-tree__row--expanded" : ""}`}
      style={{ paddingLeft: `${8 + depth * 14}px` }}
      draggable={! renaming}
      onContextMenu={handleContextMenu}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={
        entry.is_directory
          ? (event) => handleFolderDragOver(event, { fromRow: true })
          : handleFileDragOver
      }
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
        <button type="button" className="file-tree__label" onClick={handleOpen} title={entry.path}>
          <FileIcon path={entry.path} isDirectory={entry.is_directory} isExpanded={expanded} />
          <span className="file-tree__name">{entry.name}</span>
        </button>
      )}
    </div>
  );

  return (
    <div className="file-tree__branch" onClick={(event) => event.stopPropagation()}>
      {entry.is_directory ? (
        <div
          className={`file-tree__folder${isDropTarget ? " file-tree__folder--drop-target" : ""}`}
          {...{ [DROP_TARGET_ATTR]: entry.path }}
          onDragOver={(event) => handleFolderDragOver(event)}
          onDragLeave={handleFolderDragLeave}
          onDrop={handleFolderDrop}
        >
          {row}
          {expanded && (
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
      ) : (
        row
      )}

      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          items={buildContextMenuItems()}
          onClose={() => setMenu(null)}
        />
      )}
    </div>
  );
}
