import Editor, { type BeforeMount, type OnMount } from "@monaco-editor/react";
import { KeyCode, KeyMod } from "monaco-editor";

const MONACO_THEME = "runspace-dark";

function readEditorBackground(): string {
  if (typeof document === "undefined") {
    return "#1e1e1e";
  }

  const value = getComputedStyle(document.documentElement)
    .getPropertyValue("--rs-editor-bg")
    .trim();

  return value || "#1e1e1e";
}

const handleBeforeMount: BeforeMount = (monaco) => {
  monaco.editor.defineTheme(MONACO_THEME, {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": readEditorBackground(),
    },
  });
};

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
      theme={MONACO_THEME}
      beforeMount={handleBeforeMount}
      onChange={(next) => onChange(next ?? "")}
      onMount={handleMount}
      options={{
        fontSize: 13,
        fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
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
