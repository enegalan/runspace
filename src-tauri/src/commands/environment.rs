use std::collections::HashMap;

use serde_json::json;
use tauri::State;

use crate::environment::{Environment, EnvironmentDefinition, ValidationResult};
use crate::services::invoke::dispatch_invoke;
use crate::state::SharedState;

#[tauri::command]
pub async fn list_environments(state: State<'_, SharedState>) -> Result<Vec<Environment>, String> {
    let result = dispatch_invoke(&state, None, "list_environments", json!({})).await?;
    serde_json::from_value(result).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn list_available_environments(
    state: State<'_, SharedState>,
) -> Result<Vec<EnvironmentDefinition>, String> {
    let result = dispatch_invoke(&state, None, "list_available_environments", json!({})).await?;
    serde_json::from_value(result).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_selected_environment(state: State<'_, SharedState>) -> Result<Environment, String> {
    let result = dispatch_invoke(&state, None, "get_selected_environment", json!({})).await?;
    serde_json::from_value(result).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn install_environment(
    state: State<'_, SharedState>,
    environment_id: String,
) -> Result<(), String> {
    dispatch_invoke(
        &state,
        None,
        "install_environment",
        json!({ "environmentId": environment_id }),
    )
    .await?;
    Ok(())
}

#[tauri::command]
pub async fn uninstall_environment(
    state: State<'_, SharedState>,
    environment_id: String,
) -> Result<(), String> {
    dispatch_invoke(
        &state,
        None,
        "uninstall_environment",
        json!({ "environmentId": environment_id }),
    )
    .await?;
    Ok(())
}

#[tauri::command]
pub async fn set_selected_environment(
    state: State<'_, SharedState>,
    environment_id: String,
) -> Result<(), String> {
    dispatch_invoke(
        &state,
        None,
        "set_selected_environment",
        json!({ "environmentId": environment_id }),
    )
    .await?;
    Ok(())
}

#[tauri::command]
pub async fn set_environment_paths(
    state: State<'_, SharedState>,
    environment_id: String,
    paths: HashMap<String, String>,
) -> Result<(), String> {
    dispatch_invoke(
        &state,
        None,
        "set_environment_paths",
        json!({ "environmentId": environment_id, "paths": paths }),
    )
    .await?;
    Ok(())
}

#[tauri::command]
pub async fn set_environment_env_vars(
    state: State<'_, SharedState>,
    environment_id: String,
    env_vars: HashMap<String, String>,
) -> Result<(), String> {
    dispatch_invoke(
        &state,
        None,
        "set_environment_env_vars",
        json!({ "environmentId": environment_id, "envVars": env_vars }),
    )
    .await?;
    Ok(())
}

#[tauri::command]
pub async fn validate_environment(
    state: State<'_, SharedState>,
    environment_id: String,
) -> Result<ValidationResult, String> {
    let result = dispatch_invoke(
        &state,
        None,
        "validate_environment",
        json!({ "environmentId": environment_id }),
    )
    .await?;
    serde_json::from_value(result).map_err(|e| e.to_string())
}
