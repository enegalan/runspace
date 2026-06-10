import { describe, expect, it } from "vitest";
import { toTauriArgs } from "../../src/core/api/tauriArgs";

describe("toTauriArgs", () => {
  it("adds snake_case aliases for camelCase keys", () => {
    expect(toTauriArgs({ runtimeId: "php", name: "Demo" })).toEqual({
      runtimeId: "php",
      runtime_id: "php",
      name: "Demo",
    });
  });

  it("skips undefined values", () => {
    expect(toTauriArgs({ runtimeId: undefined, name: "Demo" })).toEqual({
      name: "Demo",
    });
  });
});
