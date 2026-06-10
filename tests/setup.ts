import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

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
  })),
}));

vi.mock("@tauri-apps/plugin-dialog", () => ({
  open: vi.fn().mockResolvedValue(null),
}));

vi.mock("@tauri-apps/plugin-opener", () => ({
  openUrl: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../src/stores/dialogStore", () => ({
  useDialogStore: Object.assign(
    vi.fn(() => ({
      askPrompt: vi.fn().mockResolvedValue("test-name"),
      askConfirm: vi.fn().mockResolvedValue(true),
    })),
    {
      getState: vi.fn(() => ({
        askPrompt: vi.fn().mockResolvedValue("test-name"),
        askConfirm: vi.fn().mockResolvedValue(true),
      })),
    },
  ),
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
