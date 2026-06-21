export interface RuntimePresentation {
  label: string;
  accent: string;
}

/**
 * The runtime presentation.
 * @returns The runtime presentation.
 */
const RUNTIME_PRESENTATION: Record<string, RuntimePresentation> = {
  nodejs: { label: "Node.js", accent: "#3c873a" },
  php: { label: "PHP", accent: "#8892bf" },
  python: { label: "Python", accent: "#3776ab" },
  ruby: { label: "Ruby", accent: "#cc342d" },
  gcc: { label: "GCC (C)", accent: "#00599c" },
  gpp: { label: "G++ (C++)", accent: "#00599c" },
  laravel: { label: "Laravel", accent: "#ff2d20" },
  symfony: { label: "Symfony", accent: "#000000" },
};

/**
 * Gets the runtime presentation for the given runtime ID.
 * @param runtimeId - The runtime ID to get the presentation for.
 * @returns The runtime presentation.
 */
export function getRuntimePresentation(runtimeId: string): RuntimePresentation {
  return (
    RUNTIME_PRESENTATION[runtimeId] ?? {
      label: runtimeId,
      accent: "#0e639c",
    }
  );
}
