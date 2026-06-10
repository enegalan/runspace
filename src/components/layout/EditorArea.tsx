import { Suspense, lazy, useState } from "react";
import {
  DROP_TARGET_ATTR,
  hasExternalFileDrag,
  importDroppedExternalFiles,
} from "../../core/workspace/externalFileDrop";
import {
  clearFileDragData,
  getActiveDragPayload,
  hasFileDrag,
  readFileDragData,
} from "../../core/workspace/fileTreeDrag";
import { useEnvironmentStore } from "../../stores/environmentStore";
import { useEditorTabsStore } from "../../stores/editorTabsStore";
import { useWorkspaceStore } from "../../stores/workspaceStore";

const MonacoWrapper = lazy(() => import("../editor/MonacoWrapper"));

interface EditorAreaProps {
  onRun: () => void;
  onSave: () => void;
}

export function EditorArea({ onRun, onSave }: EditorAreaProps) {
  const workspace = useWorkspaceStore((state) => state.workspace);
  const createProject = useWorkspaceStore((state) => state.createProject);
  const selectedRuntimeId = useEnvironmentStore((state) => state.selectedId);
  const activePath = useEditorTabsStore((state) => state.activePath);
  const activeFile = useEditorTabsStore((state) =>
    state.openFiles.find((file) => file.path === state.activePath) ?? null,
  );
  const openFile = useEditorTabsStore((state) => state.openFile);
  const updateContent = useEditorTabsStore((state) => state.updateContent);
  const [dropTarget, setDropTarget] = useState(false);

  const handleDragOver = (event: React.DragEvent) => {
    if (!workspace) {
      return;
    }

    if (hasExternalFileDrag(event.dataTransfer)) {
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

    if (hasExternalFileDrag(event.dataTransfer)) {
      void importDroppedExternalFiles(event.dataTransfer, "", { openFile: true });
      return;
    }

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

  if (!workspace) {
    return (
      <main
        className={editorClassName}
        data-testid="editor-area"
        {...{ [DROP_TARGET_ATTR]: "" }}
      >
        <div className="editor-area__empty">
          <p className="editor-area__empty-title">No project open</p>
          <p className="editor-area__empty-hint">
            Create a project to start editing and running code.
          </p>
          <button
            type="button"
            className="btn btn--primary editor-area__empty-action"
            onClick={() => void createProject(selectedRuntimeId)}
          >
            Create project
          </button>
        </div>
      </main>
    );
  }

  if (!activePath || !activeFile) {
    return (
      <main
        className={editorClassName}
        data-testid="editor-area"
        {...{ [DROP_TARGET_ATTR]: "" }}
        {...dropHandlers}
      >
        <div className="editor-area__empty">
          <p className="editor-area__empty-hint">
            Open a file from the sidebar, drag one here from your computer, or create a new tab.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      className={editorClassName}
      data-testid="editor-area"
      {...{ [DROP_TARGET_ATTR]: "" }}
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
