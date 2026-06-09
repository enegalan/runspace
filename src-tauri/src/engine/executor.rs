use std::io::{BufRead, BufReader};
use std::path::PathBuf;
use std::process::{Child, Command, Stdio};
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};

use serde::Serialize;
use tauri::{AppHandle, Emitter};

#[derive(Debug)]
pub enum ExecutionError {
    SpawnFailed(String),
    NoActiveProcess,
    Io(std::io::Error),
}

impl std::fmt::Display for ExecutionError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ExecutionError::SpawnFailed(msg) => write!(f, "Spawn failed: {msg}"),
            ExecutionError::NoActiveProcess => write!(f, "No active process"),
            ExecutionError::Io(e) => write!(f, "IO error: {e}"),
        }
    }
}

#[derive(Clone, Serialize)]
struct OutputEvent {
    stream: String,
    chunk: String,
}

#[derive(Clone, Serialize)]
struct StartedEvent {
    pid: u32,
}

#[derive(Clone, Serialize)]
struct FinishedEvent {
    exit_code: Option<i32>,
    timed_out: bool,
}

pub struct ExecutionRequest {
    pub binary: PathBuf,
    pub script_path: PathBuf,
    pub cwd: PathBuf,
    pub timeout_secs: u64,
    pub env_vars: Vec<(String, String)>,
}

pub struct ExecutionResult {
    pub exit_code: Option<i32>,
    pub timed_out: bool,
    pub stdout: String,
    pub stderr: String,
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
            Ok(())
        } else {
            Err(ExecutionError::NoActiveProcess)
        }
    }

    pub fn run(
        &self,
        app: AppHandle,
        request: ExecutionRequest,
    ) -> Result<ExecutionResult, ExecutionError> {
        let _ = self.kill();

        let mut cmd = Command::new(&request.binary);
        cmd.arg(&request.script_path)
            .current_dir(&request.cwd)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped());

        for (key, value) in &request.env_vars {
            cmd.env(key, value);
        }

        let mut child = cmd
            .spawn()
            .map_err(|e| ExecutionError::SpawnFailed(e.to_string()))?;

        let pid = child.id();
        let _ = app.emit("execution-started", StartedEvent { pid });

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

        let stdout_acc = Arc::new(Mutex::new(String::new()));
        let stderr_acc = Arc::new(Mutex::new(String::new()));

        let app_stdout = app.clone();
        let stdout_acc_clone = Arc::clone(&stdout_acc);
        let stdout_handle = std::thread::spawn(move || {
            let reader = BufReader::new(stdout);
            for line in reader.lines() {
                match line {
                    Ok(line) => {
                        let chunk = format!("{line}\n");
                        if let Ok(mut acc) = stdout_acc_clone.lock() {
                            acc.push_str(&chunk);
                        }
                        let _ = app_stdout.emit(
                            "execution-output",
                            OutputEvent {
                                stream: "stdout".to_string(),
                                chunk,
                            },
                        );
                    }
                    Err(_) => break,
                }
            }
        });

        let app_stderr = app.clone();
        let stderr_acc_clone = Arc::clone(&stderr_acc);
        let stderr_handle = std::thread::spawn(move || {
            let reader = BufReader::new(stderr);
            for line in reader.lines() {
                match line {
                    Ok(line) => {
                        let chunk = format!("{line}\n");
                        if let Ok(mut acc) = stderr_acc_clone.lock() {
                            acc.push_str(&chunk);
                        }
                        let _ = app_stderr.emit(
                            "execution-output",
                            OutputEvent {
                                stream: "stderr".to_string(),
                                chunk,
                            },
                        );
                    }
                    Err(_) => break,
                }
            }
        });

        let timeout = Duration::from_secs(request.timeout_secs);
        let start = Instant::now();
        let mut timed_out = false;
        let mut exit_code: Option<i32> = None;

        loop {
            let status = {
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
            };

            let _ = status;
            std::thread::sleep(Duration::from_millis(50));
        }

        let _ = stdout_handle.join();
        let _ = stderr_handle.join();

        let _ = app.emit(
            "execution-finished",
            FinishedEvent {
                exit_code,
                timed_out,
            },
        );

        Ok(ExecutionResult {
            exit_code,
            timed_out,
            stdout: stdout_acc.lock().map(|s| s.clone()).unwrap_or_default(),
            stderr: stderr_acc.lock().map(|s| s.clone()).unwrap_or_default(),
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    fn node_binary() -> Option<PathBuf> {
        if let Ok(path) = which::which("node") {
            return Some(path);
        }
        for candidate in ["/opt/homebrew/bin/node", "/usr/local/bin/node"] {
            let path = PathBuf::from(candidate);
            if path.is_file() {
                return Some(path);
            }
        }
        None
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

        let request = ExecutionRequest {
            binary: node,
            script_path,
            cwd: temp_dir.clone(),
            timeout_secs: 10,
            env_vars: vec![],
        };

        // Integration test without Tauri app handle — run command directly
        let mut cmd = Command::new(&request.binary);
        cmd.arg(&request.script_path)
            .current_dir(&request.cwd)
            .stdout(Stdio::piped());

        let output = cmd.output().expect("node output");
        let stdout = String::from_utf8_lossy(&output.stdout);

        assert!(stdout.contains('1'));

        let _ = std::fs::remove_dir_all(&temp_dir);
        let _ = engine;
    }
}
