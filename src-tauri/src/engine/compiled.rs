use std::fs;
use std::path::{Path, PathBuf};

use super::adapters::CompiledAdapter;
use super::emitter::ExecutionEmitter;
use super::executor::{ExecutionEngine, ExecutionError, ExecutionRequest};

fn cleanup_artifacts(workspace: &Path, binary_name: &str) {
    let binary_path = workspace.join(binary_name);
    let _ = fs::remove_file(&binary_path);

    let Ok(entries) = fs::read_dir(workspace) else {
        return;
    };

    for entry in entries.flatten() {
        let name = entry.file_name().to_string_lossy().to_string();
        if name.starts_with(binary_name) {
            let path = entry.path();
            if path.is_dir() {
                let _ = fs::remove_dir_all(&path);
            } else {
                let _ = fs::remove_file(&path);
            }
        }
    }
}

fn command_from_compile(
    adapter: &dyn CompiledAdapter,
    compiler_binary: &Path,
    source_path: &Path,
    output_binary: &Path,
) -> (PathBuf, Vec<String>) {
    let built = adapter.compile_command(compiler_binary, source_path, output_binary);
    let program = PathBuf::from(built.get_program());
    let args: Vec<String> = built
        .get_args()
        .map(|arg| arg.to_string_lossy().to_string())
        .collect();
    (program, args)
}

pub fn run_compiled(
    engine: &ExecutionEngine,
    emitter: &ExecutionEmitter,
    adapter: &dyn CompiledAdapter,
    compiler_binary: &Path,
    source_path: &Path,
    workspace: &Path,
    env_vars: Vec<(String, String)>,
    run_timeout_secs: u64,
    compile_timeout_secs: u64,
) -> Result<(), ExecutionError> {
    let binary_name = adapter.output_binary_name();
    let output_binary = workspace.join(binary_name);

    cleanup_artifacts(workspace, binary_name);

    emitter.emit_phase("compile");

    let (program, args) =
        command_from_compile(adapter, compiler_binary, source_path, &output_binary);

    let compile_request = ExecutionRequest {
        program,
        args,
        cwd: workspace.to_path_buf(),
        timeout_secs: compile_timeout_secs,
        env_vars: env_vars.clone(),
        stderr_prefix: Some("compile".to_string()),
        emit_finished: false,
    };

    let compile_result = engine.run(emitter, compile_request)?;

    if compile_result.timed_out || compile_result.exit_code != Some(0) {
        cleanup_artifacts(workspace, binary_name);
        let exit_code = if compile_result.timed_out {
            compile_result.exit_code
        } else {
            Some(compile_result.exit_code.unwrap_or(-1))
        };
        emitter.emit_finished(exit_code, compile_result.timed_out, true);
        return Ok(());
    }

    crate::security::validate_path_in_workspace(workspace, &output_binary).map_err(|e| {
        cleanup_artifacts(workspace, binary_name);
        ExecutionError::SpawnFailed(e.to_string())
    })?;

    emitter.emit_phase("run");

    let run_request = ExecutionRequest {
        program: output_binary,
        args: vec![],
        cwd: workspace.to_path_buf(),
        timeout_secs: run_timeout_secs,
        env_vars,
        stderr_prefix: Some("runtime".to_string()),
        emit_finished: false,
    };

    let run_result = engine.run(emitter, run_request)?;
    cleanup_artifacts(workspace, binary_name);

    emitter.emit_finished(run_result.exit_code, run_result.timed_out, false);

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::engine::adapters::get_compiled_adapter;
    use crate::engine::{ExecutionEmitter, ExecutionEvent, ExecutionEventBus};

    #[test]
    fn gcc_compile_command_uses_hardcoded_output() {
        let adapter = get_compiled_adapter("gcc").expect("gcc adapter");
        let compiler = PathBuf::from("/usr/bin/gcc");
        let source = PathBuf::from("/tmp/ws/main.c");
        let output = PathBuf::from("/tmp/ws/runspace_out");
        let cmd = adapter.compile_command(&compiler, &source, &output);
        let args: Vec<_> = cmd
            .get_args()
            .map(|arg| arg.to_string_lossy().to_string())
            .collect();
        assert_eq!(args[0], "-o");
        assert!(args[1].ends_with("runspace_out"));
        assert!(args[2].ends_with("main.c"));
        assert!(args.contains(&"-Wall".to_string()));
        assert!(args.contains(&"-std=c11".to_string()));
    }

    #[test]
    fn forbidden_flags_not_in_compile_command() {
        const FORBIDDEN_FLAGS: &[&str] = &["-save-temps", "-wrapper", "@"];
        let adapter = get_compiled_adapter("gcc").expect("gcc adapter");
        let compiler = PathBuf::from("/usr/bin/gcc");
        let source = PathBuf::from("/tmp/ws/main.c");
        let output = PathBuf::from("/tmp/ws/runspace_out");
        let cmd = adapter.compile_command(&compiler, &source, &output);
        let args: Vec<_> = cmd
            .get_args()
            .map(|arg| arg.to_string_lossy().to_string())
            .collect();
        for flag in FORBIDDEN_FLAGS {
            assert!(
                !args.contains(&flag.to_string()),
                "forbidden flag present: {flag}"
            );
        }
    }

    #[test]
    #[ignore = "requires gcc in PATH"]
    fn integration_c_hello_world() {
        let Some(gcc) = which::which("gcc").ok() else {
            return;
        };

        let temp_dir = std::env::temp_dir().join(format!(
            "runspace-gcc-test-{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_nanos()
        ));
        std::fs::create_dir_all(&temp_dir).expect("temp dir");

        let source_path = temp_dir.join("main.c");
        std::fs::write(
            &source_path,
            "#include <stdio.h>\nint main() { printf(\"hello\\n\"); return 0; }\n",
        )
        .expect("write source");

        let engine = ExecutionEngine::new();
        let bus = ExecutionEventBus::new();
        let emitter = ExecutionEmitter::bus_only(bus.clone());
        let adapter = get_compiled_adapter("gcc").expect("gcc adapter");

        run_compiled(
            &engine,
            &emitter,
            adapter.as_ref(),
            &gcc,
            &source_path,
            &temp_dir,
            vec![],
            30,
            15,
        )
        .expect("compiled run");

        let events = bus.replay_snapshot();
        let stdout: String = events
            .iter()
            .filter_map(|event| match event {
                ExecutionEvent::Output { stream, chunk } if stream == "stdout" => {
                    Some(chunk.as_str())
                }
                _ => None,
            })
            .collect();
        let finished = events.iter().find_map(|event| match event {
            ExecutionEvent::Finished {
                exit_code,
                compile_failed,
                ..
            } => Some((*exit_code, *compile_failed)),
            _ => None,
        });

        assert!(stdout.contains("hello"));
        assert_eq!(finished, Some((Some(0), false)));
        assert!(!temp_dir.join("runspace_out").exists());

        let _ = std::fs::remove_dir_all(&temp_dir);
    }

    #[test]
    #[ignore = "requires gcc in PATH"]
    fn integration_compile_error_returns_failed() {
        let Some(gcc) = which::which("gcc").ok() else {
            return;
        };

        let temp_dir = std::env::temp_dir().join(format!(
            "runspace-gcc-err-{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_nanos()
        ));
        std::fs::create_dir_all(&temp_dir).expect("temp dir");

        let source_path = temp_dir.join("main.c");
        std::fs::write(&source_path, "int main() { return 0 }\n").expect("write source");

        let engine = ExecutionEngine::new();
        let bus = ExecutionEventBus::new();
        let emitter = ExecutionEmitter::bus_only(bus.clone());
        let adapter = get_compiled_adapter("gcc").expect("gcc adapter");

        run_compiled(
            &engine,
            &emitter,
            adapter.as_ref(),
            &gcc,
            &source_path,
            &temp_dir,
            vec![],
            30,
            15,
        )
        .expect("compiled run");

        let finished = bus.replay_snapshot().iter().find_map(|event| match event {
            ExecutionEvent::Finished { compile_failed, .. } => Some(*compile_failed),
            _ => None,
        });

        assert_eq!(finished, Some(true));
        assert!(!temp_dir.join("runspace_out").exists());

        let _ = std::fs::remove_dir_all(&temp_dir);
    }
}
