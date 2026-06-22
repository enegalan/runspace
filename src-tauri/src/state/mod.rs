use std::path::PathBuf;
use std::sync::{Arc, Mutex};

use crate::engine::{ExecutionEngine, ExecutionEventBus};
use crate::environment::EnvironmentManager;
use crate::settings::SettingsManager;
use crate::terminal::{TerminalEventBus, TerminalManager};
use crate::workspace::{Workspace, WorkspaceManager};

pub type SharedState = Arc<AppState>;

pub struct AppState {
    pub workspace_manager: Mutex<WorkspaceManager>,
    pub environment_manager: Mutex<EnvironmentManager>,
    pub settings_manager: Mutex<SettingsManager>,
    pub execution_engine: ExecutionEngine,
    pub execution_events: ExecutionEventBus,
    pub terminal_manager: Mutex<TerminalManager>,
    pub terminal_events: TerminalEventBus,
    pub active_workspace: Mutex<Option<Workspace>>,
}

impl AppState {
    pub fn new() -> Result<Self, String> {
        let workspace_manager =
            WorkspaceManager::new().map_err(|e| format!("Workspace init failed: {e}"))?;

        let home =
            std::env::var("HOME").map_err(|_| "Could not resolve home directory".to_string())?;
        let runspace_dir = PathBuf::from(&home).join(".runspace");
        let environments_path = runspace_dir.join("environments.json");
        let settings_path = runspace_dir.join("settings.json");
        let environment_manager = EnvironmentManager::new(environments_path)
            .map_err(|e| format!("Environment manager init failed: {e}"))?;
        let settings_manager = SettingsManager::new(settings_path)
            .map_err(|e| format!("Settings manager init failed: {e}"))?;

        Ok(Self {
            workspace_manager: Mutex::new(workspace_manager),
            environment_manager: Mutex::new(environment_manager),
            settings_manager: Mutex::new(settings_manager),
            execution_engine: ExecutionEngine::new(),
            execution_events: ExecutionEventBus::new(),
            terminal_manager: Mutex::new(TerminalManager::new()),
            terminal_events: TerminalEventBus::new(),
            active_workspace: Mutex::new(None),
        })
    }
}
