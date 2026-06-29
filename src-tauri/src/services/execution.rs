use std::collections::HashMap;
use std::path::PathBuf;

use tauri::AppHandle;

use crate::engine::compiled::run_compiled;
use crate::engine::profiles::{
    build_run_command, is_compiled_environment, prepare, require_manifest, PrepareContext,
};
use crate::engine::{ExecutionEmitter, ExecutionRequest};
use crate::error::{lock_err, map_err};
use crate::services::settings::execution_settings;
use crate::services::workspace::{
    active_workspace_snapshot, cleanup_workspace_snapshot, ensure_active_workspace,
    lock_workspace_manager,
};
use crate::state::SharedState;

struct PreparedExecution {
    workspace_path: PathBuf,
    script_path: PathBuf,
    env_vars: Vec<(String, String)>,
    paths: HashMap<String, String>,
}

pub fn kill_process(state: &SharedState) -> Result<(), String> {
    let snapshot = active_workspace_snapshot(state);
    map_err(state.execution_engine.kill())?;
    cleanup_workspace_snapshot(snapshot?);
    Ok(())
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

    let resolved = {
        let manager = lock_err(state.environment_manager.lock(), "Environment manager")?;
        let env_id = match environment_id.as_deref() {
            Some(id) => id.to_string(),
            None => {
                manager
                    .get_selected()
                    .ok_or_else(|| "No selected environment".to_string())?
                    .definition
                    .id
            }
        };
        map_err(manager.resolve_for_execution(&env_id))?
    };

    let environment_id = resolved.id.clone();
    map_err(require_manifest(&environment_id))?;
    let is_compiled = is_compiled_environment(&environment_id);

    let settings = execution_settings(state)?;

    let timeout = timeout_secs.unwrap_or(settings.run_timeout_secs);
    let compile_timeout = compile_timeout_secs.unwrap_or(settings.compile_timeout_secs);

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
        map_err(crate::security::validate_path_in_workspace(
            &workspace.path,
            &snippet_path,
        ))?;

        let mut paths = resolved.extra_paths.clone();
        if let Some(binary_key) = crate::environment::registry::binary_field_key(&environment_id) {
            paths.insert(binary_key, resolved.binary_path.clone());
        }

        let profile_prepared = map_err(prepare(PrepareContext {
            environment_id: &environment_id,
            workspace_path: &workspace.path,
            snippet_path: &snippet_path,
            extra_paths: &paths,
        }))?;

        let mut env_vars = resolved.env_vars;
        env_vars.extend(profile_prepared.extra_env);

        PreparedExecution {
            workspace_path: workspace.path.clone(),
            script_path: profile_prepared.script_path,
            env_vars: env_vars.into_iter().collect(),
            paths,
        }
    };

    let manifest = require_manifest(&environment_id).map_err(|error| error.to_string())?;

    let interpreted_request = if is_compiled {
        None
    } else {
        let built = build_run_command(
            manifest,
            &prepared.paths,
            &prepared.script_path,
            &prepared.workspace_path,
        )
        .map_err(|error| error.to_string())?;

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

    let engine = state.execution_engine.clone();
    let manifest_id = environment_id.clone();
    let paths = prepared.paths.clone();
    let script_path = prepared.script_path.clone();
    let workspace_path = prepared.workspace_path.clone();
    let env_vars = prepared.env_vars.clone();

    std::thread::spawn(move || {
        if is_compiled {
            let manifest = match require_manifest(&manifest_id) {
                Ok(manifest) => manifest,
                Err(error) => {
                    eprintln!("Compiled execution failed: {error}");
                    emitter.emit_output("stderr", &format!("[compile] {error}\n"));
                    emitter.emit_finished(Some(1), false, true);
                    return;
                }
            };
            if let Err(error) = run_compiled(
                &engine,
                &emitter,
                manifest,
                &paths,
                &script_path,
                &workspace_path,
                env_vars,
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
