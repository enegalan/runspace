mod emitter;
mod events;
mod manager;
mod spawn;

pub use events::TerminalEventBus;
#[cfg(debug_assertions)]
pub use events::TerminalEvent;
pub use manager::{make_emitter, TerminalManager};
#[cfg(test)]
pub use manager::SpawnTerminalResult;
pub use spawn::build_shell_context;
