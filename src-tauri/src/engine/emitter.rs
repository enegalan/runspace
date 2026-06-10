use tauri::{AppHandle, Emitter};

use super::events::{ExecutionEvent, ExecutionEventBus};

#[derive(Clone)]
pub struct ExecutionEmitter {
    app: Option<AppHandle>,
    bus: ExecutionEventBus,
}

impl ExecutionEmitter {
    pub fn tauri(app: AppHandle, bus: ExecutionEventBus) -> Self {
        Self {
            app: Some(app),
            bus,
        }
    }

    pub fn bus_only(bus: ExecutionEventBus) -> Self {
        Self { app: None, bus }
    }

    pub fn emit_started(&self, pid: u32) {
        if let Some(app) = &self.app {
            let _ = app.emit("execution-started", StartedPayload { pid });
        }
        self.bus
            .publish(ExecutionEvent::Started { pid });
    }

    pub fn emit_output(&self, stream: &str, chunk: &str) {
        if let Some(app) = &self.app {
            let _ = app.emit(
                "execution-output",
                OutputPayload {
                    stream: stream.to_string(),
                    chunk: chunk.to_string(),
                },
            );
        }
        self.bus.publish(ExecutionEvent::Output {
            stream: stream.to_string(),
            chunk: chunk.to_string(),
        });
    }

    pub fn emit_finished(&self, exit_code: Option<i32>, timed_out: bool) {
        if let Some(app) = &self.app {
            let _ = app.emit(
                "execution-finished",
                FinishedPayload {
                    exit_code,
                    timed_out,
                },
            );
        }
        self.bus.publish(ExecutionEvent::Finished {
            exit_code,
            timed_out,
        });
    }
}

#[derive(Clone, serde::Serialize)]
struct OutputPayload {
    stream: String,
    chunk: String,
}

#[derive(Clone, serde::Serialize)]
struct StartedPayload {
    pid: u32,
}

#[derive(Clone, serde::Serialize)]
struct FinishedPayload {
    exit_code: Option<i32>,
    timed_out: bool,
}
