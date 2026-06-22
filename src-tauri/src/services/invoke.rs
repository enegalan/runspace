use std::collections::HashMap;

use serde::Deserialize;
use serde_json::{json, Value};
use tauri::AppHandle;

use crate::services::environment::{
    get_selected, install, list_available, list_installed, set_env_vars, set_paths, set_selected,
    uninstall, validate,
};
use crate::services::execution::{kill_process, start_execution};
use crate::services::settings::{read_settings, update_settings};
use crate::services::workspace::{
    create_directory, create_workspace, delete_file, delete_workspace, get_active_workspace,
    import_external, initialize_workspace, list_files, list_workspaces, open_workspace, read_file,
    read_session, rename_file, rename_workspace, update_manifest, write_file, write_session,
};
use crate::state::SharedState;

#[derive(Debug, Deserialize)]
struct ExecuteArgs {
    code: Option<String>,
    #[serde(rename = "environmentId")]
    environment_id: Option<String>,
    file: Option<String>,
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

fn str_arg(args: &Value, key: &str) -> Result<String, String> {
    args.get(key)
        .and_then(|v| v.as_str())
        .map(|s| s.to_string())
        .ok_or_else(|| format!("Missing {key}"))
}

fn opt_str_arg<'a>(args: &'a Value, key: &str) -> Option<&'a str> {
    args.get(key).and_then(|v| v.as_str())
}

fn u16_arg(args: &Value, key: &str) -> Result<u16, String> {
    args.get(key)
        .and_then(|v| v.as_u64())
        .map(|v| v as u16)
        .ok_or_else(|| format!("Missing {key}"))
}

pub async fn dispatch_invoke(
    state: &SharedState,
    app: Option<AppHandle>,
    cmd: &str,
    args: Value,
) -> Result<Value, String> {
    match cmd {
        "list_environments" => Ok(json!(list_installed(state)?)),
        "list_available_environments" => Ok(json!(list_available(state)?)),
        "get_selected_environment" => Ok(match get_selected(state)? {
            Some(environment) => json!(environment),
            None => Value::Null,
        }),
        "install_environment" => {
            let args: EnvironmentIdArgs = serde_json::from_value(args)
                .map_err(|e| format!("Invalid install_environment args: {e}"))?;
            install(state, &args.environment_id)?;
            Ok(Value::Null)
        }
        "uninstall_environment" => {
            let args: EnvironmentIdArgs = serde_json::from_value(args)
                .map_err(|e| format!("Invalid uninstall_environment args: {e}"))?;
            uninstall(state, &args.environment_id)?;
            Ok(Value::Null)
        }
        "set_selected_environment" => {
            let args: EnvironmentIdArgs = serde_json::from_value(args)
                .map_err(|e| format!("Invalid set_selected_environment args: {e}"))?;
            set_selected(state, &args.environment_id)?;
            Ok(Value::Null)
        }
        "set_environment_paths" => {
            let args: SetPathsArgs = serde_json::from_value(args)
                .map_err(|e| format!("Invalid set_environment_paths args: {e}"))?;
            set_paths(state, &args.environment_id, args.paths)?;
            Ok(Value::Null)
        }
        "set_environment_env_vars" => {
            let args: SetEnvVarsArgs = serde_json::from_value(args)
                .map_err(|e| format!("Invalid set_environment_env_vars args: {e}"))?;
            set_env_vars(state, &args.environment_id, args.env_vars)?;
            Ok(Value::Null)
        }
        "validate_environment" => {
            let args: EnvironmentIdArgs = serde_json::from_value(args)
                .map_err(|e| format!("Invalid validate_environment args: {e}"))?;
            Ok(json!(validate(state, &args.environment_id)?))
        }
        "read_settings" => Ok(json!(read_settings(state)?)),
        "update_settings" => Ok(json!(update_settings(state, args)?)),
        "execute_code" => {
            let args: ExecuteArgs = serde_json::from_value(args)
                .map_err(|e| format!("Invalid execute_code args: {e}"))?;
            start_execution(
                state,
                app,
                args.code,
                args.environment_id,
                args.file,
                args.timeout_secs,
                args.compile_timeout_secs,
            )?;
            Ok(Value::Null)
        }
        "kill_process" => {
            kill_process(state)?;
            Ok(Value::Null)
        }
        "list_workspaces" => {
            let runtime_id = opt_str_arg(&args, "runtimeId");
            Ok(json!(list_workspaces(state, runtime_id)?))
        }
        "open_workspace" => Ok(json!(open_workspace(state, &str_arg(&args, "id")?)?)),
        "create_workspace" => {
            let name = opt_str_arg(&args, "name").unwrap_or("Untitled");
            let runtime_id = str_arg(&args, "runtimeId")?;
            Ok(json!(create_workspace(state, name, &runtime_id)?))
        }
        "get_active_workspace" => Ok(match get_active_workspace(state)? {
            Some(info) => json!(info),
            None => Value::Null,
        }),
        "initialize_workspace" => {
            let runtime_id = str_arg(&args, "runtimeId")?;
            let use_session = args
                .get("useSession")
                .and_then(|v| v.as_bool())
                .unwrap_or(true);
            Ok(json!(initialize_workspace(
                state,
                &runtime_id,
                use_session
            )?))
        }
        "list_files" => {
            let relative_path = opt_str_arg(&args, "relativePath");
            let workspace_id = opt_str_arg(&args, "id");
            Ok(json!(list_files(state, relative_path, workspace_id)?))
        }
        "read_file" => Ok(json!(read_file(state, &str_arg(&args, "path")?)?)),
        "write_file" => {
            write_file(state, &str_arg(&args, "path")?, &str_arg(&args, "content")?)?;
            Ok(Value::Null)
        }
        "delete_file" => {
            delete_file(state, &str_arg(&args, "path")?)?;
            Ok(Value::Null)
        }
        "rename_file" => {
            rename_file(
                state,
                &str_arg(&args, "oldPath")?,
                &str_arg(&args, "newPath")?,
            )?;
            Ok(Value::Null)
        }
        "create_directory" => {
            create_directory(state, &str_arg(&args, "path")?)?;
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
            let target_dir = opt_str_arg(&args, "targetDir");
            Ok(json!(import_external(state, &source_paths, target_dir)?))
        }
        "read_session" => Ok(json!(read_session(state)?)),
        "write_session" => {
            let payload = args.get("session").cloned().unwrap_or(args);
            let session: crate::workspace::SessionData = serde_json::from_value(payload)
                .map_err(|e| format!("Invalid write_session args: {e}"))?;
            write_session(state, &session)?;
            Ok(Value::Null)
        }
        "delete_workspace" => {
            delete_workspace(state, &str_arg(&args, "id")?)?;
            Ok(Value::Null)
        }
        "rename_workspace" => Ok(json!(rename_workspace(
            state,
            &str_arg(&args, "id")?,
            &str_arg(&args, "name")?,
        )?)),
        "update_manifest" => {
            let name = opt_str_arg(&args, "name");
            Ok(json!(update_manifest(state, name)?))
        }
        "spawn_terminal" => {
            let args: EnvironmentIdArgs = serde_json::from_value(args)
                .map_err(|e| format!("Invalid spawn_terminal args: {e}"))?;
            crate::services::terminal::spawn_terminal(state, app, &args.environment_id).await
        }
        "write_terminal" => crate::services::terminal::write_terminal(
            state,
            &str_arg(&args, "sessionId")?,
            &str_arg(&args, "data")?,
        ),
        "resize_terminal" => crate::services::terminal::resize_terminal(
            state,
            &str_arg(&args, "sessionId")?,
            u16_arg(&args, "cols")?,
            u16_arg(&args, "rows")?,
        ),
        "close_terminal" => {
            crate::services::terminal::close_terminal(state, &str_arg(&args, "sessionId")?)
        }
        "list_terminal_sessions" => crate::services::terminal::list_terminal_sessions(state),
        _ => Err(format!("Unknown command: {cmd}")),
    }
}
