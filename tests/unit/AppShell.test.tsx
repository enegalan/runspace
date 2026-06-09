import { render, screen, waitFor } from "@testing-library/react";
import { invoke } from "@tauri-apps/api/core";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppShell } from "../../src/components/layout/AppShell";

describe("AppShell", () => {
  beforeEach(() => {
    vi.mocked(invoke).mockImplementation((cmd) => {
      if (cmd === "read_snippet") {
        return Promise.resolve({
          code: 'console.log("Hello, Runspace!");',
          language: "javascript",
          updated_at: "",
        });
      }
      return Promise.resolve(undefined);
    });
  });

  it("renders all layout zones", async () => {
    render(<AppShell />);

    await waitFor(() => {
      expect(screen.getByTestId("toolbar")).toBeInTheDocument();
    });

    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("editor-area")).toBeInTheDocument();
    expect(screen.getByTestId("output-panel")).toBeInTheDocument();
    expect(screen.getByTestId("status-bar")).toBeInTheDocument();
    expect(screen.getByTestId("runtime-select")).toBeInTheDocument();
    expect(screen.getByTestId("run-button")).toBeInTheDocument();
    expect(screen.getByTestId("stop-button")).toBeInTheDocument();
    expect(screen.getByTestId("clear-button")).toBeInTheDocument();
  });
});
