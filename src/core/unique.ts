/**
 * This function is used to remove duplicates from a list.
 * @param items - The items to remove duplicates from.
 * @returns The items without duplicates.
 */
export function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}
