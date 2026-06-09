import { invoke } from "@tauri-apps/api/core";
import { create } from "zustand";

const DEFAULT_CODE = 'console.log("Hello, Runspace!");';
const DEFAULT_LANGUAGE = "javascript";

export interface SnippetData {
  code: string;
  language: string;
  updated_at: string;
}

export interface EditorState {
  code: string;
  language: string;
  loaded: boolean;
  setCode: (code: string) => void;
  setLanguage: (lang: string) => void;
  loadFromDisk: () => Promise<void>;
  saveToDisk: () => Promise<void>;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  code: DEFAULT_CODE,
  language: DEFAULT_LANGUAGE,
  loaded: false,

  setCode: (code) => set({ code }),

  setLanguage: (language) => set({ language }),

  loadFromDisk: async () => {
    try {
      const data = await invoke<SnippetData>("read_snippet");
      set({
        code: data.code || DEFAULT_CODE,
        language: data.language || DEFAULT_LANGUAGE,
        loaded: true,
      });
    } catch {
      set({ loaded: true });
    }
  },

  saveToDisk: async () => {
    const { code, language } = get();
    const data: SnippetData = {
      code,
      language,
      updated_at: new Date().toISOString(),
    };
    await invoke("write_snippet", { data });
  },
}));
