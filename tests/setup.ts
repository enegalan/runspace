import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal("ResizeObserver", ResizeObserverMock);

vi.mock("../src/core/platform/isTauri", () => ({
  isTauri: vi.fn(() => true),
}));

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../src/core/api/fetchBackend", () => ({
  waitForBackendReady: vi.fn().mockResolvedValue(undefined),
  fetchBackend: vi.fn().mockResolvedValue(
    new Response(JSON.stringify({ ok: true }), { status: 200 }),
  ),
}));

vi.mock("../src/core/api/runspaceInvoke", () => ({
  runspaceInvoke: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@tauri-apps/api/event", () => ({
  listen: vi.fn().mockResolvedValue(() => {}),
}));

vi.mock("@tauri-apps/api/window", () => ({
  getCurrentWindow: vi.fn(() => ({
    onCloseRequested: vi.fn().mockResolvedValue(() => {}),
    scaleFactor: vi.fn().mockResolvedValue(1),
    destroy: vi.fn().mockResolvedValue(undefined),
  })),
}));

vi.mock("@tauri-apps/api/webview", () => ({
  getCurrentWebview: vi.fn(() =>
    Promise.resolve({
      onDragDropEvent: vi.fn().mockResolvedValue(() => {}),
    }),
  ),
}));

vi.mock("@tauri-apps/plugin-dialog", () => ({
  open: vi.fn().mockResolvedValue(null),
}));

vi.mock("@tauri-apps/plugin-opener", () => ({
  openUrl: vi.fn().mockResolvedValue(undefined),
}));

const dialogStoreState = {
  prompt: null as null | {
    title: string;
    value: string;
    placeholder?: string;
  },
  confirm: null as null | {
    message: string;
    confirmLabel: string;
    danger: boolean;
  },
  askPrompt: vi.fn().mockResolvedValue("test-name"),
  askConfirm: vi.fn().mockResolvedValue(true),
  setPromptValue: vi.fn(),
  submitPrompt: vi.fn(),
  cancelPrompt: vi.fn(),
  answerConfirm: vi.fn(),
};

function useDialogStoreMock<T>(selector: (state: typeof dialogStoreState) => T): T;
function useDialogStoreMock(): typeof dialogStoreState;
function useDialogStoreMock(selector?: (state: typeof dialogStoreState) => unknown) {
  if (selector) {
    return selector(dialogStoreState);
  }
  return dialogStoreState;
}

vi.mock("../src/stores/dialogStore", () => ({
  useDialogStore: Object.assign(useDialogStoreMock, {
    getState: () => dialogStoreState,
  }),
}));

vi.mock("@monaco-editor/react", () => {
  const React = require("react");
  return {
    default: ({
      value,
      onChange,
      "data-testid": testId,
    }: {
      value: string;
      onChange?: (value: string) => void;
      "data-testid"?: string;
    }) =>
      React.createElement("textarea", {
        "data-testid": testId ?? "monaco-editor",
        value,
        onChange: (event: { target: { value: string } }) =>
          onChange?.(event.target.value),
      }),
  };
});

vi.mock("@xterm/xterm", () => ({
  Terminal: class {
    cols = 80;
    rows = 24;
    options: { theme: Record<string, string> } = { theme: {} };
    loadAddon() {}
    open() {}
    write() {}
    clear() {}
    focus() {}
    dispose() {}
    onData(handler: (value: string) => void) {
      this.onDataHandler = handler;
      return { dispose: () => {} };
    }
    onResize(handler: (size: { cols: number; rows: number }) => void) {
      this.onResizeHandler = handler;
      return { dispose: () => {} };
    }
    private onDataHandler?: (value: string) => void;
    private onResizeHandler?: (size: { cols: number; rows: number }) => void;
  },
}));

vi.mock("@xterm/addon-fit", () => ({
  FitAddon: class {
    fit() {}
  },
}));
