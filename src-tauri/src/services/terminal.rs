use serde_json::{json, Value};
use tauri::AppHandle;

use crate::environment::catalog::get_definition;
use crate::state::SharedState;
use crate::terminal::{build_shell_context, make_emitter};

pub async fn spawn_terminal(
    state: &SharedState,
    app: Option<AppHandle>,
    environment_id: &str,
) -> Result<Value, String> {
    let workspace = {
        let guard = state
            .active_workspace
            .lock()
            .map_err(|_| "Active workspace lock poisoned".to_string())?;
        guard
            .clone()
            .ok_or_else(|| "No active workspace. Create or open a project first.".to_string())?
    };

    let resolved = {
        let manager = state
            .environment_manager
            .lock()
            .map_err(|_| "Environment manager lock poisoned".to_string())?;
        manager
            .resolve_for_execution(environment_id)
            .map_err(|error| error.to_string())?
    };

    if get_definition(environment_id).is_none() {
        return Err(format!("Environment not found: {environment_id}"));
    }

    let context = build_shell_context(&resolved, &workspace)?;
    let emitter = make_emitter(app, state.terminal_events.clone());

    let result = {
        let mut terminal_manager = state
            .terminal_manager
            .lock()
            .map_err(|_| "Terminal manager lock poisoned".to_string())?;
        terminal_manager.spawn(context, emitter)?
    };

    Ok(json!({
        "sessionId": result.session_id,
        "workspaceId": workspace.id,
        "environmentId": environment_id,
    }))
}

pub fn write_terminal(state: &SharedState, session_id: &str, data: &str) -> Result<Value, String> {
    let terminal_manager = state
        .terminal_manager
        .lock()
        .map_err(|_| "Terminal manager lock poisoned".to_string())?;
    terminal_manager.write(session_id, data)?;
    Ok(Value::Null)
}

pub fn resize_terminal(
    state: &SharedState,
    session_id: &str,
    cols: u16,
    rows: u16,
) -> Result<Value, String> {
    let terminal_manager = state
        .terminal_manager
        .lock()
        .map_err(|_| "Terminal manager lock poisoned".to_string())?;
    terminal_manager.resize(session_id, cols, rows)?;
    Ok(Value::Null)
}

pub fn close_terminal(state: &SharedState, session_id: &str) -> Result<Value, String> {
    let mut terminal_manager = state
        .terminal_manager
        .lock()
        .map_err(|_| "Terminal manager lock poisoned".to_string())?;
    terminal_manager.close(session_id)?;
    Ok(Value::Null)
}

pub fn list_terminal_sessions(state: &SharedState) -> Result<Value, String> {
    let terminal_manager = state
        .terminal_manager
        .lock()
        .map_err(|_| "Terminal manager lock poisoned".to_string())?;
    Ok(json!(terminal_manager.list_sessions()))
}

#[cfg(test)]
mod tests {
    use crate::terminal::SpawnTerminalResult;

    #[test]
    fn spawn_terminal_result_shape_is_documented() {
        let result = SpawnTerminalResult {
            session_id: "session-1".to_string(),
        };
        assert_eq!(result.session_id, "session-1");
    }
}
