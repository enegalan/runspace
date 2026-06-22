export interface WorkspaceInfo {
  id: string;
  name: string;
  runtime_id: string;
}

export interface FileEntry {
  name: string;
  path: string;
  is_directory: boolean;
}

export interface WorkspaceTabs {
  open_files: string[];
  active_file: string | null;
}

export interface EnvironmentSession {
  workspace_id: string | null;
  workspace_tabs: Record<string, WorkspaceTabs>;
}

export interface SessionData {
  environments: Record<string, EnvironmentSession>;
  last_runtime_id?: string | null;
  last_workspace_id?: string | null;
  open_files?: string[];
  active_file?: string | null;
  onboarding_complete?: boolean;
}
