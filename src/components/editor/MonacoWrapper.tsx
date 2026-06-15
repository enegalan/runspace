import Editor, {
  type BeforeMount,
  type OnMount,
  type Monaco,
} from "@monaco-editor/react";
import type { editor as MonacoEditor } from "monaco-editor";
import { KeyCode, KeyMod } from "monaco-editor";
import { useEffect, useRef } from "react";
import { editorFontFamilyCss } from "../../core/constants/settingsDefaults";
import { getMonacoThemeId } from "../../core/settings/applyAppSettings";
import { useSettingsStore } from "../../stores/settingsStore";

function readEditorBackground(): string {
  if (typeof document === "undefined") {
    return "#1e1e1e";
  }

  const value = getComputedStyle(document.documentElement)
    .getPropertyValue("--rs-editor-bg")
    .trim();

  return value || "#1e1e1e";
}

function defineMonacoThemes(monaco: Monaco) {
  const background = readEditorBackground();
  monaco.editor.defineTheme("runspace-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": background,
    },
  });
  monaco.editor.defineTheme("runspace-light", {
    base: "vs",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": background,
    },
  });
}

const handleBeforeMount: BeforeMount = (monaco) => {
  defineMonacoThemes(monaco);
};

export interface MonacoWrapperProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  onSave: () => void;
}

export default function MonacoWrapper({
  value,
  onChange,
  language,
  onSave,
}: MonacoWrapperProps) {
  const settings = useSettingsStore((state) => state.settings);
  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const themeId = getMonacoThemeId(settings);

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    editor.addCommand(KeyMod.CtrlCmd | KeyCode.KeyS, () => {
      void onSave();
    });
  };

  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) {
      return;
    }

    defineMonacoThemes(monaco);
    monaco.editor.setTheme(themeId);
    editor.updateOptions({
      fontSize: settings.appearance.editorFontSize,
      fontFamily: editorFontFamilyCss(settings.appearance.editorFontFamily),
      tabSize: settings.editor.tabSize,
      wordWrap: settings.editor.wordWrap ? "on" : "off",
      minimap: { enabled: settings.editor.minimap },
      scrollBeyondLastLine: settings.editor.scrollBeyondLastLine,
      insertSpaces: settings.editor.insertSpaces,
    });
  }, [settings, themeId]);

  return (
    <Editor
      value={value}
      language={language}
      theme={themeId}
      beforeMount={handleBeforeMount}
      onChange={(next) => onChange(next ?? "")}
      onMount={handleMount}
      options={{
        fontSize: settings.appearance.editorFontSize,
        fontFamily: editorFontFamilyCss(settings.appearance.editorFontFamily),
        minimap: { enabled: settings.editor.minimap },
        wordWrap: settings.editor.wordWrap ? "on" : "off",
        tabSize: settings.editor.tabSize,
        automaticLayout: true,
        scrollBeyondLastLine: settings.editor.scrollBeyondLastLine,
        insertSpaces: settings.editor.insertSpaces,
        padding: { top: 12 },
      }}
      data-testid="monaco-editor"
    />
  );
}
