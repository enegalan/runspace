export const TAB_DRAG_THRESHOLD_PX = 5;
export const TAB_LIST_GAP_PX = 4;

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
