import Editor, {
  type BeforeMount,
  type OnMount,
  type Monaco,
} from "@monaco-editor/react";
import type { editor as MonacoEditor } from "monaco-editor";
import { KeyCode, KeyMod } from "monaco-editor";
import { memo, useEffect, useMemo, useRef } from "react";
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

export default memo(function MonacoWrapper({
  value,
  onChange,
  language,
  onSave,
}: MonacoWrapperProps) {
  const appearance = useSettingsStore((state) => state.settings.appearance);
  const editorSettings = useSettingsStore((state) => state.settings.editor);
  const theme = useSettingsStore((state) => state.settings.appearance.theme);
  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const onSaveRef = useRef(onSave);
  const autoSaveRef = useRef(editorSettings.autoSave);
  const themeId = useMemo(() => getMonacoThemeId(theme), [theme]);

  onSaveRef.current = onSave;
  autoSaveRef.current = editorSettings.autoSave;

  const editorOptions = useMemo<MonacoEditor.IStandaloneEditorConstructionOptions>(
    () => ({
      fontSize: appearance.editorFontSize,
      fontFamily: editorFontFamilyCss(appearance.editorFontFamily),
      minimap: { enabled: editorSettings.minimap },
      wordWrap: editorSettings.wordWrap ? "on" : "off",
      tabSize: editorSettings.tabSize,
      automaticLayout: true,
      scrollBeyondLastLine: editorSettings.scrollBeyondLastLine,
      insertSpaces: editorSettings.insertSpaces,
      padding: { top: 12 },
    }),
    [
      appearance.editorFontFamily,
      appearance.editorFontSize,
      editorSettings.insertSpaces,
      editorSettings.minimap,
      editorSettings.scrollBeyondLastLine,
      editorSettings.tabSize,
      editorSettings.wordWrap,
    ],
  );

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    editor.addCommand(KeyMod.CtrlCmd | KeyCode.KeyS, () => {
      void onSaveRef.current();
    });

    editor.onDidBlurEditorWidget(() => {
      if (autoSaveRef.current) {
        void onSaveRef.current();
      }
    });
  };

  useEffect(() => {
    const monaco = monacoRef.current;
    if (!monaco) {
      return;
    }

    defineMonacoThemes(monaco);
    monaco.editor.setTheme(themeId);
  }, [themeId]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }

    editor.updateOptions(editorOptions);
  }, [editorOptions]);

  return (
    <Editor
      value={value}
      language={language}
      theme={themeId}
      beforeMount={handleBeforeMount}
      onChange={(next) => onChange(next ?? "")}
      onMount={handleMount}
      options={editorOptions}
      data-testid="monaco-editor"
    />
  );
});
