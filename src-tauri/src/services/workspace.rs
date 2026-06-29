use crate::engine::profiles::cleanup_workspace_artifacts;
use crate::error::{lock_err, map_err};
use crate::state::SharedState;
use crate::workspace::{FileEntry, SessionData, Workspace, WorkspaceInfo};

pub(crate) fn lock_workspace_manager(
    state: &SharedState,
) -> Result<std::sync::MutexGuard<'_, crate::workspace::WorkspaceManager>, String> {
    lock_err(state.workspace_manager.lock(), "Workspace manager")
}

fn lock_active_workspace(
    state: &SharedState,
) -> Result<std::sync::MutexGuard<'_, Option<Workspace>>, String> {
    lock_err(state.active_workspace.lock(), "Active workspace")
}

pub(crate) fn require_active_workspace(state: &SharedState) -> Result<Workspace, String> {
    let active = lock_active_workspace(state)?;
    active
        .clone()
        .ok_or_else(|| "No active workspace. Create or open a project first.".to_string())
}

pub(crate) fn ensure_active_workspace(state: &SharedState) -> Result<Workspace, String> {
    let manager = lock_workspace_manager(state)?;
    let mut active = lock_active_workspace(state)?;
    if let Some(workspace) = active.clone() {
        return Ok(workspace);
    }
    let workspace = map_err(manager.create_workspace())?;
    eprintln!("Created workspace {}", workspace.id);
    *active = Some(workspace.clone());
    Ok(workspace)
}

pub(crate) fn set_active_workspace(
    state: &SharedState,
    workspace: Workspace,
) -> Result<(), String> {
    let mut active = lock_active_workspace(state)?;
    *active = Some(workspace);
    Ok(())
}

pub(crate) fn clear_active_workspace_if(
    state: &SharedState,
    predicate: impl FnOnce(&Workspace) -> bool,
) -> Result<(), String> {
    let mut active = lock_active_workspace(state)?;
    if active.as_ref().is_some_and(predicate) {
        *active = None;
    }
    Ok(())
}

pub(crate) fn delete_workspaces_for_runtime(
    state: &SharedState,
    runtime_id: &str,
) -> Result<(), String> {
    let deleted_ids = {
        let manager = lock_workspace_manager(state)?;
        map_err(manager.delete_workspaces_for_runtime(runtime_id))?
    };
    clear_active_workspace_if(state, |current| deleted_ids.contains(&current.id))
}

pub fn list_workspaces(
    state: &SharedState,
    runtime_id: Option<&str>,
) -> Result<Vec<WorkspaceInfo>, String> {
    let manager = lock_workspace_manager(state)?;
    map_err(manager.list_workspaces_for_runtime(runtime_id))
}

pub fn open_workspace(state: &SharedState, id: &str) -> Result<WorkspaceInfo, String> {
    let manager = lock_workspace_manager(state)?;
    let workspace = map_err(manager.open_workspace(id))?;
    let info = map_err(manager.workspace_info(&workspace))?;
    cleanup_workspace_artifacts(&workspace.path, &info.runtime_id);
    set_active_workspace(state, workspace)?;
    Ok(info)
}

pub fn create_workspace(
    state: &SharedState,
    name: &str,
    runtime_id: &str,
) -> Result<WorkspaceInfo, String> {
    let manager = lock_workspace_manager(state)?;
    let workspace = map_err(manager.create_named_workspace(name, runtime_id))?;
    let info = map_err(manager.workspace_info(&workspace))?;
    set_active_workspace(state, workspace)?;
    Ok(info)
}

pub fn get_active_workspace(state: &SharedState) -> Result<Option<WorkspaceInfo>, String> {
    let manager = lock_workspace_manager(state)?;
    let active = lock_active_workspace(state)?;
    match active.as_ref() {
        Some(workspace) => Ok(Some(map_err(manager.workspace_info(workspace))?)),
        None => Ok(None),
    }
}

pub fn list_files(
    state: &SharedState,
    relative_path: Option<&str>,
    workspace_id: Option<&str>,
) -> Result<Vec<FileEntry>, String> {
    let manager = lock_workspace_manager(state)?;
    let workspace = resolve_workspace(state, &manager, workspace_id)?;
    map_err(manager.list_files(&workspace, relative_path))
}

pub fn read_file(state: &SharedState, path: &str) -> Result<String, String> {
    let manager = lock_workspace_manager(state)?;
    let workspace = require_active_workspace(state)?;
    map_err(manager.read_file(&workspace, path))
}

pub fn write_file(state: &SharedState, path: &str, content: &str) -> Result<(), String> {
    let manager = lock_workspace_manager(state)?;
    let workspace = require_active_workspace(state)?;
    map_err(manager.write_file(&workspace, path, content))?;
    Ok(())
}

pub fn delete_file(state: &SharedState, path: &str) -> Result<(), String> {
    let manager = lock_workspace_manager(state)?;
    let workspace = require_active_workspace(state)?;
    map_err(manager.delete_file(&workspace, path))
}

pub fn rename_file(state: &SharedState, old_path: &str, new_path: &str) -> Result<(), String> {
    let manager = lock_workspace_manager(state)?;
    let workspace = require_active_workspace(state)?;
    map_err(manager.rename_file(&workspace, old_path, new_path))
}

pub fn import_external(
    state: &SharedState,
    source_paths: &[String],
    target_dir: Option<&str>,
) -> Result<Vec<String>, String> {
    let manager = lock_workspace_manager(state)?;
    let workspace = require_active_workspace(state)?;
    map_err(manager.import_external(&workspace, source_paths, target_dir))
}

pub fn create_directory(state: &SharedState, path: &str) -> Result<(), String> {
    let manager = lock_workspace_manager(state)?;
    let workspace = require_active_workspace(state)?;
    map_err(manager.create_directory(&workspace, path))
}

pub fn read_session(state: &SharedState) -> Result<SessionData, String> {
    let manager = lock_workspace_manager(state)?;
    map_err(manager.load_session())
}

pub fn write_session(state: &SharedState, session: &SessionData) -> Result<(), String> {
    let manager = lock_workspace_manager(state)?;
    map_err(manager.save_session(session))
}

pub fn delete_workspace(state: &SharedState, id: &str) -> Result<(), String> {
    let manager = lock_workspace_manager(state)?;
    map_err(manager.delete_workspace(id))?;

    let mut session = map_err(manager.load_session())?;
    map_err(manager.purge_workspace_from_session(&mut session, id))?;
    clear_active_workspace_if(state, |current| current.id == id)?;
    Ok(())
}

pub fn rename_workspace(
    state: &SharedState,
    id: &str,
    name: &str,
) -> Result<WorkspaceInfo, String> {
    let trimmed = name.trim();
    if trimmed.is_empty() {
        return Err("Project name cannot be empty".to_string());
    }

    let manager = lock_workspace_manager(state)?;
    let workspace = map_err(manager.open_workspace(id))?;
    let mut manifest = map_err(manager.read_manifest(&workspace))?;
    manifest.name = trimmed.to_string();
    manifest.updated_at = chrono::Utc::now().to_rfc3339();
    map_err(manager.write_manifest(&workspace, &manifest))?;
    let info = map_err(manager.workspace_info(&workspace))?;

    if let Ok(mut active) = lock_active_workspace(state) {
        if active.as_ref().is_some_and(|current| current.id == id) {
            *active = Some(workspace);
        }
    }

    Ok(info)
}

pub fn update_manifest(state: &SharedState, name: Option<&str>) -> Result<WorkspaceInfo, String> {
    let manager = lock_workspace_manager(state)?;
    let workspace = require_active_workspace(state)?;
    let mut manifest = map_err(manager.read_manifest(&workspace))?;

    if let Some(next_name) = name {
        let trimmed = next_name.trim();
        if trimmed.is_empty() {
            return Err("Project name cannot be empty".to_string());
        }
        manifest.name = trimmed.to_string();
    }
    manifest.updated_at = chrono::Utc::now().to_rfc3339();

    map_err(manager.write_manifest(&workspace, &manifest))?;
    map_err(manager.workspace_info(&workspace))
}

pub fn initialize_workspace(
    state: &SharedState,
    runtime_id: &str,
    use_session: bool,
) -> Result<WorkspaceInfo, String> {
    let manager = lock_workspace_manager(state)?;
    let session = map_err(manager.load_session())?;
    let (workspace, info) =
        map_err(manager.initialize_active_workspace(runtime_id, &session, use_session))?;
    set_active_workspace(state, workspace)?;
    Ok(info)
}

fn resolve_workspace(
    state: &SharedState,
    manager: &crate::workspace::WorkspaceManager,
    workspace_id: Option<&str>,
) -> Result<Workspace, String> {
    match workspace_id {
        Some(id) => map_err(manager.open_workspace(id)),
        None => require_active_workspace(state),
    }
}
