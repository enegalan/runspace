import type { EnvironmentDefinition } from "../types/environment";

export interface RuntimePresentation {
  label: string;
  accent: string;
}

const FALLBACK_ACCENT = "#0e639c";

/**
 * Gets runtime presentation from a definition or id fallback.
 * @param runtimeId - The runtime id.
 * @param definition - The runtime definition.
 * @returns The runtime presentation.
 */
export function getRuntimePresentation(
  runtimeId: string,
  definition?: EnvironmentDefinition,
): RuntimePresentation {
  if (definition) {
    return {
      label: definition.name,
      accent: definition.presentation?.accent ?? FALLBACK_ACCENT,
    };
  }

  return {
    label: runtimeId,
    accent: FALLBACK_ACCENT,
  };
}
