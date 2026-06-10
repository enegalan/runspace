export function toTauriArgs(args: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(args)) {
    if (value === undefined) {
      continue;
    }
    out[key] = value;
    const snake = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    if (snake !== key) {
      out[snake] = value;
    }
  }

  return out;
}
