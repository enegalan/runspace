use std::io::{BufReader, Read};
use std::path::PathBuf;
use std::process::{Child, Command, Stdio};
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};

use super::emitter::ExecutionEmitter;

#[derive(Debug)]
pub enum ExecutionError {
    SpawnFailed(String),
    Io(std::io::Error),
}

impl std::fmt::Display for ExecutionError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ExecutionError::SpawnFailed(msg) => write!(f, "Spawn failed: {msg}"),
            ExecutionError::Io(e) => write!(f, "IO error: {e}"),
        }
    }
}

pub struct ExecutionRequest {
    pub program: PathBuf,
    pub args: Vec<String>,
    pub cwd: PathBuf,
    pub timeout_secs: u64,
    pub env_vars: Vec<(String, String)>,
    pub stderr_prefix: Option<String>,
    pub emit_finished: bool,
}

impl ExecutionRequest {
    pub fn with_defaults(
        program: PathBuf,
        args: Vec<String>,
        cwd: PathBuf,
        timeout_secs: u64,
        env_vars: Vec<(String, String)>,
    ) -> Self {
        Self {
            program,
            args,
            cwd,
            timeout_secs,
            env_vars,
            stderr_prefix: None,
            emit_finished: true,
        }
    }
}

fn prefix_stderr_lines(text: &str, prefix: &str) -> String {
    if text.is_empty() {
        return String::new();
    }
    let lines: Vec<String> = text
        .lines()
        .map(|line| {
            if line.is_empty() {
                String::new()
            } else {
                format!("[{prefix}] {line}")
            }
        })
        .collect();
    let mut result = lines.join("\n");
    if text.ends_with('\n') {
        result.push('\n');
    }
    result
}

pub struct ExecutionResult {
    pub exit_code: Option<i32>,
    pub timed_out: bool,
}

#[derive(Clone)]
pub struct ExecutionEngine {
    active_process: Arc<Mutex<Option<Child>>>,
}

impl ExecutionEngine {
    pub fn new() -> Self {
        Self {
            active_process: Arc::new(Mutex::new(None)),
        }
    }

    pub fn kill(&self) -> Result<(), ExecutionError> {
        let mut guard = self.active_process.lock().map_err(|_| {
            ExecutionError::SpawnFailed("Failed to lock active process".to_string())
        })?;

        if let Some(mut child) = guard.take() {
            child.kill().map_err(ExecutionError::Io)?;
            let _ = child.wait();
        }
        Ok(())
    }

    pub fn run(
        &self,
        emitter: &ExecutionEmitter,
        request: ExecutionRequest,
    ) -> Result<ExecutionResult, ExecutionError> {
        let _ = self.kill();

        let mut cmd = Command::new(&request.program);
        for arg in &request.args {
            cmd.arg(arg);
        }
        cmd.current_dir(&request.cwd)
            .stdin(Stdio::null())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped());

        for (key, value) in &request.env_vars {
            cmd.env(key, value);
        }

        let mut child = cmd
            .spawn()
            .map_err(|e| ExecutionError::SpawnFailed(e.to_string()))?;

        let pid = child.id();
        emitter.emit_started(pid);

        let stdout = child
            .stdout
            .take()
            .ok_or_else(|| ExecutionError::SpawnFailed("stdout not captured".to_string()))?;
        let stderr = child
            .stderr
            .take()
            .ok_or_else(|| ExecutionError::SpawnFailed("stderr not captured".to_string()))?;

        {
            let mut guard = self.active_process.lock().map_err(|_| {
                ExecutionError::SpawnFailed("Failed to lock active process".to_string())
            })?;
            *guard = Some(child);
        }

        let stdout_emitter = emitter.clone();
        let stdout_handle = std::thread::spawn(move || {
            let mut reader = BufReader::new(stdout);
            let mut buffer = String::new();
            if reader.read_to_string(&mut buffer).is_ok() && !buffer.is_empty() {
                stdout_emitter.emit_output("stdout", &buffer);
            }
        });

        let stderr_emitter = emitter.clone();
        let stderr_prefix = request.stderr_prefix.clone();
        let stderr_handle = std::thread::spawn(move || {
            let mut reader = BufReader::new(stderr);
            let mut buffer = String::new();
            if reader.read_to_string(&mut buffer).is_ok() && !buffer.is_empty() {
                let emitted = match &stderr_prefix {
                    Some(prefix) => prefix_stderr_lines(&buffer, prefix),
                    None => buffer,
                };
                stderr_emitter.emit_output("stderr", &emitted);
            }
        });

        let timeout = Duration::from_secs(request.timeout_secs);
        let start = Instant::now();
        let mut timed_out = false;
        let mut exit_code: Option<i32> = None;

        loop {
            let mut guard = self.active_process.lock().map_err(|_| {
                ExecutionError::SpawnFailed("Failed to lock active process".to_string())
            })?;

            if let Some(ref mut child) = *guard {
                match child.try_wait() {
                    Ok(Some(status)) => {
                        exit_code = status.code();
                        guard.take();
                        break;
                    }
                    Ok(None) => {
                        if start.elapsed() >= timeout {
                            child.kill().map_err(ExecutionError::Io)?;
                            let _ = child.wait();
                            guard.take();
                            timed_out = true;
                            break;
                        }
                    }
                    Err(e) => return Err(ExecutionError::Io(e)),
                }
            } else {
                break;
            }

            drop(guard);
            std::thread::sleep(Duration::from_millis(50));
        }

        let _ = stdout_handle.join();
        let _ = stderr_handle.join();

        if request.emit_finished {
            emitter.emit_finished(exit_code, timed_out, false);
        }

        Ok(ExecutionResult {
            exit_code,
            timed_out,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    fn node_binary() -> Option<PathBuf> {
        which::which("node").ok()
    }

    #[test]
    fn spawn_ruby_puts_via_engine() {
        let Some(ruby) = which::which("ruby").ok() else {
            eprintln!("skipping: ruby not found on PATH");
            return;
        };

        let engine = ExecutionEngine::new();
        let temp_dir = std::env::temp_dir().join(format!(
            "runspace-ruby-test-{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_nanos()
        ));
        std::fs::create_dir_all(&temp_dir).expect("temp dir");

        let script_path = temp_dir.join("main.rb");
        std::fs::write(&script_path, "puts").expect("write script");

        let request = ExecutionRequest::with_defaults(
            ruby,
            vec![script_path.to_string_lossy().to_string()],
            temp_dir.clone(),
            5,
            vec![],
        );

        use crate::engine::{ExecutionEmitter, ExecutionEventBus};

        let bus = ExecutionEventBus::new();
        let emitter = ExecutionEmitter::bus_only(bus);
        let result = engine.run(&emitter, request).expect("ruby run");

        assert!(!result.timed_out, "ruby puts timed out");
        assert_eq!(result.exit_code, Some(0));

        let _ = std::fs::remove_dir_all(&temp_dir);
    }

    #[test]
    fn spawn_node_and_capture_stdout() {
        let Some(node) = node_binary() else {
            eprintln!("skipping: node not found on PATH");
            return;
        };

        let engine = ExecutionEngine::new();
        let temp_dir = std::env::temp_dir().join(format!(
            "runspace-test-{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_nanos()
        ));
        std::fs::create_dir_all(&temp_dir).expect("temp dir");

        let script_path = temp_dir.join("test.js");
        std::fs::write(&script_path, "console.log(1);").expect("write script");

        let request = ExecutionRequest::with_defaults(
            node,
            vec![script_path.to_string_lossy().to_string()],
            temp_dir.clone(),
            10,
            vec![],
        );

        use crate::engine::{ExecutionEmitter, ExecutionEventBus};

        let bus = ExecutionEventBus::new();
        let emitter = ExecutionEmitter::bus_only(bus.clone());
        let result = engine.run(&emitter, request).expect("node run");

        assert!(!result.timed_out, "node timed out");
        assert_eq!(result.exit_code, Some(0));

        let events = bus.replay_snapshot();
        let stdout: String = events
            .iter()
            .filter_map(|event| match event {
                crate::engine::ExecutionEvent::Output { stream, chunk } if stream == "stdout" => {
                    Some(chunk.as_str())
                }
                _ => None,
            })
            .collect();
        assert!(stdout.contains('1'));

        let _ = std::fs::remove_dir_all(&temp_dir);
    }
}
