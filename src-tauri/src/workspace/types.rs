use std::collections::HashMap;

use serde::{Deserialize, Serialize};

pub const MANIFEST_FILENAME: &str = "runspace.json";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkspaceManifest {
    pub name: String,
    pub runtime_id: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkspaceInfo {
    pub id: String,
    pub name: String,
    pub runtime_id: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct FileEntry {
    pub name: String,
    pub path: String,
    pub is_directory: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct WorkspaceTabs {
    pub open_files: Vec<String>,
    pub active_file: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct EnvironmentSession {
    pub workspace_id: Option<String>,
    #[serde(default)]
    pub workspace_tabs: HashMap<String, WorkspaceTabs>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct SessionData {
    #[serde(default)]
    pub environments: HashMap<String, EnvironmentSession>,
    #[serde(default)]
    pub last_runtime_id: Option<String>,
    #[serde(default)]
    pub onboarding_complete: bool,
}

impl SessionData {
    pub fn environment_session(&self, runtime_id: &str) -> EnvironmentSession {
        self.environments
            .get(runtime_id)
            .cloned()
            .unwrap_or_default()
    }

    pub fn remove_workspace(&mut self, workspace_id: &str) {
        for env in self.environments.values_mut() {
            env.workspace_tabs.remove(workspace_id);
            if env.workspace_id.as_deref() == Some(workspace_id) {
                env.workspace_id = None;
            }
        }
    }

    pub fn remove_runtime(&mut self, runtime_id: &str, deleted_workspace_ids: &[String]) {
        self.environments.remove(runtime_id);

        if self.last_runtime_id.as_deref() == Some(runtime_id) {
            self.last_runtime_id = None;
        }

        for workspace_id in deleted_workspace_ids {
            self.remove_workspace(workspace_id);
        }
    }
}
