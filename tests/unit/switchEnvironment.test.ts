import { describe, expect, it } from "vitest";
import { environmentEditorState } from "../../src/core/environment/switchEnvironment";
import { getRuntimeTemplate } from "../../src/core/templates";

describe("switchEnvironment", () => {
  it("returns template and language for environment", () => {
    expect(environmentEditorState("python")).toEqual({
      code: getRuntimeTemplate("python"),
      language: "python",
    });
    expect(environmentEditorState("laravel")).toEqual({
      code: getRuntimeTemplate("laravel"),
      language: "php",
    });
  });
});
