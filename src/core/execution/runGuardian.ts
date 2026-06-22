import type { EnvironmentId } from "../types/environment";
import type { WorkspaceInfo } from "../types/workspace";

interface ConfiguredEnvironment {
  configured: boolean;
}

export type RunGuardianResult =
  | { disabled: true; reason: string }
  | {
      disabled: false;
      snapshot: {
        environmentId: EnvironmentId;
        workspace: WorkspaceInfo;
        filePath: string;
      };
    };

/**
 * Gets the run guardian.
 * @param params - The parameters.
 * @returns The run guardian.
 */
export function getRunGuardian(params: {
  workspace: WorkspaceInfo | null;
  environmentId: EnvironmentId | null;
  selectedEnvironment: ConfiguredEnvironment | undefined;
  activePath: string | null;
}): RunGuardianResult {
  const { workspace, environmentId, selectedEnvironment, activePath } = params;

  if (!workspace) {
    return { disabled: true, reason: "Create a workspace to run code" };
  }
  if (!selectedEnvironment) {
    return { disabled: true, reason: "Add an environment in Settings" };
  }
  if (!selectedEnvironment.configured) {
    return { disabled: true, reason: "Configure in Settings → Environments" };
  }
  if (!activePath) {
    return { disabled: true, reason: "Open a file to run" };
  }
  if (!environmentId) {
    return { disabled: true, reason: "Add an environment in Settings" };
  }

  return {
    disabled: false,
    snapshot: {
      environmentId,
      workspace,
      filePath: activePath,
    },
  };
}
