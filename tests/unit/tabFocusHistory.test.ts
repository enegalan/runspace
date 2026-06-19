import { describe, expect, it } from "vitest";
import {
  pickNextActiveTab,
  rememberTabFocus,
  removeFromTabFocusHistory,
} from "../../src/core/editor/tabFocusHistory";

describe("tabFocusHistory", () => {
  it("prepends the previous active tab to history", () => {
    expect(rememberTabFocus(["b.js"], "a.js")).toEqual(["a.js", "b.js"]);
  });

  it("deduplicates paths when remembering focus", () => {
    expect(rememberTabFocus(["a.js", "c.js"], "a.js")).toEqual(["a.js", "c.js"]);
  });

  it("returns the most recently focused open tab when closing the active tab", () => {
    const next = pickNextActiveTab(["c.js", "b.js"], ["b.js", "c.js"], 0);
    expect(next).toBe("c.js");
  });

  it("falls back to adjacent tabs when focus history is empty", () => {
    expect(pickNextActiveTab([], ["a.js", "c.js"], 1)).toBe("c.js");
    expect(pickNextActiveTab([], ["a.js", "c.js"], 2)).toBe("c.js");
  });

  it("removes closed paths from history", () => {
    expect(removeFromTabFocusHistory(["a.js", "b.js"], "a.js")).toEqual(["b.js"]);
  });
});
