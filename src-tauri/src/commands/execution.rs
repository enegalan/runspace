use tauri::{AppHandle, State};

use crate::engine::ExecutionRequest;
use crate::runtime::{resolve_binary, script_filename};
use crate::state::AppState;

#[tauri::command]
pub async fn execute_code(
    app: AppHandle,
    state: State<'_, AppState>,
    code: String,
    timeout_secs: Option<u64>,
    runtime: Option<String>,
) -> Result<(), String> {
    let timeout = timeout_secs.unwrap_or(30);
    let runtime_id = runtime.as_deref().unwrap_or("node");

    let _ = state.execution_engine.kill();

    let binary = resolve_binary(runtime_id)?;
    let script_name = script_filename(runtime_id)?;
    let (cwd, script_path) = {
        let workspace_manager = state
            .workspace_manager
            .lock()
            .map_err(|_| "Workspace manager lock poisoned".to_string())?;
        let mut active_workspace = state
            .active_workspace
            .lock()
            .map_err(|_| "Active workspace lock poisoned".to_string())?;

        if active_workspace.is_none() {
            let workspace = workspace_manager
                .create_workspace()
                .map_err(|e| e.to_string())?;
            eprintln!("Created workspace {}", workspace.id);
            *active_workspace = Some(workspace);
        }

        let workspace = active_workspace.as_ref().ok_or("No active workspace")?;
        let script_path = workspace_manager
            .write_file(workspace, script_name, &code)
            .map_err(|e| e.to_string())?;

        (workspace.path.clone(), script_path)
    };

    let request = ExecutionRequest {
        binary,
        script_path,
        cwd,
        timeout_secs: timeout,
    };

    let engine = state.execution_engine.clone();
    tauri::async_runtime::spawn(async move {
        match engine.run(app, request) {
            Ok(result) => {
                if result.timed_out || result.exit_code != Some(0) {
                    eprintln!(
                        "Execution completed: exit_code={:?}, timed_out={}, stdout={} bytes, stderr={} bytes",
                        result.exit_code,
                        result.timed_out,
                        result.stdout.len(),
                        result.stderr.len(),
                    );
                }
            }
            Err(e) => eprintln!("Execution failed: {e}"),
        }
    });

    Ok(())
}

#[tauri::command]
pub async fn kill_process(state: State<'_, AppState>) -> Result<(), String> {
    state
        .execution_engine
        .kill()
        .map_err(|e| e.to_string())
}
