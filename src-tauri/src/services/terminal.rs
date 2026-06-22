use serde_json::{json, Value};
use tauri::AppHandle;

use crate::environment::catalog::get_definition;
use crate::error::lock_err;
use crate::services::environment::resolve_for_execution;
use crate::services::workspace::require_active_workspace;
use crate::state::SharedState;
use crate::terminal::{build_shell_context, make_emitter, TerminalManager};

fn lock_terminal_manager(
    state: &SharedState,
) -> Result<std::sync::MutexGuard<'_, TerminalManager>, String> {
    lock_err(state.terminal_manager.lock(), "Terminal manager")
}

pub async fn spawn_terminal(
    state: &SharedState,
    app: Option<AppHandle>,
    environment_id: &str,
) -> Result<Value, String> {
    let workspace = require_active_workspace(state)?;
    let resolved = resolve_for_execution(state, environment_id)?;

    if get_definition(environment_id).is_none() {
        return Err(format!("Environment not found: {environment_id}"));
    }

    let context = build_shell_context(&resolved, &workspace)?;
    let emitter = make_emitter(app, state.terminal_events.clone());
    let mut terminal_manager = lock_terminal_manager(state)?;
    let result = terminal_manager.spawn(context, emitter)?;

    Ok(json!({
        "sessionId": result.session_id,
        "workspaceId": workspace.id,
        "environmentId": environment_id,
    }))
}

pub fn write_terminal(state: &SharedState, session_id: &str, data: &str) -> Result<Value, String> {
    lock_terminal_manager(state)?.write(session_id, data)?;
    Ok(Value::Null)
}

pub fn resize_terminal(
    state: &SharedState,
    session_id: &str,
    cols: u16,
    rows: u16,
) -> Result<Value, String> {
    lock_terminal_manager(state)?.resize(session_id, cols, rows)?;
    Ok(Value::Null)
}

pub fn close_terminal(state: &SharedState, session_id: &str) -> Result<Value, String> {
    lock_terminal_manager(state)?.close(session_id)?;
    Ok(Value::Null)
}

pub fn list_terminal_sessions(state: &SharedState) -> Result<Value, String> {
    Ok(json!(lock_terminal_manager(state)?.list_sessions()))
}
