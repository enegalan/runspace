import { describe, expect, it } from "vitest";
import { matchesSettingsSearch } from "../../src/core/settings/search";

describe("matchesSettingsSearch", () => {
  it("matches empty query against any terms", () => {
    expect(matchesSettingsSearch("", "Theme")).toBe(true);
    expect(matchesSettingsSearch("   ", "Theme")).toBe(true);
  });

  it("matches case-insensitive substrings", () => {
    expect(matchesSettingsSearch("wrap", "Word wrap", "Wrap long lines")).toBe(true);
    expect(matchesSettingsSearch("sidebar", "Show sidebar")).toBe(true);
    expect(matchesSettingsSearch("nomatch", "Theme")).toBe(false);
  });
});
