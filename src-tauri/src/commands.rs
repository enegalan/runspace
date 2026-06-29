use std::collections::HashMap;

use serde_json::Value;
use tauri::{AppHandle, State};

use crate::environment::{Environment, EnvironmentDefinition, ValidationResult};
use crate::services::{environment, execution, settings, terminal, workspace};
use crate::settings::AppSettings;
use crate::state::SharedState;
use crate::workspace::{FileEntry, SessionData, WorkspaceInfo};

#[tauri::command]
pub async fn list_environments(state: State<'_, SharedState>) -> Result<Vec<Environment>, String> {
    environment::list_installed(state.inner())
}

#[tauri::command]
pub async fn list_available_environments(
    state: State<'_, SharedState>,
) -> Result<Vec<EnvironmentDefinition>, String> {
    environment::list_available(state.inner())
}

#[tauri::command]
pub async fn get_selected_environment(
    state: State<'_, SharedState>,
) -> Result<Option<Environment>, String> {
    environment::get_selected(state.inner())
}

#[tauri::command]
pub async fn get_default_environment_id(state: State<'_, SharedState>) -> Result<String, String> {
    environment::get_default_environment_id(state.inner())
}

#[tauri::command]
pub async fn install_environment(
    state: State<'_, SharedState>,
    environment_id: String,
) -> Result<(), String> {
    environment::install(state.inner(), &environment_id)
}

#[tauri::command]
pub async fn uninstall_environment(
    state: State<'_, SharedState>,
    environment_id: String,
) -> Result<(), String> {
    environment::uninstall(state.inner(), &environment_id)
}

#[tauri::command]
pub async fn set_selected_environment(
    state: State<'_, SharedState>,
    environment_id: String,
) -> Result<(), String> {
    environment::set_selected(state.inner(), &environment_id)
}

#[tauri::command]
pub async fn set_environment_paths(
    state: State<'_, SharedState>,
    environment_id: String,
    paths: HashMap<String, String>,
) -> Result<(), String> {
    environment::set_paths(state.inner(), &environment_id, paths)
}

#[tauri::command]
pub async fn set_environment_env_vars(
    state: State<'_, SharedState>,
    environment_id: String,
    env_vars: HashMap<String, String>,
) -> Result<(), String> {
    environment::set_env_vars(state.inner(), &environment_id, env_vars)
}

#[tauri::command]
pub async fn validate_environment(
    state: State<'_, SharedState>,
    environment_id: String,
) -> Result<ValidationResult, String> {
    environment::validate(state.inner(), &environment_id)
}

#[tauri::command]
pub async fn read_settings(state: State<'_, SharedState>) -> Result<AppSettings, String> {
    settings::read_settings(state.inner())
}

#[tauri::command]
pub async fn update_settings(
    state: State<'_, SharedState>,
    patch: Value,
) -> Result<AppSettings, String> {
    settings::update_settings(state.inner(), patch)
}

#[tauri::command]
pub async fn execute_code(
    app: AppHandle,
    state: State<'_, SharedState>,
    code: Option<String>,
    environment_id: Option<String>,
    file: Option<String>,
    timeout_secs: Option<u64>,
    compile_timeout_secs: Option<u64>,
) -> Result<(), String> {
    execution::start_execution(
        state.inner(),
        Some(app),
        code,
        environment_id,
        file,
        timeout_secs,
        compile_timeout_secs,
    )
}

#[tauri::command]
pub async fn kill_process(state: State<'_, SharedState>) -> Result<(), String> {
    execution::kill_process(state.inner())
}

#[tauri::command]
pub async fn spawn_terminal(
    app: AppHandle,
    state: State<'_, SharedState>,
    environment_id: String,
) -> Result<Value, String> {
    terminal::spawn_terminal(state.inner(), Some(app), &environment_id).await
}

#[tauri::command]
pub async fn write_terminal(
    state: State<'_, SharedState>,
    session_id: String,
    data: String,
) -> Result<(), String> {
    terminal::write_terminal(state.inner(), &session_id, &data)?;
    Ok(())
}

#[tauri::command]
pub async fn resize_terminal(
    state: State<'_, SharedState>,
    session_id: String,
    cols: u16,
    rows: u16,
) -> Result<(), String> {
    terminal::resize_terminal(state.inner(), &session_id, cols, rows)?;
    Ok(())
}

#[tauri::command]
pub async fn close_terminal(
    state: State<'_, SharedState>,
    session_id: String,
) -> Result<(), String> {
    terminal::close_terminal(state.inner(), &session_id)?;
    Ok(())
}

#[tauri::command]
pub async fn list_terminal_sessions(state: State<'_, SharedState>) -> Result<Value, String> {
    terminal::list_terminal_sessions(state.inner())
}

#[tauri::command]
pub fn list_workspaces(
    state: State<'_, SharedState>,
    runtime_id: Option<String>,
) -> Result<Vec<WorkspaceInfo>, String> {
    workspace::list_workspaces(state.inner(), runtime_id.as_deref())
}

#[tauri::command]
pub fn open_workspace(state: State<'_, SharedState>, id: String) -> Result<WorkspaceInfo, String> {
    workspace::open_workspace(state.inner(), &id)
}

#[tauri::command]
pub fn create_workspace(
    state: State<'_, SharedState>,
    name: String,
    runtime_id: String,
) -> Result<WorkspaceInfo, String> {
    workspace::create_workspace(state.inner(), &name, &runtime_id)
}

#[tauri::command]
pub fn get_active_workspace(
    state: State<'_, SharedState>,
) -> Result<Option<WorkspaceInfo>, String> {
    workspace::get_active_workspace(state.inner())
}

#[tauri::command]
pub fn list_files(
    state: State<'_, SharedState>,
    relative_path: Option<String>,
    id: Option<String>,
) -> Result<Vec<FileEntry>, String> {
    workspace::list_files(state.inner(), relative_path.as_deref(), id.as_deref())
}

#[tauri::command]
pub fn read_file(state: State<'_, SharedState>, path: String) -> Result<String, String> {
    workspace::read_file(state.inner(), &path)
}

#[tauri::command]
pub fn write_file(
    state: State<'_, SharedState>,
    path: String,
    content: String,
) -> Result<(), String> {
    workspace::write_file(state.inner(), &path, &content)
}

#[tauri::command]
pub fn delete_file(state: State<'_, SharedState>, path: String) -> Result<(), String> {
    workspace::delete_file(state.inner(), &path)
}

#[tauri::command]
pub fn rename_file(
    state: State<'_, SharedState>,
    old_path: String,
    new_path: String,
) -> Result<(), String> {
    workspace::rename_file(state.inner(), &old_path, &new_path)
}

#[tauri::command]
pub fn import_external(
    state: State<'_, SharedState>,
    source_paths: Vec<String>,
    target_dir: Option<String>,
) -> Result<Vec<String>, String> {
    workspace::import_external(state.inner(), &source_paths, target_dir.as_deref())
}

#[tauri::command]
pub fn create_directory(state: State<'_, SharedState>, path: String) -> Result<(), String> {
    workspace::create_directory(state.inner(), &path)
}

#[tauri::command]
pub fn copy_entry(
    state: State<'_, SharedState>,
    source_path: String,
    target_dir: String,
) -> Result<(), String> {
    workspace::copy_entry(state.inner(), &source_path, &target_dir)
}

#[tauri::command]
pub fn read_session(state: State<'_, SharedState>) -> Result<SessionData, String> {
    workspace::read_session(state.inner())
}

#[tauri::command]
pub fn write_session(state: State<'_, SharedState>, session: SessionData) -> Result<(), String> {
    workspace::write_session(state.inner(), &session)
}

#[tauri::command]
pub fn delete_workspace(state: State<'_, SharedState>, id: String) -> Result<(), String> {
    workspace::delete_workspace(state.inner(), &id)
}

#[tauri::command]
pub fn rename_workspace(
    state: State<'_, SharedState>,
    id: String,
    name: String,
) -> Result<WorkspaceInfo, String> {
    workspace::rename_workspace(state.inner(), &id, &name)
}

#[tauri::command]
pub fn update_manifest(
    state: State<'_, SharedState>,
    name: Option<String>,
) -> Result<WorkspaceInfo, String> {
    workspace::update_manifest(state.inner(), name.as_deref())
}

#[tauri::command]
pub fn initialize_workspace(
    state: State<'_, SharedState>,
    runtime_id: String,
    use_session: Option<bool>,
) -> Result<WorkspaceInfo, String> {
    workspace::initialize_workspace(state.inner(), &runtime_id, use_session.unwrap_or(true))
}
