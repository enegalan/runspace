use std::path::PathBuf;
use std::sync::Mutex;

use crate::engine::ExecutionEngine;
use crate::environment::EnvironmentManager;
use crate::workspace::{Workspace, WorkspaceManager};

pub struct AppState {
    pub workspace_manager: Mutex<WorkspaceManager>,
    pub environment_manager: Mutex<EnvironmentManager>,
    pub execution_engine: ExecutionEngine,
    pub active_workspace: Mutex<Option<Workspace>>,
}

impl AppState {
    pub fn new() -> Result<Self, String> {
        let workspace_manager =
            WorkspaceManager::new().map_err(|e| format!("Workspace init failed: {e}"))?;

        let home = std::env::var("HOME")
            .map_err(|_| "Could not resolve home directory".to_string())?;
        let config_path = PathBuf::from(home).join(".runspace").join("environments.json");
        let environment_manager = EnvironmentManager::new(config_path)
            .map_err(|e| format!("Environment manager init failed: {e}"))?;

        Ok(Self {
            workspace_manager: Mutex::new(workspace_manager),
            environment_manager: Mutex::new(environment_manager),
            execution_engine: ExecutionEngine::new(),
            active_workspace: Mutex::new(None),
        })
    }
}
