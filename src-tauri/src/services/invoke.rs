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
    code: String,
    #[serde(rename = "environmentId")]
    environment_id: Option<String>,
    #[serde(rename = "timeoutSecs")]
    timeout_secs: Option<u64>,
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
            let environment = manager
                .get_selected()
                .ok_or_else(|| "No selected environment".to_string())?;
            Ok(json!(environment))
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
            let mut manager = state
                .environment_manager
                .lock()
                .map_err(|_| "Environment manager lock poisoned".to_string())?;
            manager
                .uninstall(&args.environment_id)
                .map_err(|e| e.to_string())?;
            Ok(Value::Null)
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
                    args.timeout_secs,
                )?;
            } else {
                start_execution_http(
                    state,
                    args.code,
                    args.environment_id,
                    args.timeout_secs,
                )?;
            }
            Ok(Value::Null)
        }
        "kill_process" => {
            state
                .execution_engine
                .kill()
                .map_err(|e| e.to_string())?;
            Ok(Value::Null)
        }
        _ => Err(format!("Unknown command: {cmd}")),
    }
}
