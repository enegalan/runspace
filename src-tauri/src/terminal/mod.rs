mod emitter;
mod events;
mod manager;
mod spawn;

pub use events::{TerminalEvent, TerminalEventBus};
pub use manager::{make_emitter, TerminalManager};
pub use spawn::build_shell_context;
