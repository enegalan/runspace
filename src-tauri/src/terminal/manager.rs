use std::collections::HashMap;
use std::io::{Read, Write};
use std::sync::{Arc, Mutex};
use std::thread;

use portable_pty::{native_pty_system, Child, CommandBuilder, MasterPty, PtySize};
use uuid::Uuid;

use super::emitter::TerminalEmitter;
use super::spawn::ShellContext;
use super::TerminalEventBus;

struct PtySession {
    master: Arc<Mutex<Box<dyn MasterPty + Send>>>,
    writer: Arc<Mutex<Box<dyn Write + Send>>>,
    child: Arc<Mutex<Box<dyn Child + Send + Sync>>>,
}

pub struct SpawnTerminalResult {
    pub session_id: String,
}

pub struct TerminalManager {
    sessions: HashMap<String, PtySession>,
}

impl TerminalManager {
    pub fn new() -> Self {
        Self {
            sessions: HashMap::new(),
        }
    }

    pub fn spawn(
        &mut self,
        context: ShellContext,
        emitter: TerminalEmitter,
    ) -> Result<SpawnTerminalResult, String> {
        let session_id = Uuid::new_v4().to_string();
        let pty_system = native_pty_system();
        let pair = pty_system
            .openpty(PtySize {
                rows: 24,
                cols: 80,
                pixel_width: 0,
                pixel_height: 0,
            })
            .map_err(|error| format!("Failed to open PTY: {error}"))?;

        let shell = std::env::var("SHELL").unwrap_or_else(|_| "/bin/bash".to_string());
        let mut command = CommandBuilder::new(shell);
        command.env_clear();
        command.cwd(context.cwd.as_path());
        for (key, value) in &context.env_vars {
            command.env(key, value);
        }

        let child = pair
            .slave
            .spawn_command(command)
            .map_err(|error| format!("Failed to spawn shell: {error}"))?;

        let mut reader = pair
            .master
            .try_clone_reader()
            .map_err(|error| format!("Failed to clone PTY reader: {error}"))?;
        let mut writer = pair
            .master
            .take_writer()
            .map_err(|error| format!("Failed to open PTY writer: {error}"))?;

        if let Some(welcome) = &context.welcome {
            let _ = writer.write_all(welcome.as_bytes());
        }

        let master = Arc::new(Mutex::new(pair.master));
        let writer = Arc::new(Mutex::new(writer));
        let child = Arc::new(Mutex::new(child));

        let session_id_for_reader = session_id.clone();
        let emitter_for_reader = emitter.clone();
        let child_for_wait = child.clone();
        thread::spawn(move || {
            let mut buffer = [0u8; 8192];
            loop {
                match reader.read(&mut buffer) {
                    Ok(0) => break,
                    Ok(count) => {
                        let data = String::from_utf8_lossy(&buffer[..count]).to_string();
                        if !data.is_empty() {
                            emitter_for_reader.emit_data(&session_id_for_reader, &data);
                        }
                    }
                    Err(_) => break,
                }
            }

            let exit_code = child_for_wait
                .lock()
                .ok()
                .and_then(|mut running| running.wait().ok())
                .map(|status| status.exit_code() as i32);
            emitter_for_reader.emit_exit(&session_id_for_reader, exit_code);
        });

        self.sessions.insert(
            session_id.clone(),
            PtySession {
                master: master.clone(),
                writer: writer.clone(),
                child,
            },
        );

        Ok(SpawnTerminalResult { session_id })
    }

    pub fn write(&self, session_id: &str, data: &str) -> Result<(), String> {
        let session = self
            .sessions
            .get(session_id)
            .ok_or_else(|| format!("Terminal session not found: {session_id}"))?;
        let mut writer = session
            .writer
            .lock()
            .map_err(|_| "Terminal writer lock poisoned".to_string())?;
        writer
            .write_all(data.as_bytes())
            .map_err(|error| format!("Failed to write to terminal: {error}"))
    }

    pub fn resize(&self, session_id: &str, cols: u16, rows: u16) -> Result<(), String> {
        let session = self
            .sessions
            .get(session_id)
            .ok_or_else(|| format!("Terminal session not found: {session_id}"))?;
        let master = session
            .master
            .lock()
            .map_err(|_| "Terminal master lock poisoned".to_string())?;
        master
            .resize(PtySize {
                rows,
                cols,
                pixel_width: 0,
                pixel_height: 0,
            })
            .map_err(|error| format!("Failed to resize terminal: {error}"))
    }

    pub fn close(&mut self, session_id: &str) -> Result<(), String> {
        if let Some(session) = self.sessions.remove(session_id) {
            if let Ok(mut child) = session.child.lock() {
                let _ = child.kill();
                let _ = child.wait();
            }
        }
        Ok(())
    }

    pub fn list_sessions(&self) -> Vec<String> {
        self.sessions.keys().cloned().collect()
    }
}

impl Default for TerminalManager {
    fn default() -> Self {
        Self::new()
    }
}

pub fn make_emitter(
    app: Option<tauri::AppHandle>,
    bus: TerminalEventBus,
) -> TerminalEmitter {
    match app {
        Some(handle) => TerminalEmitter::tauri(handle, bus),
        None => TerminalEmitter::bus_only(bus),
    }
}

