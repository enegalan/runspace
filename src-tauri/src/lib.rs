mod commands;
mod engine;
mod environment;
#[cfg(debug_assertions)]
mod http;
mod security;
mod services;
mod state;
#[cfg(test)]
mod test_home_lock;
mod workspace;

use commands::{
    create_directory, create_workspace, delete_file, delete_workspace, execute_code,
    get_active_workspace,
    get_runtime_template, get_selected_environment, initialize_workspace, install_environment,
    kill_process, list_available_environments, list_environments, list_files, list_workspaces,
    open_workspace, read_file, read_session, read_snippet, rename_file, rename_workspace,
    set_environment_env_vars,
    set_environment_paths, set_selected_environment, uninstall_environment, update_manifest,
    validate_environment, write_file, write_session, write_snippet,
};
use std::sync::{Arc, Mutex};

use state::{AppState, SharedState};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app_state = SharedState::new(AppState::new().expect("failed to initialize app state"));

    #[cfg(debug_assertions)]
    let tauri_handle = Arc::new(Mutex::new(None::<tauri::AppHandle>));

    #[cfg(debug_assertions)]
    http::start_dev_server(app_state.clone(), tauri_handle.clone());

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .manage(app_state)
        .setup({
            #[cfg(debug_assertions)]
            let tauri_handle = tauri_handle.clone();
            move |app| {
                #[cfg(debug_assertions)]
                {
                    if let Ok(mut guard) = tauri_handle.lock() {
                        *guard = Some(app.handle().clone());
                    }
                }
                Ok(())
            }
        })
        .invoke_handler(tauri::generate_handler![
            execute_code,
            get_runtime_template,
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
            list_workspaces,
            open_workspace,
            create_workspace,
            get_active_workspace,
            initialize_workspace,
            list_files,
            read_file,
            write_file,
            delete_file,
            delete_workspace,
            rename_file,
            rename_workspace,
            create_directory,
            read_session,
            write_session,
            update_manifest,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
