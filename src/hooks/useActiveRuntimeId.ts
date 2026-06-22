import type { EnvironmentId } from "../core/types/environment";
import { useEnvironmentStore } from "../stores/environmentStore";
import { useWorkspaceStore } from "../stores/workspaceStore";

/**
 * This hook is used to get the active runtime ID.
 * @returns The active runtime ID.
 */
export function useActiveRuntimeId(): EnvironmentId | null {
  const workspaceRuntimeId = useWorkspaceStore((state) => state.workspace?.runtime_id);
  const selectedRuntimeId = useEnvironmentStore((state) => state.selectedId);
  return (workspaceRuntimeId ?? selectedRuntimeId) as EnvironmentId | null;
}
