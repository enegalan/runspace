import Editor, { type OnMount } from "@monaco-editor/react";
import { KeyCode, KeyMod } from "monaco-editor";

export interface MonacoWrapperProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  onRun: () => void;
  onSave: () => void;
}

export default function MonacoWrapper({
  value,
  onChange,
  language,
  onRun,
  onSave,
}: MonacoWrapperProps) {
  const handleMount: OnMount = (editor) => {
    editor.addAction({
      id: "run-code",
      label: "Run Code",
      keybindings: [KeyMod.CtrlCmd | KeyCode.Enter],
      run: () => {
        onRun();
      },
    });

    editor.addAction({
      id: "save-snippet",
      label: "Save Snippet",
      keybindings: [KeyMod.CtrlCmd | KeyCode.KeyS],
      run: () => {
        void onSave();
      },
    });

    editor.addCommand(KeyMod.CtrlCmd | KeyCode.KeyS, () => {
      void onSave();
    });
  };

  return (
    <Editor
      value={value}
      language={language}
      theme="vs-dark"
      onChange={(next) => onChange(next ?? "")}
      onMount={handleMount}
      options={{
        fontSize: 14,
        minimap: { enabled: false },
        wordWrap: "on",
        tabSize: 2,
        automaticLayout: true,
        scrollBeyondLastLine: false,
        padding: { top: 12 },
      }}
      data-testid="monaco-editor"
    />
  );
}
