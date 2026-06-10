import { useEffect, useRef } from "react";
import { useNewFile } from "../../hooks/useNewFile";
import { useEditorTabsStore } from "../../stores/editorTabsStore";

function tabLabel(path: string): string {
  const parts = path.split("/");
  return parts[parts.length - 1] ?? path;
}

export function EditorTabs() {
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
    <div className="editor-tabs" data-testid="editor-tabs">
      <div
        className="editor-tabs__list"
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
                  <span className="editor-tabs__dirty" aria-label="Unsaved">
                    •
                  </span>
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
                ×
              </button>
            </div>
          );
        })}
      </div>
      <button
        type="button"
        className="editor-tabs__new"
        onClick={() => void createAndOpenFile()}
        title="New file"
        aria-label="New file"
      >
        +
      </button>
    </div>
  );
}
