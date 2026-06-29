import { describe, expect, it } from "vitest";
import { singleSegmentNameError } from "../../src/core/workspace/prompts/singleSegmentName";

describe("singleSegmentNameError", () => {
  it("accepts plain names", () => {
    expect(singleSegmentNameError("utils.js")).toBeNull();
    expect(singleSegmentNameError("lib")).toBeNull();
  });

  it("rejects path separators", () => {
    expect(singleSegmentNameError("foo/bar")).not.toBeNull();
    expect(singleSegmentNameError("foo\\bar")).not.toBeNull();
  });

  it("rejects traversal segments", () => {
    expect(singleSegmentNameError(".")).not.toBeNull();
    expect(singleSegmentNameError("..")).not.toBeNull();
    expect(singleSegmentNameError("foo..bar")).not.toBeNull();
  });
});
