import { describe, expect, it } from "vitest";
import { hasExternalFileDrag } from "../../src/core/workspace/externalFileDrop";

describe("externalFileDrop", () => {
  it("detects external file drags from Files type", () => {
    const external = {
      types: ["Files"],
      files: [],
    } as DataTransfer;

    expect(hasExternalFileDrag(external)).toBe(true);
  });

  it("detects external file drags from files list when types is empty", () => {
    const external = {
      types: [],
      files: [{ name: "app.js" }],
    } as DataTransfer;

    expect(hasExternalFileDrag(external)).toBe(true);
  });
});
