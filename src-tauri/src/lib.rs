mod commands;
mod engine;
mod environment;
mod security;
mod state;
#[cfg(test)]
mod test_home_lock;
mod workspace;

use commands::{
    execute_code, get_selected_environment, install_environment, kill_process,
    list_available_environments, list_environments, read_snippet, set_environment_env_vars,
    set_environment_paths, set_selected_environment, uninstall_environment, validate_environment,
    write_snippet,
};
use state::AppState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app_state = AppState::new().expect("failed to initialize app state");

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            execute_code,
            kill_process,
            read_snippet,
            write_snippet,
            list_environments,
            list_available_environments,
            get_selected_environment,
            install_environment,
            uninstall_environment,
            set_selected_environment,
            set_environment_paths,
            set_environment_env_vars,
            validate_environment,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
