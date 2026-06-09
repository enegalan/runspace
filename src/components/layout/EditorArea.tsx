import { Suspense, lazy } from "react";
import { useEditorStore } from "../../stores/editorStore";

const MonacoWrapper = lazy(() => import("../editor/MonacoWrapper"));

interface EditorAreaProps {
  onRun: (code: string) => void;
  onSave: () => void;
}

export function EditorArea({ onRun, onSave }: EditorAreaProps) {
  const code = useEditorStore((state) => state.code);
  const language = useEditorStore((state) => state.language);
  const setCode = useEditorStore((state) => state.setCode);

  return (
    <main className="editor-area" data-testid="editor-area">
      <Suspense fallback={<div className="editor-area__loading">Loading editor...</div>}>
        <MonacoWrapper
          value={code}
          onChange={setCode}
          language={language}
          onRun={() => onRun(code)}
          onSave={onSave}
        />
      </Suspense>
    </main>
  );
}
