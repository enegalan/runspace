use tauri::{AppHandle, Emitter};

use super::events::{TerminalEvent, TerminalEventBus};

#[derive(Clone)]
pub struct TerminalEmitter {
    app: Option<AppHandle>,
    bus: TerminalEventBus,
}

impl TerminalEmitter {
    pub fn tauri(app: AppHandle, bus: TerminalEventBus) -> Self {
        Self {
            app: Some(app),
            bus,
        }
    }

    pub fn bus_only(bus: TerminalEventBus) -> Self {
        Self { app: None, bus }
    }

    pub fn emit_data(&self, session_id: &str, data: &str) {
        if let Some(app) = &self.app {
            let _ = app.emit(
                "terminal-data",
                DataPayload {
                    session_id: session_id.to_string(),
                    data: data.to_string(),
                },
            );
        }
        self.bus.publish(TerminalEvent::Data {
            session_id: session_id.to_string(),
            data: data.to_string(),
        });
    }

    pub fn emit_exit(&self, session_id: &str, exit_code: Option<i32>) {
        if let Some(app) = &self.app {
            let _ = app.emit(
                "terminal-exit",
                ExitPayload {
                    session_id: session_id.to_string(),
                    exit_code,
                },
            );
        }
        self.bus.publish(TerminalEvent::Exit {
            session_id: session_id.to_string(),
            exit_code,
        });
    }
}

#[derive(Clone, serde::Serialize)]
struct DataPayload {
    session_id: String,
    data: String,
}

#[derive(Clone, serde::Serialize)]
struct ExitPayload {
    session_id: String,
    exit_code: Option<i32>,
}
