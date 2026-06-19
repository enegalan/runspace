use std::sync::{Arc, Mutex};

use serde::Serialize;
use tokio::sync::broadcast;

#[derive(Clone, Debug, Serialize)]
#[serde(tag = "event")]
pub enum ExecutionEvent {
    Started {
        pid: u32,
    },
    Output {
        stream: String,
        chunk: String,
    },
    Phase {
        phase: String,
    },
    Finished {
        exit_code: Option<i32>,
        timed_out: bool,
        compile_failed: bool,
    },
}

#[derive(Clone)]
pub struct ExecutionEventBus {
    sender: broadcast::Sender<ExecutionEvent>,
    replay: Arc<Mutex<Vec<ExecutionEvent>>>,
}

impl ExecutionEventBus {
    pub fn new() -> Self {
        let (sender, _) = broadcast::channel(512);
        Self {
            sender,
            replay: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub fn publish(&self, event: ExecutionEvent) {
        if let Ok(mut replay) = self.replay.lock() {
            if matches!(event, ExecutionEvent::Started { .. }) {
                replay.clear();
            }
            replay.push(event.clone());
        }
        let _ = self.sender.send(event);
    }

    #[cfg(any(debug_assertions, test))]
    pub fn replay_snapshot(&self) -> Vec<ExecutionEvent> {
        self.replay
            .lock()
            .map(|replay| replay.clone())
            .unwrap_or_default()
    }

    #[cfg(debug_assertions)]
    pub fn subscribe(&self) -> broadcast::Receiver<ExecutionEvent> {
        self.sender.subscribe()
    }
}

impl Default for ExecutionEventBus {
    fn default() -> Self {
        Self::new()
    }
}
