import { describe, expect, it } from "vitest";
import { nextUntitledFileName } from "../../src/core/workspace/uniqueFileName";

describe("uniqueFileName", () => {
  it("picks the first available Untitled name", () => {
    expect(nextUntitledFileName([], "nodejs")).toBe("Untitled");
    expect(nextUntitledFileName(["Untitled.js"], "nodejs")).toBe("Untitled (2)");
    expect(
      nextUntitledFileName(["Untitled.js", "Untitled (2).js"], "nodejs"),
    ).toBe("Untitled (3)");
  });
});
