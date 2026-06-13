use serde_json::json;
use tauri::{AppHandle, State};

use crate::services::invoke::dispatch_invoke;
use crate::state::SharedState;

#[tauri::command]
pub async fn spawn_terminal(
    app: AppHandle,
    state: State<'_, SharedState>,
    environment_id: String,
) -> Result<serde_json::Value, String> {
    dispatch_invoke(
        &state,
        Some(app),
        "spawn_terminal",
        json!({ "environmentId": environment_id }),
    )
    .await
}

#[tauri::command]
pub async fn write_terminal(
    state: State<'_, SharedState>,
    session_id: String,
    data: String,
) -> Result<(), String> {
    dispatch_invoke(
        &state,
        None,
        "write_terminal",
        json!({ "sessionId": session_id, "data": data }),
    )
    .await?;
    Ok(())
}

#[tauri::command]
pub async fn resize_terminal(
    state: State<'_, SharedState>,
    session_id: String,
    cols: u16,
    rows: u16,
) -> Result<(), String> {
    dispatch_invoke(
        &state,
        None,
        "resize_terminal",
        json!({ "sessionId": session_id, "cols": cols, "rows": rows }),
    )
    .await?;
    Ok(())
}

#[tauri::command]
pub async fn close_terminal(
    state: State<'_, SharedState>,
    session_id: String,
) -> Result<(), String> {
    dispatch_invoke(
        &state,
        None,
        "close_terminal",
        json!({ "sessionId": session_id }),
    )
    .await?;
    Ok(())
}

#[tauri::command]
pub async fn list_terminal_sessions(
    state: State<'_, SharedState>,
) -> Result<serde_json::Value, String> {
    dispatch_invoke(&state, None, "list_terminal_sessions", json!({})).await
}
