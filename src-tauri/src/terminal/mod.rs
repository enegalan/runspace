mod emitter;
mod events;
mod manager;
mod spawn;

#[cfg(debug_assertions)]
pub use events::TerminalEvent;
pub use events::TerminalEventBus;
#[cfg(test)]
pub use manager::SpawnTerminalResult;
pub use manager::{make_emitter, TerminalManager};
pub use spawn::build_shell_context;
