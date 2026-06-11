import { describe, expect, it } from "vitest";
import {
  computeTabDropIndex,
  computeTabVisualOffsets,
  reorderByIndex,
} from "../../src/core/editor/tabReorder";

describe("tabReorder", () => {
  describe("computeTabDropIndex", () => {
    const rects = [
      { left: 0, width: 100 },
      { left: 100, width: 100 },
      { left: 200, width: 100 },
    ];

    it("returns index before the midpoint of the first tab", () => {
      expect(computeTabDropIndex(30, rects)).toBe(0);
    });

    it("returns index after the midpoint of the first tab", () => {
      expect(computeTabDropIndex(70, rects)).toBe(1);
    });

    it("returns last index when pointer is past all midpoints", () => {
      expect(computeTabDropIndex(350, rects)).toBe(2);
    });

    it("returns 0 for an empty rect list", () => {
      expect(computeTabDropIndex(50, [])).toBe(0);
    });
  });

  describe("computeTabVisualOffsets", () => {
    it("shifts tabs to the left when dragging right", () => {
      expect(
        computeTabVisualOffsets(0, 2, [100, 100, 100], 4, 50),
      ).toEqual([50, -104, -104]);
    });

    it("shifts tabs to the right when dragging left", () => {
      expect(
        computeTabVisualOffsets(2, 0, [100, 100, 100], 4, -80),
      ).toEqual([104, 104, -80]);
    });

    it("only moves the dragged tab when drop index matches", () => {
      expect(
        computeTabVisualOffsets(1, 1, [100, 100, 100], 4, 20),
      ).toEqual([0, 20, 0]);
    });
  });

  describe("reorderByIndex", () => {
    it("moves an item to a new position", () => {
      expect(reorderByIndex(["a", "b", "c", "d"], 1, 3)).toEqual([
        "a",
        "c",
        "d",
        "b",
      ]);
    });

    it("moves an item to an earlier position", () => {
      expect(reorderByIndex(["a", "b", "c", "d"], 3, 0)).toEqual([
        "d",
        "a",
        "b",
        "c",
      ]);
    });

    it("returns the same array when indices match", () => {
      const items = ["a", "b", "c"];
      expect(reorderByIndex(items, 1, 1)).toBe(items);
    });
  });
});
