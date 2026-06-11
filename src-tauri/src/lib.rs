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
    get_runtime_template, get_selected_environment, import_external, initialize_workspace,
    install_environment, kill_process, list_available_environments, list_environments, list_files,
    list_workspaces, open_workspace, read_file, read_session, read_snippet, rename_file,
    rename_workspace,
    set_environment_env_vars,
    set_environment_paths, set_selected_environment, uninstall_environment, update_manifest,
    validate_environment, write_file, write_session, write_snippet,
};
use std::sync::{Arc, Mutex};
use tauri::menu::{MenuBuilder, MenuItemBuilder, PredefinedMenuItem, SubmenuBuilder};
use tauri::Emitter;

use state::{AppState, SharedState};

fn build_app_menu(app: &tauri::App) -> tauri::Result<()> {
    let new_workspace = MenuItemBuilder::with_id("new_workspace", "New Workspace")
        .accelerator("CmdOrCtrl+N")
        .build(app)?;
    let save = MenuItemBuilder::with_id("save", "Save")
        .accelerator("CmdOrCtrl+S")
        .build(app)?;
    let close_tab = MenuItemBuilder::with_id("close_tab", "Close Tab")
        .accelerator("CmdOrCtrl+W")
        .build(app)?;

    let file_menu = SubmenuBuilder::new(app, "File")
        .item(&new_workspace)
        .item(&save)
        .item(&close_tab)
        .build()?;

    let undo = PredefinedMenuItem::undo(app, None)?;
    let redo = PredefinedMenuItem::redo(app, None)?;
    let cut = PredefinedMenuItem::cut(app, None)?;
    let copy = PredefinedMenuItem::copy(app, None)?;
    let paste = PredefinedMenuItem::paste(app, None)?;

    let edit_menu = SubmenuBuilder::new(app, "Edit")
        .item(&undo)
        .item(&redo)
        .separator()
        .item(&cut)
        .item(&copy)
        .item(&paste)
        .build()?;

    let run_action = MenuItemBuilder::with_id("run", "Run")
        .accelerator("CmdOrCtrl+Enter")
        .build(app)?;
    let stop = MenuItemBuilder::with_id("stop", "Stop")
        .accelerator("CmdOrCtrl+.")
        .build(app)?;
    let clear_output = MenuItemBuilder::with_id("clear_output", "Clear Output")
        .build(app)?;

    let run_menu = SubmenuBuilder::new(app, "Run")
        .item(&run_action)
        .item(&stop)
        .item(&clear_output)
        .build()?;

    let keyboard_shortcuts =
        MenuItemBuilder::with_id("keyboard_shortcuts", "Keyboard Shortcuts").build(app)?;
    let about = MenuItemBuilder::with_id("about", "About Runspace").build(app)?;

    let help_menu = SubmenuBuilder::new(app, "Help")
        .item(&keyboard_shortcuts)
        .item(&about)
        .build()?;

    let menu = MenuBuilder::new(app)
        .items(&[&file_menu, &edit_menu, &run_menu, &help_menu])
        .build()?;

    app.set_menu(menu)?;

    let handle = app.handle().clone();
    app.on_menu_event(move |_app, event| {
        let id = event.id().as_ref();
        let action = match id {
            "new_workspace" => Some("new_workspace"),
            "save" => Some("save"),
            "close_tab" => Some("close_tab"),
            "run" => Some("run"),
            "stop" => Some("stop"),
            "clear_output" => Some("clear_output"),
            "keyboard_shortcuts" => Some("keyboard_shortcuts"),
            "about" => Some("about"),
            _ => None,
        };
        if let Some(action) = action {
            let _ = handle.emit("menu-action", action);
        }
    });

    Ok(())
}

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
                build_app_menu(app)?;
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
            import_external,
            create_directory,
            read_session,
            write_session,
            update_manifest,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
