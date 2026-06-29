import { describe, expect, it } from "vitest";
import { hasExternalFileDrag } from "../../src/core/workspace/externalFileDrop";

describe("externalFileDrop", () => {
  it("detects external file drags", () => {
    const external = {
      types: ["Files"],
      files: [],
    } as DataTransfer;
    const empty = {
      types: [],
      files: [],
    } as DataTransfer;

    expect(hasExternalFileDrag(external)).toBe(true);
    expect(hasExternalFileDrag(empty)).toBe(false);
  });
});
