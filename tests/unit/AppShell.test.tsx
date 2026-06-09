import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppShell } from "../../src/components/layout/AppShell";

describe("AppShell", () => {
  it("renders all layout zones", () => {
    render(<AppShell />);

    expect(screen.getByTestId("toolbar")).toBeInTheDocument();
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("editor-area")).toBeInTheDocument();
    expect(screen.getByTestId("output-panel")).toBeInTheDocument();
    expect(screen.getByTestId("status-bar")).toBeInTheDocument();
    expect(screen.getByTestId("runtime-select")).toBeInTheDocument();
  });
});
