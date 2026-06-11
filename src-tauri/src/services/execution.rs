use std::path::PathBuf;

use tauri::AppHandle;

use crate::engine::adapters::{
    get_adapter, get_compiled_adapter, is_compiled_environment, PrepareContext,
};
use crate::engine::compiled::run_compiled;
use crate::engine::{ExecutionEmitter, ExecutionRequest};
use crate::state::SharedState;

struct PreparedExecution {
    workspace_path: PathBuf,
    script_path: PathBuf,
    env_vars: Vec<(String, String)>,
}

pub fn start_execution(
    state: &SharedState,
    emitter: ExecutionEmitter,
    code: Option<String>,
    environment_id: Option<String>,
    entry_file: Option<String>,
    timeout_secs: Option<u64>,
    compile_timeout_secs: Option<u64>,
) -> Result<(), String> {
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

    let environment_id = resolved.id.clone();
    let adapter = get_adapter(&environment_id).map_err(|e| e.to_string())?;
    let is_compiled = is_compiled_environment(&environment_id);

    let settings = {
        let manager = state
            .settings_manager
            .lock()
            .map_err(|_| "Settings manager lock poisoned".to_string())?;
        manager.get().execution.clone()
    };

    let timeout = if is_compiled {
        timeout_secs.unwrap_or(settings.run_timeout_secs)
    } else {
        timeout_secs.unwrap_or(settings.run_timeout_secs)
    };

    let compile_timeout = compile_timeout_secs
        .unwrap_or(settings.compile_timeout_secs);
    let binary = PathBuf::from(&resolved.binary_path);

    let _ = state.execution_engine.kill();

    let prepared = {
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

        let adapter_prepared = adapter
            .prepare(PrepareContext {
                workspace_path: &workspace.path,
                snippet_path: &snippet_path,
                extra_paths: &resolved.extra_paths,
            })
            .map_err(|e| e.to_string())?;

        let mut env_vars: Vec<(String, String)> = resolved
            .env_vars
            .into_iter()
            .chain(adapter_prepared.extra_env.into_iter())
            .collect();

        env_vars.sort_by(|a, b| a.0.cmp(&b.0));
        env_vars.dedup_by(|a, b| a.0 == b.0);

        PreparedExecution {
            workspace_path: workspace.path.clone(),
            script_path: adapter_prepared.script_path,
            env_vars,
        }
    };

    let interpreted_request = if is_compiled {
        None
    } else {
        let built = adapter.build_command(&binary, &prepared.script_path);
        let program = PathBuf::from(built.get_program());
        let args: Vec<String> = built
            .get_args()
            .map(|arg| arg.to_string_lossy().to_string())
            .collect();

        Some(ExecutionRequest::with_defaults(
            program,
            args,
            prepared.workspace_path.clone(),
            timeout,
            prepared.env_vars.clone(),
        ))
    };

    let compiled_adapter = if is_compiled {
        get_compiled_adapter(&environment_id)
    } else {
        None
    };

    let engine = state.execution_engine.clone();
    std::thread::spawn(move || {
        if let Some(compiled_adapter) = compiled_adapter {
            if let Err(error) = run_compiled(
                &engine,
                &emitter,
                compiled_adapter.as_ref(),
                &binary,
                &prepared.script_path,
                &prepared.workspace_path,
                prepared.env_vars,
                timeout,
                compile_timeout,
            ) {
                eprintln!("Compiled execution failed: {error}");
                emitter.emit_output("stderr", &format!("[compile] {error}\n"));
                emitter.emit_finished(Some(1), false, true);
            }
            return;
        }

        let Some(request) = interpreted_request else {
            emitter.emit_output("stderr", "No execution request\n");
            emitter.emit_finished(Some(1), false, false);
            return;
        };

        if let Err(error) = engine.run(&emitter, request) {
            eprintln!("Execution failed: {error}");
            emitter.emit_output("stderr", &format!("{error}\n"));
            emitter.emit_finished(Some(1), false, false);
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
    compile_timeout_secs: Option<u64>,
) -> Result<(), String> {
    let emitter = ExecutionEmitter::tauri(app, state.execution_events.clone());
    start_execution(
        state,
        emitter,
        code,
        environment_id,
        entry_file,
        timeout_secs,
        compile_timeout_secs,
    )
}

pub fn start_execution_http(
    state: &SharedState,
    code: Option<String>,
    environment_id: Option<String>,
    entry_file: Option<String>,
    timeout_secs: Option<u64>,
    compile_timeout_secs: Option<u64>,
) -> Result<(), String> {
    let emitter = ExecutionEmitter::bus_only(state.execution_events.clone());
    start_execution(
        state,
        emitter,
        code,
        environment_id,
        entry_file,
        timeout_secs,
        compile_timeout_secs,
    )
}
