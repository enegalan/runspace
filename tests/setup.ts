import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

vi.mock("../src/core/platform/isTauri", () => ({
  isTauri: vi.fn(() => true),
}));

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn().mockResolvedValue(undefined),
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
