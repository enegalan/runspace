export const SIDEBAR_WIDTH_DEFAULT = 260;
export const SIDEBAR_WIDTH_MIN = 260;
export const SIDEBAR_WIDTH_MAX = 480;

export const OUTPUT_WIDTH_DEFAULT = 300;
export const OUTPUT_WIDTH_MIN = 200;
export const OUTPUT_WIDTH_MAX = 560;

export function clampPanelSize(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
