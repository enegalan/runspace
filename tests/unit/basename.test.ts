import { describe, expect, it } from "vitest";
import { basename } from "../../src/core/path/basename";

describe("basename", () => {
  it("returns the last segment of a unix path", () => {
    expect(basename("lib/utils/helper.js")).toBe("helper.js");
  });

  it("returns the original path when there is no separator", () => {
    expect(basename("index.php")).toBe("index.php");
  });

  it("supports backslash separators", () => {
    expect(basename("lib\\utils\\helper.js")).toBe("helper.js");
  });
});
