import { useCallback, useRef, useState } from "react";
import { useNewFile } from "../../hooks/useNewFile";
import { useTabDragReorder } from "../../hooks/useTabDragReorder";
import { useEditorTabsStore } from "../../stores/editorTabsStore";
import { useWorkspaceStore } from "../../stores/workspaceStore";
import { FileIcon } from "../files/FileIcon";
import { ContextMenu, type ContextMenuItem } from "../ui/ContextMenu";
import { IconClose, IconDot, IconPlus } from "../ui/icons";

function tabLabel(path: string): string {
  const parts = path.split("/");
  return parts[parts.length - 1] ?? path;
}

interface EditorTabsProps {
  inTitlebar?: boolean;
}

export function EditorTabs({ inTitlebar = false }: EditorTabsProps) {
  const hasWorkspace = useWorkspaceStore((state) => state.workspace !== null);
  const openFiles = useEditorTabsStore((state) => state.openFiles);
  const activePath = useEditorTabsStore((state) => state.activePath);
  const setActive = useEditorTabsStore((state) => state.setActive);
  const reorderTabs = useEditorTabsStore((state) => state.reorderTabs);
  const closeFile = useEditorTabsStore((state) => state.closeFile);
  const closeOthers = useEditorTabsStore((state) => state.closeOthers);
  const closeRight = useEditorTabsStore((state) => state.closeRight);
  const closeAll = useEditorTabsStore((state) => state.closeAll);
  const { createAndOpenFile } = useNewFile();
  const listRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    path: string;
    index: number;
  } | null>(null);

  const handleReorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      reorderTabs(fromIndex, toIndex);
    },
    [reorderTabs],
  );

  const { dragState, onTabPointerDown, shouldSuppressClick } = useTabDragReorder({
    listRef,
    tabCount: openFiles.length,
    onReorder: handleReorder,
  });

  const handleWheel = (event: React.WheelEvent) => {
    if (!listRef.current) {
      return;
    }
    if (event.deltaY !== 0) {
      listRef.current.scrollLeft += event.deltaY;
    }
  };

  const handleContextMenu = (
    event: React.MouseEvent,
    path: string,
    index: number,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({ x: event.clientX, y: event.clientY, path, index });
  };

  const buildContextMenuItems = (): ContextMenuItem[] => {
    if (!contextMenu) {
      return [];
    }
    const { path, index } = contextMenu;
    const hasTabsToRight = index < openFiles.length - 1;

    return [
      {
        id: "close",
        label: "Close",
        onClick: () => void closeFile(path),
      },
      {
        id: "close-others",
        label: "Close others",
        disabled: openFiles.length <= 1,
        onClick: () => void closeOthers(path),
      },
      {
        id: "close-right",
        label: "Close right",
        disabled: !hasTabsToRight,
        onClick: () => void closeRight(path),
      },
      {
        id: "close-all",
        label: "Close all",
        onClick: () => void closeAll(),
      },
    ];
  };

  return (
    <div
      className={`editor-tabs${inTitlebar ? " editor-tabs--titlebar" : ""}`}
      data-testid="editor-tabs"
    >
      <div
        className={`editor-tabs__list${inTitlebar ? " editor-tabs__list--titlebar" : ""}${dragState ? " editor-tabs__list--dragging" : ""}`}
        ref={listRef}
        onWheel={handleWheel}
        role="tablist"
      >
        {openFiles.map((file, index) => {
          const isActive = file.path === activePath;
          const isDragging = dragState?.dragIndex === index;
          const offsetX = dragState?.offsets[index] ?? 0;
          const tabStyle =
            offsetX !== 0 ? { transform: `translateX(${offsetX}px)` } : undefined;
          return (
            <div
              key={file.path}
              className={`editor-tabs__tab${isActive ? " editor-tabs__tab--active" : ""}${isDragging ? " editor-tabs__tab--dragging" : ""}`}
              role="tab"
              aria-selected={isActive}
              data-tab-index={index}
              style={tabStyle}
              onPointerDown={(event) => onTabPointerDown(event, index)}
              onContextMenu={(event) => handleContextMenu(event, file.path, index)}
            >
              <button
                type="button"
                className="editor-tabs__tab-button"
                onClick={() => {
                  if (shouldSuppressClick()) {
                    return;
                  }
                  setActive(file.path);
                }}
                title={file.path}
              >
                {file.dirty && (
                  <IconDot size={8} className="editor-tabs__dirty" aria-label="Unsaved" />
                )}
                <FileIcon path={file.path} isDirectory={false} />
                <span className="editor-tabs__label">{tabLabel(file.path)}</span>
              </button>
              <button
                type="button"
                className="editor-tabs__close"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  void closeFile(file.path);
                }}
                aria-label={`Close ${tabLabel(file.path)}`}
              >
                <IconClose size={14} />
              </button>
            </div>
          );
        })}
        {inTitlebar && (
          <div
            className="editor-tabs__drag-fill"
            data-tauri-drag-region
            aria-hidden="true"
          />
        )}
      </div>
      <button
        type="button"
        className="editor-tabs__new"
        onClick={() => void createAndOpenFile()}
        title={hasWorkspace ? "New file" : "Create a project first"}
        aria-label="New file"
        disabled={!hasWorkspace}
      >
        <IconPlus size={16} />
      </button>
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={buildContextMenuItems()}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
