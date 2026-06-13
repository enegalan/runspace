use std::collections::HashMap;

use serde::Deserialize;
use serde_json::{json, Value};
use tauri::AppHandle;

use crate::commands::snippet::{read_snippet, write_snippet, SnippetData};
use crate::engine::adapters::get_adapter;
use crate::services::execution::{start_execution_http, start_execution_tauri};
use crate::state::SharedState;

#[derive(Debug, Deserialize)]
struct ExecuteArgs {
    code: Option<String>,
    #[serde(rename = "environmentId")]
    environment_id: Option<String>,
    #[serde(rename = "entryFile")]
    entry_file: Option<String>,
    #[serde(rename = "timeoutSecs")]
    timeout_secs: Option<u64>,
    #[serde(rename = "compileTimeoutSecs")]
    compile_timeout_secs: Option<u64>,
}

#[derive(Debug, Deserialize)]
struct EnvironmentIdArgs {
    #[serde(rename = "environmentId")]
    environment_id: String,
}

#[derive(Debug, Deserialize)]
struct SetPathsArgs {
    #[serde(rename = "environmentId")]
    environment_id: String,
    paths: HashMap<String, String>,
}

#[derive(Debug, Deserialize)]
struct SetEnvVarsArgs {
    #[serde(rename = "environmentId")]
    environment_id: String,
    #[serde(rename = "envVars")]
    env_vars: HashMap<String, String>,
}

#[derive(Debug, Deserialize)]
struct WriteSnippetArgs {
    data: SnippetData,
}

pub async fn dispatch_invoke(
    state: &SharedState,
    app: Option<AppHandle>,
    cmd: &str,
    args: Value,
) -> Result<Value, String> {
    match cmd {
        "list_environments" => {
            let manager = state
                .environment_manager
                .lock()
                .map_err(|_| "Environment manager lock poisoned".to_string())?;
            Ok(json!(manager.list_installed()))
        }
        "list_available_environments" => {
            let manager = state
                .environment_manager
                .lock()
                .map_err(|_| "Environment manager lock poisoned".to_string())?;
            Ok(json!(manager.list_available()))
        }
        "get_selected_environment" => {
            let manager = state
                .environment_manager
                .lock()
                .map_err(|_| "Environment manager lock poisoned".to_string())?;
            Ok(match manager.get_selected() {
                Some(environment) => json!(environment),
                None => Value::Null,
            })
        }
        "install_environment" => {
            let args: EnvironmentIdArgs = serde_json::from_value(args)
                .map_err(|e| format!("Invalid install_environment args: {e}"))?;
            let mut manager = state
                .environment_manager
                .lock()
                .map_err(|_| "Environment manager lock poisoned".to_string())?;
            manager
                .install(&args.environment_id)
                .map_err(|e| e.to_string())?;
            Ok(Value::Null)
        }
        "uninstall_environment" => {
            let args: EnvironmentIdArgs = serde_json::from_value(args)
                .map_err(|e| format!("Invalid uninstall_environment args: {e}"))?;
            uninstall_environment(state, &args.environment_id)
        }
        "set_selected_environment" => {
            let args: EnvironmentIdArgs = serde_json::from_value(args)
                .map_err(|e| format!("Invalid set_selected_environment args: {e}"))?;
            let mut manager = state
                .environment_manager
                .lock()
                .map_err(|_| "Environment manager lock poisoned".to_string())?;
            manager
                .set_selected(&args.environment_id)
                .map_err(|e| e.to_string())?;
            Ok(Value::Null)
        }
        "set_environment_paths" => {
            let args: SetPathsArgs = serde_json::from_value(args)
                .map_err(|e| format!("Invalid set_environment_paths args: {e}"))?;
            let mut manager = state
                .environment_manager
                .lock()
                .map_err(|_| "Environment manager lock poisoned".to_string())?;
            manager
                .set_paths(&args.environment_id, args.paths)
                .map_err(|e| e.to_string())?;
            Ok(Value::Null)
        }
        "set_environment_env_vars" => {
            let args: SetEnvVarsArgs = serde_json::from_value(args)
                .map_err(|e| format!("Invalid set_environment_env_vars args: {e}"))?;
            let mut manager = state
                .environment_manager
                .lock()
                .map_err(|_| "Environment manager lock poisoned".to_string())?;
            manager
                .set_env_vars(&args.environment_id, args.env_vars)
                .map_err(|e| e.to_string())?;
            Ok(Value::Null)
        }
        "validate_environment" => {
            let args: EnvironmentIdArgs = serde_json::from_value(args)
                .map_err(|e| format!("Invalid validate_environment args: {e}"))?;
            let mut manager = state
                .environment_manager
                .lock()
                .map_err(|_| "Environment manager lock poisoned".to_string())?;
            let result = manager
                .validate_environment(&args.environment_id)
                .map_err(|e| e.to_string())?;
            Ok(json!(result))
        }
        "read_settings" => {
            let manager = state
                .settings_manager
                .lock()
                .map_err(|_| "Settings manager lock poisoned".to_string())?;
            Ok(json!(manager.get().clone()))
        }
        "update_settings" => {
            let mut manager = state
                .settings_manager
                .lock()
                .map_err(|_| "Settings manager lock poisoned".to_string())?;
            let updated = manager
                .update(args)
                .map_err(|e| e.to_string())?;
            Ok(json!(updated))
        }
        "read_snippet" => Ok(json!(read_snippet()?)),
        "write_snippet" => {
            let args: WriteSnippetArgs = serde_json::from_value(args)
                .map_err(|e| format!("Invalid write_snippet args: {e}"))?;
            write_snippet(args.data)?;
            Ok(Value::Null)
        }
        "get_runtime_template" => {
            let args: EnvironmentIdArgs = serde_json::from_value(args)
                .map_err(|e| format!("Invalid get_runtime_template args: {e}"))?;
            let adapter = get_adapter(&args.environment_id).map_err(|e| e.to_string())?;
            Ok(json!(adapter.default_template()))
        }
        "execute_code" => {
            let args: ExecuteArgs = serde_json::from_value(args)
                .map_err(|e| format!("Invalid execute_code args: {e}"))?;
            if let Some(app) = app {
                start_execution_tauri(
                    state,
                    app,
                    args.code,
                    args.environment_id,
                    args.entry_file,
                    args.timeout_secs,
                    args.compile_timeout_secs,
                )?;
            } else {
                start_execution_http(
                    state,
                    args.code,
                    args.environment_id,
                    args.entry_file,
                    args.timeout_secs,
                    args.compile_timeout_secs,
                )?;
            }
            Ok(Value::Null)
        }
        "list_workspaces" => {
            let runtime_id = args
                .get("runtimeId")
                .and_then(|v| v.as_str())
                .map(|s| s.to_string());
            let manager = state
                .workspace_manager
                .lock()
                .map_err(|_| "Workspace manager lock poisoned".to_string())?;
            Ok(json!(
                manager
                    .list_workspaces_for_runtime(runtime_id.as_deref())
                    .map_err(|e| e.to_string())?
            ))
        }
        "open_workspace" => {
            let id: String = args
                .get("id")
                .and_then(|v| v.as_str())
                .ok_or("Missing workspace id")?
                .to_string();
            let manager = state
                .workspace_manager
                .lock()
                .map_err(|_| "Workspace manager lock poisoned".to_string())?;
            let workspace = manager.open_workspace(&id).map_err(|e| e.to_string())?;
            let info = manager.workspace_info(&workspace).map_err(|e| e.to_string())?;
            {
                let mut active = state
                    .active_workspace
                    .lock()
                    .map_err(|_| "Active workspace lock poisoned".to_string())?;
                *active = Some(workspace);
            }
            Ok(json!(info))
        }
        "create_workspace" => {
            let name = args
                .get("name")
                .and_then(|v| v.as_str())
                .unwrap_or("Untitled")
                .to_string();
            let runtime_id = args
                .get("runtimeId")
                .and_then(|v| v.as_str())
                .ok_or("Missing runtimeId")?
                .to_string();
            let manager = state
                .workspace_manager
                .lock()
                .map_err(|_| "Workspace manager lock poisoned".to_string())?;
            let workspace = manager
                .create_named_workspace(&name, &runtime_id)
                .map_err(|e| e.to_string())?;
            let info = manager.workspace_info(&workspace).map_err(|e| e.to_string())?;
            {
                let mut active = state
                    .active_workspace
                    .lock()
                    .map_err(|_| "Active workspace lock poisoned".to_string())?;
                *active = Some(workspace);
            }
            Ok(json!(info))
        }
        "get_active_workspace" => {
            let manager = state
                .workspace_manager
                .lock()
                .map_err(|_| "Workspace manager lock poisoned".to_string())?;
            let active = state
                .active_workspace
                .lock()
                .map_err(|_| "Active workspace lock poisoned".to_string())?;
            match active.as_ref() {
                Some(workspace) => {
                    let info = manager.workspace_info(workspace).map_err(|e| e.to_string())?;
                    Ok(json!(info))
                }
                None => Ok(Value::Null),
            }
        }
        "initialize_workspace" => {
            let runtime_id = args
                .get("runtimeId")
                .and_then(|v| v.as_str())
                .ok_or("Missing runtimeId")?
                .to_string();
            let use_session = args
                .get("useSession")
                .and_then(|v| v.as_bool())
                .unwrap_or(true);
            let manager = state
                .workspace_manager
                .lock()
                .map_err(|_| "Workspace manager lock poisoned".to_string())?;
            let session = manager.load_session().map_err(|e| e.to_string())?;
            let (workspace, info) = manager
                .initialize_active_workspace(&runtime_id, &session, use_session)
                .map_err(|e| e.to_string())?;
            {
                let mut active = state
                    .active_workspace
                    .lock()
                    .map_err(|_| "Active workspace lock poisoned".to_string())?;
                *active = Some(workspace);
            }
            Ok(json!(info))
        }
        "list_files" => {
            let relative_path = args
                .get("relativePath")
                .and_then(|v| v.as_str())
                .map(|s| s.to_string());
            let manager = state
                .workspace_manager
                .lock()
                .map_err(|_| "Workspace manager lock poisoned".to_string())?;
            let active = state
                .active_workspace
                .lock()
                .map_err(|_| "Active workspace lock poisoned".to_string())?;
            let workspace = active
                .as_ref()
                .ok_or_else(|| "No active workspace".to_string())?;
            let files = manager
                .list_files(workspace, relative_path.as_deref())
                .map_err(|e| e.to_string())?;
            Ok(json!(files))
        }
        "read_file" => {
            let path = args
                .get("path")
                .and_then(|v| v.as_str())
                .ok_or("Missing path")?
                .to_string();
            let manager = state
                .workspace_manager
                .lock()
                .map_err(|_| "Workspace manager lock poisoned".to_string())?;
            let active = state
                .active_workspace
                .lock()
                .map_err(|_| "Active workspace lock poisoned".to_string())?;
            let workspace = active
                .as_ref()
                .ok_or_else(|| "No active workspace".to_string())?;
            let content = manager
                .read_file(workspace, &path)
                .map_err(|e| e.to_string())?;
            Ok(json!(content))
        }
        "write_file" => {
            let path = args
                .get("path")
                .and_then(|v| v.as_str())
                .ok_or("Missing path")?
                .to_string();
            let content = args
                .get("content")
                .and_then(|v| v.as_str())
                .ok_or("Missing content")?
                .to_string();
            let manager = state
                .workspace_manager
                .lock()
                .map_err(|_| "Workspace manager lock poisoned".to_string())?;
            let active = state
                .active_workspace
                .lock()
                .map_err(|_| "Active workspace lock poisoned".to_string())?;
            let workspace = active
                .as_ref()
                .ok_or_else(|| "No active workspace".to_string())?;
            manager
                .write_file(workspace, &path, &content)
                .map_err(|e| e.to_string())?;
            Ok(Value::Null)
        }
        "delete_file" => {
            let path = args
                .get("path")
                .and_then(|v| v.as_str())
                .ok_or("Missing path")?
                .to_string();
            let manager = state
                .workspace_manager
                .lock()
                .map_err(|_| "Workspace manager lock poisoned".to_string())?;
            let active = state
                .active_workspace
                .lock()
                .map_err(|_| "Active workspace lock poisoned".to_string())?;
            let workspace = active
                .as_ref()
                .ok_or_else(|| "No active workspace".to_string())?;
            manager
                .delete_file(workspace, &path)
                .map_err(|e| e.to_string())?;
            Ok(Value::Null)
        }
        "rename_file" => {
            let old_path = args
                .get("oldPath")
                .and_then(|v| v.as_str())
                .ok_or("Missing oldPath")?
                .to_string();
            let new_path = args
                .get("newPath")
                .and_then(|v| v.as_str())
                .ok_or("Missing newPath")?
                .to_string();
            let manager = state
                .workspace_manager
                .lock()
                .map_err(|_| "Workspace manager lock poisoned".to_string())?;
            let active = state
                .active_workspace
                .lock()
                .map_err(|_| "Active workspace lock poisoned".to_string())?;
            let workspace = active
                .as_ref()
                .ok_or_else(|| "No active workspace".to_string())?;
            manager
                .rename_file(workspace, &old_path, &new_path)
                .map_err(|e| e.to_string())?;
            Ok(Value::Null)
        }
        "create_directory" => {
            let path = args
                .get("path")
                .and_then(|v| v.as_str())
                .ok_or("Missing path")?
                .to_string();
            let manager = state
                .workspace_manager
                .lock()
                .map_err(|_| "Workspace manager lock poisoned".to_string())?;
            let active = state
                .active_workspace
                .lock()
                .map_err(|_| "Active workspace lock poisoned".to_string())?;
            let workspace = active
                .as_ref()
                .ok_or_else(|| "No active workspace".to_string())?;
            manager
                .create_directory(workspace, &path)
                .map_err(|e| e.to_string())?;
            Ok(Value::Null)
        }
        "import_external" => {
            let source_paths = args
                .get("sourcePaths")
                .and_then(|v| v.as_array())
                .ok_or("Missing sourcePaths")?
                .iter()
                .filter_map(|value| value.as_str().map(|path| path.to_string()))
                .collect::<Vec<_>>();
            if source_paths.is_empty() {
                return Err("Missing sourcePaths".to_string());
            }
            let target_dir = args
                .get("targetDir")
                .and_then(|v| v.as_str())
                .map(|value| value.to_string());
            let manager = state
                .workspace_manager
                .lock()
                .map_err(|_| "Workspace manager lock poisoned".to_string())?;
            let active = state
                .active_workspace
                .lock()
                .map_err(|_| "Active workspace lock poisoned".to_string())?;
            let workspace = active
                .as_ref()
                .ok_or_else(|| "No active workspace".to_string())?;
            let imported = manager
                .import_external(workspace, &source_paths, target_dir.as_deref())
                .map_err(|e| e.to_string())?;
            Ok(json!(imported))
        }
        "read_session" => {
            let manager = state
                .workspace_manager
                .lock()
                .map_err(|_| "Workspace manager lock poisoned".to_string())?;
            Ok(json!(manager.load_session().map_err(|e| e.to_string())?))
        }
        "delete_workspace" => {
            let id = args
                .get("id")
                .and_then(|v| v.as_str())
                .ok_or("Missing workspace id")?
                .to_string();
            let manager = state
                .workspace_manager
                .lock()
                .map_err(|_| "Workspace manager lock poisoned".to_string())?;
            manager
                .delete_workspace(&id)
                .map_err(|e| e.to_string())?;
            let mut session = manager.load_session().map_err(|e| e.to_string())?;
            manager
                .purge_workspace_from_session(&mut session, &id)
                .map_err(|e| e.to_string())?;
            {
                let mut active = state
                    .active_workspace
                    .lock()
                    .map_err(|_| "Active workspace lock poisoned".to_string())?;
                if active.as_ref().is_some_and(|current| current.id == id) {
                    *active = None;
                }
            }
            Ok(Value::Null)
        }
        "rename_workspace" => {
            let id = args
                .get("id")
                .and_then(|v| v.as_str())
                .ok_or("Missing workspace id")?
                .to_string();
            let name = args
                .get("name")
                .and_then(|v| v.as_str())
                .ok_or("Missing project name")?
                .to_string();
            let manager = state
                .workspace_manager
                .lock()
                .map_err(|_| "Workspace manager lock poisoned".to_string())?;
            let workspace = manager.open_workspace(&id).map_err(|e| e.to_string())?;
            let trimmed = name.trim();
            if trimmed.is_empty() {
                return Err("Project name cannot be empty".to_string());
            }
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
            {
                let mut active = state
                    .active_workspace
                    .lock()
                    .map_err(|_| "Active workspace lock poisoned".to_string())?;
                if active.as_ref().is_some_and(|current| current.id == id) {
                    *active = Some(workspace);
                }
            }
            Ok(json!(info))
        }
        "update_manifest" => {
            let name = args.get("name").and_then(|v| v.as_str()).map(|s| s.to_string());
            let entry_file = args
                .get("entryFile")
                .and_then(|v| v.as_str())
                .map(|s| s.to_string());
            let manager = state
                .workspace_manager
                .lock()
                .map_err(|_| "Workspace manager lock poisoned".to_string())?;
            let workspace = {
                let active = state
                    .active_workspace
                    .lock()
                    .map_err(|_| "Active workspace lock poisoned".to_string())?;
                active
                    .clone()
                    .ok_or_else(|| "No active workspace".to_string())?
            };
            let mut manifest = manager
                .read_manifest(&workspace)
                .map_err(|e| e.to_string())?;
            if let Some(next_name) = name {
                let trimmed = next_name.trim();
                if trimmed.is_empty() {
                    return Err("Project name cannot be empty".to_string());
                }
                manifest.name = trimmed.to_string();
            }
            if let Some(next_entry) = entry_file {
                manifest.entry_file = next_entry;
            }
            manifest.updated_at = chrono::Utc::now().to_rfc3339();
            manager
                .write_manifest(&workspace, &manifest)
                .map_err(|e| e.to_string())?;
            let info = manager
                .workspace_info(&workspace)
                .map_err(|e| e.to_string())?;
            Ok(json!(info))
        }
        "write_session" => {
            let payload = args
                .get("session")
                .cloned()
                .unwrap_or(args);
            let session: crate::workspace::SessionData = serde_json::from_value(payload)
                .map_err(|e| format!("Invalid write_session args: {e}"))?;
            let manager = state
                .workspace_manager
                .lock()
                .map_err(|_| "Workspace manager lock poisoned".to_string())?;
            manager.save_session(&session).map_err(|e| e.to_string())?;
            Ok(Value::Null)
        }
        "kill_process" => {
            state
                .execution_engine
                .kill()
                .map_err(|e| e.to_string())?;
            Ok(Value::Null)
        }
        "spawn_terminal" => {
            let args: EnvironmentIdArgs = serde_json::from_value(args)
                .map_err(|e| format!("Invalid spawn_terminal args: {e}"))?;
            crate::services::terminal::spawn_terminal(state, app, &args.environment_id).await
        }
        "write_terminal" => {
            let session_id = args
                .get("sessionId")
                .and_then(|value| value.as_str())
                .ok_or_else(|| "Missing sessionId".to_string())?
                .to_string();
            let data = args
                .get("data")
                .and_then(|value| value.as_str())
                .ok_or_else(|| "Missing data".to_string())?
                .to_string();
            crate::services::terminal::write_terminal(state, &session_id, &data)
        }
        "resize_terminal" => {
            let session_id = args
                .get("sessionId")
                .and_then(|value| value.as_str())
                .ok_or_else(|| "Missing sessionId".to_string())?
                .to_string();
            let cols = args
                .get("cols")
                .and_then(|value| value.as_u64())
                .ok_or_else(|| "Missing cols".to_string())? as u16;
            let rows = args
                .get("rows")
                .and_then(|value| value.as_u64())
                .ok_or_else(|| "Missing rows".to_string())? as u16;
            crate::services::terminal::resize_terminal(state, &session_id, cols, rows)
        }
        "close_terminal" => {
            let session_id = args
                .get("sessionId")
                .and_then(|value| value.as_str())
                .ok_or_else(|| "Missing sessionId".to_string())?
                .to_string();
            crate::services::terminal::close_terminal(state, &session_id)
        }
        "list_terminal_sessions" => crate::services::terminal::list_terminal_sessions(state),
        _ => Err(format!("Unknown command: {cmd}")),
    }
}

fn uninstall_environment(state: &SharedState, runtime_id: &str) -> Result<Value, String> {
    {
        let mut manager = state
            .environment_manager
            .lock()
            .map_err(|_| "Environment manager lock poisoned".to_string())?;
        manager.uninstall(runtime_id).map_err(|e| e.to_string())?;
    }

    let deleted_workspace_ids = {
        let manager = state
            .workspace_manager
            .lock()
            .map_err(|_| "Workspace manager lock poisoned".to_string())?;
        manager
            .delete_workspaces_for_runtime(runtime_id)
            .map_err(|e| e.to_string())?
    };

    let mut active = state
        .active_workspace
        .lock()
        .map_err(|_| "Active workspace lock poisoned".to_string())?;
    if active
        .as_ref()
        .is_some_and(|current| deleted_workspace_ids.contains(&current.id))
    {
        *active = None;
    }

    Ok(Value::Null)
}
