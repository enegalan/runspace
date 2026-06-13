use std::sync::{Arc, Mutex};

use serde::Serialize;
use tokio::sync::broadcast;

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "kebab-case", tag = "event")]
pub enum TerminalEvent {
    Data {
        session_id: String,
        data: String,
    },
    Exit {
        session_id: String,
        exit_code: Option<i32>,
    },
}

#[derive(Clone)]
pub struct TerminalEventBus {
    sender: broadcast::Sender<TerminalEvent>,
    replay: Arc<Mutex<Vec<TerminalEvent>>>,
}

impl TerminalEventBus {
    pub fn new() -> Self {
        let (sender, _) = broadcast::channel(512);
        Self {
            sender,
            replay: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub fn publish(&self, event: TerminalEvent) {
        if let Ok(mut replay) = self.replay.lock() {
            replay.push(event.clone());
            if replay.len() > 256 {
                let overflow = replay.len() - 256;
                replay.drain(0..overflow);
            }
        }
        let _ = self.sender.send(event);
    }

    pub fn replay_snapshot(&self) -> Vec<TerminalEvent> {
        self.replay
            .lock()
            .map(|replay| replay.clone())
            .unwrap_or_default()
    }

    pub fn subscribe(&self) -> broadcast::Receiver<TerminalEvent> {
        self.sender.subscribe()
    }
}

impl Default for TerminalEventBus {
    fn default() -> Self {
        Self::new()
    }
}
