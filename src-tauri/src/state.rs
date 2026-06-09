use std::sync::Mutex;

use crate::engine::ExecutionEngine;
use crate::workspace::{Workspace, WorkspaceManager};

pub struct AppState {
    pub workspace_manager: Mutex<WorkspaceManager>,
    pub execution_engine: ExecutionEngine,
    pub active_workspace: Mutex<Option<Workspace>>,
}

impl AppState {
    pub fn new() -> Result<Self, String> {
        let workspace_manager =
            WorkspaceManager::new().map_err(|e| format!("Workspace init failed: {e}"))?;

        Ok(Self {
            workspace_manager: Mutex::new(workspace_manager),
            execution_engine: ExecutionEngine::new(),
            active_workspace: Mutex::new(None),
        })
    }
}
