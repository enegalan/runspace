export interface KeyValueRow {
  key: string;
  value: string;
}

/**
 * The recordToKeyValueRows function.
 * @param record - The record.
 * @returns The key value rows.
 */
export function recordToKeyValueRows(record: Record<string, string>): KeyValueRow[] {
  return Object.entries(record).map(([key, value]) => ({ key, value }));
}

/**
 * The keyValueRowsToRecord function.
 * @param rows - The key value rows.
 * @returns The record.
 */
export function keyValueRowsToRecord(rows: KeyValueRow[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const row of rows) {
    const key = row.key.trim();
    if (key) {
      result[key] = row.value;
    }
  }
  return result;
}

interface ValidateKeyValueRowsOptions {
  emptyKeyMessage?: string;
  duplicateKeyMessage?: (key: string) => string;
}

/**
 * The validateKeyValueRows function.
 * @param rows - The key value rows.
 * @param options - The options.
 * @returns The validation result.
 */
export function validateKeyValueRows(
  rows: KeyValueRow[],
  options: ValidateKeyValueRowsOptions = {},
): string | null {
  const emptyKeyMessage = options.emptyKeyMessage ?? "Keys cannot be empty";
  const duplicateKeyMessage =
    options.duplicateKeyMessage ?? ((key: string) => `Duplicate key: ${key}`);

  const seen = new Set<string>();
  for (const row of rows) {
    const key = row.key.trim();
    if (!key) {
      return emptyKeyMessage;
    }
    if (seen.has(key)) {
      return duplicateKeyMessage(key);
    }
    seen.add(key);
  }
  return null;
}

/**
 * The createEmptyKeyValueRow function.
 * @returns The empty key value row.
 */
export function createEmptyKeyValueRow(): KeyValueRow {
  return { key: "", value: "" };
}
