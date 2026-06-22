use std::path::PathBuf;

use tauri::AppHandle;

use crate::engine::adapters::{
    get_adapter, get_compiled_adapter, is_compiled_environment, PrepareContext,
};
use crate::engine::compiled::run_compiled;
use crate::engine::{ExecutionEmitter, ExecutionRequest};
use crate::error::map_err;
use crate::services::environment::resolve_for_run;
use crate::services::settings::execution_settings;
use crate::services::workspace::{ensure_active_workspace, lock_workspace_manager};
use crate::state::SharedState;

struct PreparedExecution {
    workspace_path: PathBuf,
    script_path: PathBuf,
    env_vars: Vec<(String, String)>,
}

pub fn kill_process(state: &SharedState) -> Result<(), String> {
    map_err(state.execution_engine.kill())
}

pub fn start_execution(
    state: &SharedState,
    app: Option<AppHandle>,
    code: Option<String>,
    environment_id: Option<String>,
    file: Option<String>,
    timeout_secs: Option<u64>,
    compile_timeout_secs: Option<u64>,
) -> Result<(), String> {
    let emitter = match app {
        Some(app) => ExecutionEmitter::tauri(app, state.execution_events.clone()),
        None => ExecutionEmitter::bus_only(state.execution_events.clone()),
    };

    let resolved = resolve_for_run(state, environment_id)?;

    let environment_id = resolved.id.clone();
    let adapter = map_err(get_adapter(&environment_id))?;
    let is_compiled = is_compiled_environment(&environment_id);

    let settings = execution_settings(state)?;

    let timeout = timeout_secs.unwrap_or(settings.run_timeout_secs);
    let compile_timeout = compile_timeout_secs.unwrap_or(settings.compile_timeout_secs);
    let binary = PathBuf::from(&resolved.binary_path);

    let _ = state.execution_engine.kill();

    let prepared = {
        let workspace = ensure_active_workspace(state)?;
        let workspace_manager = lock_workspace_manager(state)?;

        let relative_path = file.as_deref().ok_or("No file selected to run")?;
        let resolved_entry =
            map_err(workspace_manager.resolve_run_file(&workspace, relative_path))?;

        if let Some(editor_code) = code {
            map_err(workspace_manager.write_file(&workspace, &resolved_entry, &editor_code))?;
        }

        let snippet_path = workspace.path.join(&resolved_entry);
        map_err(crate::security::layer::validate_path_in_workspace(
            &workspace.path,
            &snippet_path,
        ))?;

        let adapter_prepared = map_err(adapter.prepare(PrepareContext {
            workspace_path: &workspace.path,
            snippet_path: &snippet_path,
            extra_paths: &resolved.extra_paths,
        }))?;

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
