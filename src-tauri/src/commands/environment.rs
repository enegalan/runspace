use std::collections::HashMap;

use tauri::State;

use crate::environment::{Environment, EnvironmentDefinition, ValidationResult};
use crate::state::AppState;

#[tauri::command]
pub fn list_environments(state: State<'_, AppState>) -> Result<Vec<Environment>, String> {
    let manager = state
        .environment_manager
        .lock()
        .map_err(|_| "Environment manager lock poisoned".to_string())?;
    Ok(manager.list_installed())
}

#[tauri::command]
pub fn list_available_environments(
    state: State<'_, AppState>,
) -> Result<Vec<EnvironmentDefinition>, String> {
    let manager = state
        .environment_manager
        .lock()
        .map_err(|_| "Environment manager lock poisoned".to_string())?;
    Ok(manager.list_available())
}

#[tauri::command]
pub fn get_selected_environment(state: State<'_, AppState>) -> Result<Environment, String> {
    let manager = state
        .environment_manager
        .lock()
        .map_err(|_| "Environment manager lock poisoned".to_string())?;
    manager
        .get_selected()
        .ok_or_else(|| "No selected environment".to_string())
}

#[tauri::command]
pub fn install_environment(
    state: State<'_, AppState>,
    environment_id: String,
) -> Result<(), String> {
    let mut manager = state
        .environment_manager
        .lock()
        .map_err(|_| "Environment manager lock poisoned".to_string())?;
    manager
        .install(&environment_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn uninstall_environment(
    state: State<'_, AppState>,
    environment_id: String,
) -> Result<(), String> {
    let mut manager = state
        .environment_manager
        .lock()
        .map_err(|_| "Environment manager lock poisoned".to_string())?;
    manager
        .uninstall(&environment_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_selected_environment(
    state: State<'_, AppState>,
    environment_id: String,
) -> Result<(), String> {
    let mut manager = state
        .environment_manager
        .lock()
        .map_err(|_| "Environment manager lock poisoned".to_string())?;
    manager
        .set_selected(&environment_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_environment_paths(
    state: State<'_, AppState>,
    environment_id: String,
    paths: HashMap<String, String>,
) -> Result<(), String> {
    let mut manager = state
        .environment_manager
        .lock()
        .map_err(|_| "Environment manager lock poisoned".to_string())?;
    manager
        .set_paths(&environment_id, paths)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_environment_env_vars(
    state: State<'_, AppState>,
    environment_id: String,
    env_vars: HashMap<String, String>,
) -> Result<(), String> {
    let mut manager = state
        .environment_manager
        .lock()
        .map_err(|_| "Environment manager lock poisoned".to_string())?;
    manager
        .set_env_vars(&environment_id, env_vars)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn validate_environment(
    state: State<'_, AppState>,
    environment_id: String,
) -> Result<ValidationResult, String> {
    let mut manager = state
        .environment_manager
        .lock()
        .map_err(|_| "Environment manager lock poisoned".to_string())?;
    manager
        .validate_environment(&environment_id)
        .map_err(|e| e.to_string())
}
