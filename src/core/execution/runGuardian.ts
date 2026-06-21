import type { WorkspaceInfo } from "../types/workspace";

interface ConfiguredEnvironment {
  configured: boolean;
}

export interface RunGuardian {
  disabled: boolean;
  reason?: string;
}

export function getRunGuardian(params: {
  workspace: WorkspaceInfo | null;
  selectedEnvironment: ConfiguredEnvironment | undefined;
  activePath: string | null;
}): RunGuardian {
  const { workspace, selectedEnvironment, activePath } = params;

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

  return { disabled: false };
}
