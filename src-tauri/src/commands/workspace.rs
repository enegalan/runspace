use tauri::State;

use crate::state::SharedState;
use crate::workspace::{FileEntry, SessionData, Workspace, WorkspaceInfo};

fn lock_workspace_manager(
    state: &SharedState,
) -> Result<std::sync::MutexGuard<'_, crate::workspace::WorkspaceManager>, String> {
    state
        .workspace_manager
        .lock()
        .map_err(|_| "Workspace manager lock poisoned".to_string())
}

fn lock_active_workspace(
    state: &SharedState,
) -> Result<std::sync::MutexGuard<'_, Option<Workspace>>, String> {
    state
        .active_workspace
        .lock()
        .map_err(|_| "Active workspace lock poisoned".to_string())
}

fn require_active_workspace(state: &SharedState) -> Result<Workspace, String> {
    let active = lock_active_workspace(state)?;
    active
        .clone()
        .ok_or_else(|| "No active workspace".to_string())
}

#[tauri::command]
pub fn list_workspaces(
    state: State<'_, SharedState>,
    runtime_id: Option<String>,
) -> Result<Vec<WorkspaceInfo>, String> {
    let manager = lock_workspace_manager(&state)?;
    manager
        .list_workspaces_for_runtime(runtime_id.as_deref())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn open_workspace(state: State<'_, SharedState>, id: String) -> Result<WorkspaceInfo, String> {
    let manager = lock_workspace_manager(&state)?;
    let workspace = manager.open_workspace(&id).map_err(|e| e.to_string())?;
    let info = manager
        .workspace_info(&workspace)
        .map_err(|e| e.to_string())?;
    {
        let mut active = lock_active_workspace(&state)?;
        *active = Some(workspace);
    }
    Ok(info)
}

#[tauri::command]
pub fn create_workspace(
    state: State<'_, SharedState>,
    name: String,
    runtime_id: String,
) -> Result<WorkspaceInfo, String> {
    let manager = lock_workspace_manager(&state)?;
    let workspace = manager
        .create_named_workspace(&name, &runtime_id)
        .map_err(|e| e.to_string())?;
    let info = manager
        .workspace_info(&workspace)
        .map_err(|e| e.to_string())?;
    {
        let mut active = lock_active_workspace(&state)?;
        *active = Some(workspace);
    }
    Ok(info)
}

#[tauri::command]
pub fn get_active_workspace(state: State<'_, SharedState>) -> Result<Option<WorkspaceInfo>, String> {
    let manager = lock_workspace_manager(&state)?;
    let active = lock_active_workspace(&state)?;
    match active.as_ref() {
        Some(workspace) => {
            let info = manager
                .workspace_info(workspace)
                .map_err(|e| e.to_string())?;
            Ok(Some(info))
        }
        None => Ok(None),
    }
}

#[tauri::command]
pub fn list_files(
    state: State<'_, SharedState>,
    relative_path: Option<String>,
) -> Result<Vec<FileEntry>, String> {
    let manager = lock_workspace_manager(&state)?;
    let workspace = require_active_workspace(&state)?;
    manager
        .list_files(&workspace, relative_path.as_deref())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn read_file(state: State<'_, SharedState>, path: String) -> Result<String, String> {
    let manager = lock_workspace_manager(&state)?;
    let workspace = require_active_workspace(&state)?;
    manager
        .read_file(&workspace, &path)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn write_file(
    state: State<'_, SharedState>,
    path: String,
    content: String,
) -> Result<(), String> {
    let manager = lock_workspace_manager(&state)?;
    let workspace = require_active_workspace(&state)?;
    manager
        .write_file(&workspace, &path, &content)
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn delete_file(state: State<'_, SharedState>, path: String) -> Result<(), String> {
    let manager = lock_workspace_manager(&state)?;
    let workspace = require_active_workspace(&state)?;
    manager
        .delete_file(&workspace, &path)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn rename_file(
    state: State<'_, SharedState>,
    old_path: String,
    new_path: String,
) -> Result<(), String> {
    let manager = lock_workspace_manager(&state)?;
    let workspace = require_active_workspace(&state)?;
    manager
        .rename_file(&workspace, &old_path, &new_path)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn import_external(
    state: State<'_, SharedState>,
    source_paths: Vec<String>,
    target_dir: Option<String>,
) -> Result<Vec<String>, String> {
    let manager = lock_workspace_manager(&state)?;
    let workspace = require_active_workspace(&state)?;
    manager
        .import_external(&workspace, &source_paths, target_dir.as_deref())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_directory(state: State<'_, SharedState>, path: String) -> Result<(), String> {
    let manager = lock_workspace_manager(&state)?;
    let workspace = require_active_workspace(&state)?;
    manager
        .create_directory(&workspace, &path)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn read_session(state: State<'_, SharedState>) -> Result<SessionData, String> {
    let manager = lock_workspace_manager(&state)?;
    manager.load_session().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn write_session(state: State<'_, SharedState>, session: SessionData) -> Result<(), String> {
    let manager = lock_workspace_manager(&state)?;
    manager.save_session(&session).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_workspace(state: State<'_, SharedState>, id: String) -> Result<(), String> {
    let manager = lock_workspace_manager(&state)?;
    manager.delete_workspace(&id).map_err(|e| e.to_string())?;

    let mut session = manager.load_session().map_err(|e| e.to_string())?;
    manager
        .purge_workspace_from_session(&mut session, &id)
        .map_err(|e| e.to_string())?;

    let mut active = lock_active_workspace(&state)?;
    if active.as_ref().is_some_and(|current| current.id == id) {
        *active = None;
    }

    Ok(())
}

#[tauri::command]
pub fn rename_workspace(
    state: State<'_, SharedState>,
    id: String,
    name: String,
) -> Result<WorkspaceInfo, String> {
    let trimmed = name.trim();
    if trimmed.is_empty() {
        return Err("Project name cannot be empty".to_string());
    }

    let manager = lock_workspace_manager(&state)?;
    let workspace = manager.open_workspace(&id).map_err(|e| e.to_string())?;
    let mut manifest = manager
        .read_manifest(&workspace)
        .map_err(|e| e.to_string())?;
    manifest.name = trimmed.to_string();
    manifest.updated_at = chrono::Utc::now().to_rfc3339();
    manager
        .write_manifest(&workspace, &manifest)
        .map_err(|e| e.to_string())?;
    let info = manager
        .workspace_info(&workspace)
        .map_err(|e| e.to_string())?;

    let mut active = lock_active_workspace(&state)?;
    if active.as_ref().is_some_and(|current| current.id == id) {
        *active = Some(workspace);
    }

    Ok(info)
}

#[tauri::command]
pub fn update_manifest(
    state: State<'_, SharedState>,
    name: Option<String>,
    entry_file: Option<String>,
) -> Result<WorkspaceInfo, String> {
    let manager = lock_workspace_manager(&state)?;
    let workspace = require_active_workspace(&state)?;
    let mut manifest = manager
        .read_manifest(&workspace)
        .map_err(|e| e.to_string())?;

    if let Some(next_name) = name {
        manifest.name = next_name;
    }
    if let Some(next_entry) = entry_file {
        manifest.entry_file = next_entry;
    }
    manifest.updated_at = chrono::Utc::now().to_rfc3339();

    manager
        .write_manifest(&workspace, &manifest)
        .map_err(|e| e.to_string())?;
    manager
        .workspace_info(&workspace)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn initialize_workspace(
    state: State<'_, SharedState>,
    runtime_id: String,
) -> Result<WorkspaceInfo, String> {
    let manager = lock_workspace_manager(&state)?;
    let session = manager.load_session().map_err(|e| e.to_string())?;
    let (workspace, info) = manager
        .initialize_active_workspace(&runtime_id, &session)
        .map_err(|e| e.to_string())?;
    {
        let mut active = lock_active_workspace(&state)?;
        *active = Some(workspace);
    }
    Ok(info)
}
