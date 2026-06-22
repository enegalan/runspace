/**
 * The threshold for the tab drag.
 * @returns The threshold for the tab drag.
 */
export const TAB_DRAG_THRESHOLD_PX = 5;
/**
 * The gap between the tabs.
 * @returns The gap between the tabs.
 */
export const TAB_LIST_GAP_PX = 4;

/**
 * Computes the drop index for the given pointer position.
 * @param pointerX - The x position of the pointer.
 * @param tabRects - The rectangles of the tabs.
 * @returns The drop index.
 */
export function computeTabDropIndex(
  pointerX: number,
  tabRects: Array<{ left: number; width: number }>,
): number {
  if (tabRects.length === 0) {
    return 0;
  }

  for (let index = 0; index < tabRects.length; index += 1) {
    const rect = tabRects[index];
    const midpoint = rect.left + rect.width / 2;
    if (pointerX < midpoint) {
      return index;
    }
  }

  return tabRects.length - 1;
}

/**
 * Computes the visual offsets for the given drag index.
 * @param dragIndex - The index of the drag.
 * @param dropIndex - The index of the drop.
 * @param tabWidths - The widths of the tabs.
 * @param gapPx - The gap between the tabs.
 * @param pointerDeltaX - The delta x of the pointer.
 * @returns The visual offsets.
 */
export function computeTabVisualOffsets(
  dragIndex: number,
  dropIndex: number,
  tabWidths: number[],
  gapPx: number,
  pointerDeltaX: number,
): number[] {
  const offsets = tabWidths.map(() => 0);
  if (tabWidths.length === 0) {
    return offsets;
  }

  offsets[dragIndex] = pointerDeltaX;

  if (dragIndex === dropIndex) {
    return offsets;
  }

  const shift = tabWidths[dragIndex] + gapPx;

  if (dragIndex < dropIndex) {
    for (let index = dragIndex + 1; index <= dropIndex; index += 1) {
      offsets[index] = -shift;
    }
  } else {
    for (let index = dropIndex; index < dragIndex; index += 1) {
      offsets[index] = shift;
    }
  }

  return offsets;
}

/**
 * Reorders the given items by the given index.
 * @param items - The items to reorder.
 * @param fromIndex - The index to reorder from.
 * @param toIndex - The index to reorder to.
 * @returns The reordered items.
 */
export function reorderByIndex<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length
  ) {
    return items;
  }

  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}
