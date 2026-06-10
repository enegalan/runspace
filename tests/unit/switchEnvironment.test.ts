import { describe, expect, it } from "vitest";
import {
  environmentEditorState,
  shouldConfirmEnvironmentSwitch,
} from "../../src/core/environment/switchEnvironment";
import { getRuntimeTemplate } from "../../src/core/templates";

describe("switchEnvironment", () => {
  it("does not confirm when editor is empty", () => {
    expect(shouldConfirmEnvironmentSwitch("", "nodejs")).toBe(false);
    expect(shouldConfirmEnvironmentSwitch("   ", "nodejs")).toBe(false);
  });

  it("does not confirm when code matches current template", () => {
    const template = getRuntimeTemplate("nodejs");
    expect(shouldConfirmEnvironmentSwitch(template, "nodejs")).toBe(false);
  });

  it("confirms when user wrote custom code", () => {
    expect(shouldConfirmEnvironmentSwitch("console.log('custom');", "nodejs")).toBe(true);
  });

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
