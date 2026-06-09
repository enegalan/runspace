import type { RuntimeDefinition, RuntimeId } from "./types/runtime";

export const RUNTIMES: RuntimeDefinition[] = [
  { id: "node", label: "Node.js" },
];

export const DEFAULT_RUNTIME_ID: RuntimeId = "node";
