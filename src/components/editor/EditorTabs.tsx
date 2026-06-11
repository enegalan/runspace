import { useEffect, useRef } from "react";
import { useNewFile } from "../../hooks/useNewFile";
import { useEditorTabsStore } from "../../stores/editorTabsStore";
import { useWorkspaceStore } from "../../stores/workspaceStore";
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
  const closeFile = useEditorTabsStore((state) => state.closeFile);
  const { createAndOpenFile } = useNewFile();
  const listRef = useRef<HTMLDivElement>(null);

  const handleWheel = (event: React.WheelEvent) => {
    if (!listRef.current) {
      return;
    }
    if (event.deltaY !== 0) {
      listRef.current.scrollLeft += event.deltaY;
    }
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) {
        return;
      }
      if (event.key === "w" && activePath) {
        event.preventDefault();
        void closeFile(activePath);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activePath, closeFile]);

  return (
    <div
      className={`editor-tabs${inTitlebar ? " editor-tabs--titlebar" : ""}`}
      data-testid="editor-tabs"
    >
      <div
        className={`editor-tabs__list${inTitlebar ? " editor-tabs__list--titlebar" : ""}`}
        ref={listRef}
        onWheel={handleWheel}
        role="tablist"
      >
        {openFiles.map((file) => {
          const isActive = file.path === activePath;
          return (
            <div
              key={file.path}
              className={`editor-tabs__tab${isActive ? " editor-tabs__tab--active" : ""}`}
              role="tab"
              aria-selected={isActive}
            >
              <button
                type="button"
                className="editor-tabs__tab-button"
                onClick={() => setActive(file.path)}
                title={file.path}
              >
                {file.dirty && (
                  <IconDot size={8} className="editor-tabs__dirty" aria-label="Unsaved" />
                )}
                <span className="editor-tabs__label">{tabLabel(file.path)}</span>
              </button>
              <button
                type="button"
                className="editor-tabs__close"
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
    </div>
  );
}
