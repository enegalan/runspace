use serde_json::json;
use tauri::{AppHandle, State};

use crate::services::invoke::dispatch_invoke;
use crate::state::SharedState;

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
    dispatch_invoke(
        &state,
        Some(app),
        "execute_code",
        json!({
            "code": code,
            "environmentId": environment_id,
            "file": file,
            "timeoutSecs": timeout_secs,
            "compileTimeoutSecs": compile_timeout_secs,
        }),
    )
    .await?;
    Ok(())
}

#[tauri::command]
pub async fn kill_process(state: State<'_, SharedState>) -> Result<(), String> {
    dispatch_invoke(&state, None, "kill_process", json!({})).await?;
    Ok(())
}
