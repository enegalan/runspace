mod commands;
mod engine;
mod runtime;
mod security;
mod state;
mod workspace;

use commands::{execute_code, kill_process, read_snippet, write_snippet};
use state::AppState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app_state = AppState::new().expect("failed to initialize app state");

    tauri::Builder::default()
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            execute_code,
            kill_process,
            read_snippet,
            write_snippet
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
