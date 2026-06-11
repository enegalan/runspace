import { create } from "zustand";

interface PromptState {
  key: number;
  title: string;
  value: string;
  placeholder?: string;
  resolve: (value: string | null) => void;
}

interface ConfirmState {
  message: string;
  confirmLabel: string;
  danger: boolean;
  resolve: (confirmed: boolean) => void;
}

interface DialogStore {
  prompt: PromptState | null;
  confirm: ConfirmState | null;
  askPrompt: (
    title: string,
    options?: { initialValue?: string; placeholder?: string },
  ) => Promise<string | null>;
  askConfirm: (
    message: string,
    options?: { confirmLabel?: string; danger?: boolean },
  ) => Promise<boolean>;
  setPromptValue: (value: string) => void;
  submitPrompt: () => void;
  cancelPrompt: () => void;
  answerConfirm: (confirmed: boolean) => void;
}

export const useDialogStore = create<DialogStore>((set, get) => ({
  prompt: null,
  confirm: null,

  askPrompt: (title, options) =>
    new Promise((resolve) => {
      set({
        prompt: {
          key: Date.now(),
          title,
          value: options?.initialValue ?? "",
          placeholder: options?.placeholder,
          resolve,
        },
      });
    }),

  askConfirm: (message, options) =>
    new Promise((resolve) => {
      set({
        confirm: {
          message,
          confirmLabel: options?.confirmLabel ?? "OK",
          danger: options?.danger ?? false,
          resolve,
        },
      });
    }),

  setPromptValue: (value) => {
    const prompt = get().prompt;
    if (!prompt) {
      return;
    }
    set({ prompt: { ...prompt, value } });
  },

  submitPrompt: () => {
    const prompt = get().prompt;
    if (!prompt) {
      return;
    }
    const value = prompt.value;
    prompt.resolve(value);
    set({ prompt: null });
  },

  cancelPrompt: () => {
    const prompt = get().prompt;
    if (!prompt) {
      return;
    }
    prompt.resolve(null);
    set({ prompt: null });
  },

  answerConfirm: (confirmed) => {
    const confirm = get().confirm;
    if (!confirm) {
      return;
    }
    confirm.resolve(confirmed);
    set({ confirm: null });
  },
}));
