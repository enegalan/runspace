use std::collections::HashMap;

use serde::{Deserialize, Serialize};

pub const MANIFEST_FILENAME: &str = "runspace.json";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkspaceManifest {
    pub name: String,
    pub runtime_id: String,
    pub entry_file: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkspaceInfo {
    pub id: String,
    pub name: String,
    pub runtime_id: String,
    pub entry_file: String,
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
    pub last_workspace_id: Option<String>,
    #[serde(default)]
    pub open_files: Vec<String>,
    #[serde(default)]
    pub active_file: Option<String>,
    #[serde(default)]
    pub onboarding_complete: bool,
}

impl SessionData {
    pub fn normalize_legacy(&mut self, default_runtime: &str) {
        if !self.environments.is_empty() {
            return;
        }

        let has_legacy = self.last_workspace_id.is_some()
            || !self.open_files.is_empty()
            || self.active_file.is_some();
        if !has_legacy {
            return;
        }

        let workspace_id = self.last_workspace_id.clone();
        let mut workspace_tabs = HashMap::new();
        if let Some(id) = workspace_id.as_ref() {
            workspace_tabs.insert(
                id.clone(),
                WorkspaceTabs {
                    open_files: self.open_files.clone(),
                    active_file: self.active_file.clone(),
                },
            );
        }

        self.environments.insert(
            default_runtime.to_string(),
            EnvironmentSession {
                workspace_id,
                workspace_tabs,
            },
        );
    }

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
        if self.last_workspace_id.as_deref() == Some(workspace_id) {
            self.last_workspace_id = None;
        }
    }
}
