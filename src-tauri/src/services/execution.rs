use std::path::PathBuf;

use tauri::AppHandle;

use crate::engine::adapters::{get_adapter, PrepareContext};
use crate::engine::{ExecutionEmitter, ExecutionRequest};
use crate::state::SharedState;

pub fn start_execution(
    state: &SharedState,
    emitter: ExecutionEmitter,
    code: Option<String>,
    environment_id: Option<String>,
    entry_file: Option<String>,
    timeout_secs: Option<u64>,
) -> Result<(), String> {
    let timeout = timeout_secs.unwrap_or(30);

    let resolved = {
        let manager = state
            .environment_manager
            .lock()
            .map_err(|_| "Environment manager lock poisoned".to_string())?;

        let env_id = match environment_id.as_deref() {
            Some(id) => id.to_string(),
            None => manager
                .get_selected()
                .ok_or("No selected environment")?
                .definition
                .id,
        };

        manager
            .resolve_for_execution(&env_id)
            .map_err(|e| e.to_string())?
    };

    let adapter = get_adapter(&resolved.id).map_err(|e| e.to_string())?;

    let _ = state.execution_engine.kill();

    let binary = PathBuf::from(&resolved.binary_path);

    let request = {
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

        let resolved_entry = workspace_manager
            .resolve_entry_file(workspace, entry_file.as_deref())
            .map_err(|e| e.to_string())?;

        let file_content = if let Some(editor_code) = code {
            workspace_manager
                .write_file(workspace, &resolved_entry, &editor_code)
                .map_err(|e| e.to_string())?;
            editor_code
        } else {
            workspace_manager
                .read_file(workspace, &resolved_entry)
                .map_err(|e| e.to_string())?
        };

        let normalized_code = adapter.normalize_code(&file_content);

        if normalized_code != file_content {
            workspace_manager
                .write_file(workspace, &resolved_entry, &normalized_code)
                .map_err(|e| e.to_string())?;
        }

        let snippet_path = workspace.path.join(&resolved_entry);
        validate_snippet_path(workspace, &snippet_path)?;

        let prepared = adapter
            .prepare(PrepareContext {
                workspace_path: &workspace.path,
                snippet_path: &snippet_path,
                extra_paths: &resolved.extra_paths,
            })
            .map_err(|e| e.to_string())?;

        let mut env_vars: Vec<(String, String)> = resolved
            .env_vars
            .into_iter()
            .chain(prepared.extra_env.into_iter())
            .collect();

        env_vars.sort_by(|a, b| a.0.cmp(&b.0));
        env_vars.dedup_by(|a, b| a.0 == b.0);

        let built = adapter.build_command(&binary, &prepared.script_path);
        let program = PathBuf::from(built.get_program());
        let args: Vec<String> = built
            .get_args()
            .map(|arg| arg.to_string_lossy().to_string())
            .collect();

        ExecutionRequest {
            program,
            args,
            cwd: workspace.path.clone(),
            timeout_secs: timeout,
            env_vars,
        }
    };

    let engine = state.execution_engine.clone();
    std::thread::spawn(move || {
        if let Err(error) = engine.run(&emitter, request) {
            eprintln!("Execution failed: {error}");
            emitter.emit_output("stderr", &format!("{error}\n"));
            emitter.emit_finished(Some(1), false);
        }
    });

    Ok(())
}

fn validate_snippet_path(
    workspace: &crate::workspace::Workspace,
    snippet_path: &std::path::Path,
) -> Result<(), String> {
    crate::security::layer::validate_path_in_workspace(&workspace.path, snippet_path)
        .map_err(|e| e.to_string())
}

pub fn start_execution_tauri(
    state: &SharedState,
    app: AppHandle,
    code: Option<String>,
    environment_id: Option<String>,
    entry_file: Option<String>,
    timeout_secs: Option<u64>,
) -> Result<(), String> {
    let emitter = ExecutionEmitter::tauri(app, state.execution_events.clone());
    start_execution(
        state,
        emitter,
        code,
        environment_id,
        entry_file,
        timeout_secs,
    )
}

pub fn start_execution_http(
    state: &SharedState,
    code: Option<String>,
    environment_id: Option<String>,
    entry_file: Option<String>,
    timeout_secs: Option<u64>,
) -> Result<(), String> {
    let emitter = ExecutionEmitter::bus_only(state.execution_events.clone());
    start_execution(
        state,
        emitter,
        code,
        environment_id,
        entry_file,
        timeout_secs,
    )
}
