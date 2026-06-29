import {
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
  type DragEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";
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
  getFileTreeDropTarget,
  setFileTreeDropTarget,
  subscribeFileTreeDropTarget,
} from "../../core/workspace/fileTreeDropTarget";
import {
  getActiveDragPayload,
  parentDir,
  siblingPath,
  subscribeFileTreeDragActive,
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
  onRowPointerDown: (entry: FileEntry, event: PointerEvent<HTMLDivElement>) => void;
}

interface MenuState {
  x: number;
  y: number;
}

/**
 * The FileTreeItem component.
 * @param entry - The file entry.
 * @param depth - The depth of the file entry.
 * @param workspaceId - The ID of the workspace.
 * @param onRowPointerDown - Pointer handler to start an internal move drag.
 * @returns The FileTreeItem component.
 */
export function FileTreeItem({ entry, depth, workspaceId, onRowPointerDown }: FileTreeItemProps) {
  const expandedDirs = useWorkspaceStore((state) => state.expandedDirs);
  const filesRevision = useWorkspaceStore((state) => state.filesRevision);
  const toggleDir = useWorkspaceStore((state) => state.toggleDir);
  const listDirectory = useWorkspaceStore((state) => state.listDirectory);
  const deleteFile = useWorkspaceStore((state) => state.deleteFile);
  const renameFile = useWorkspaceStore((state) => state.renameFile);
  const openFile = useEditorTabsStore((state) => state.openFile);
  const renameOpenFile = useEditorTabsStore((state) => state.renameOpenFile);
  const removeOpenFile = useEditorTabsStore((state) => state.removeOpenFile);
  const askConfirm = useDialogStore((state) => state.askConfirm);

  const [children, setChildren] = useState<FileEntry[]>([]);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(entry.name);
  const [menu, setMenu] = useState<MenuState | null>(null);
  const dropTargetPath = useSyncExternalStore(
    subscribeFileTreeDropTarget,
    getFileTreeDropTarget,
    getFileTreeDropTarget,
  );
  const dragSourcePath = useSyncExternalStore(
    subscribeFileTreeDragActive,
    () => getActiveDragPayload()?.path ?? null,
    () => getActiveDragPayload()?.path ?? null,
  );

  const expanded = expandedDirs.has(entry.path);
  const isDropTarget = entry.is_directory && dropTargetPath === entry.path;
  const isDragSource = dragSourcePath === entry.path;

  const loadChildren = useCallback(async () => {
    const files = await listDirectory(entry.path);
    setChildren(files);
  }, [entry.path, listDirectory]);

  useEffect(() => {
    setChildren([]);
    setRenaming(false);
    setRenameValue(entry.name);
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

  const handleFolderDragOver = (event: DragEvent) => {
    if (!hasExternalFileDrag(event.dataTransfer)) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "copy";
    setFileTreeDropTarget(entry.path);
  };

  const handleFolderDrop = (event: DragEvent) => {
    if (!hasExternalFileDrag(event.dataTransfer)) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    clearFileTreeDropTarget();
    void importDroppedExternalFiles(event.dataTransfer, entry.path);
  };

  const handleRename = async () => {
    const trimmed = renameValue.trim();
    if (!trimmed || trimmed === entry.name) {
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
    if (!confirmed) {
      return;
    }
    removeOpenFile(entry.path);
    await deleteFile(entry.path);
  };

  const handleContextMenu = (event: MouseEvent) => {
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

  const row = (
    <div
      className={`file-tree__row${expanded ? " file-tree__row--expanded" : ""}${isDragSource ? " file-tree__row--drag-source file-tree__row--moving" : ""}`}
      style={{ paddingLeft: `${8 + depth * 14}px` }}
      onContextMenu={handleContextMenu}
      onPointerDown={renaming ? undefined : (event) => onRowPointerDown(entry, event)}
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
          onDragOver={handleFolderDragOver}
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
                  onRowPointerDown={onRowPointerDown}
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
