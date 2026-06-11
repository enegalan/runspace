use serde_json::Value;
use tauri::State;

use crate::services::invoke::dispatch_invoke;
use crate::settings::AppSettings;
use crate::state::SharedState;

#[tauri::command]
pub async fn read_settings(state: State<'_, SharedState>) -> Result<AppSettings, String> {
    let result = dispatch_invoke(&state, None, "read_settings", serde_json::json!({})).await?;
    serde_json::from_value(result).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_settings(
    state: State<'_, SharedState>,
    patch: Value,
) -> Result<AppSettings, String> {
    let result = dispatch_invoke(&state, None, "update_settings", patch).await?;
    serde_json::from_value(result).map_err(|e| e.to_string())
}
