import { Suspense, lazy, useState } from "react";
import {
  clearFileDragData,
  getActiveDragPayload,
  hasFileDrag,
  readFileDragData,
} from "../../core/workspace/fileTreeDrag";
import { useEditorTabsStore } from "../../stores/editorTabsStore";

const MonacoWrapper = lazy(() => import("../editor/MonacoWrapper"));

interface EditorAreaProps {
  onRun: () => void;
  onSave: () => void;
}

export function EditorArea({ onRun, onSave }: EditorAreaProps) {
  const activePath = useEditorTabsStore((state) => state.activePath);
  const activeFile = useEditorTabsStore((state) =>
    state.openFiles.find((file) => file.path === state.activePath) ?? null,
  );
  const openFile = useEditorTabsStore((state) => state.openFile);
  const updateContent = useEditorTabsStore((state) => state.updateContent);
  const [dropTarget, setDropTarget] = useState(false);

  const handleDragOver = (event: React.DragEvent) => {
    if (!hasFileDrag(event.dataTransfer.types)) {
      return;
    }
    const payload = getActiveDragPayload();
    if (!payload || payload.isDirectory) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "copy";
    setDropTarget(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setDropTarget(false);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDropTarget(false);
    const payload = readFileDragData(event.dataTransfer);
    clearFileDragData();
    if (!payload || payload.isDirectory) {
      return;
    }
    void openFile(payload.path);
  };

  const editorClassName = `editor-area${dropTarget ? " editor-area--drop-target" : ""}`;
  const dropHandlers = {
    onDragOver: handleDragOver,
    onDragOverCapture: handleDragOver,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop,
    onDropCapture: handleDrop,
  };

  if (!activePath || !activeFile) {
    return (
      <main
        className={editorClassName}
        data-testid="editor-area"
        {...dropHandlers}
      >
        <div className="editor-area__empty">
          Open a file from the sidebar, drag one here, or create a new tab.
        </div>
      </main>
    );
  }

  return (
    <main
      className={editorClassName}
      data-testid="editor-area"
      {...dropHandlers}
    >
      <Suspense fallback={<div className="editor-area__loading">Loading editor...</div>}>
        <MonacoWrapper
          key={activePath}
          value={activeFile.content}
          onChange={(content) => updateContent(activePath, content)}
          language={activeFile.language}
          onRun={onRun}
          onSave={onSave}
        />
      </Suspense>
    </main>
  );
}
