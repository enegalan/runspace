mod commands;
mod engine;
mod environment;
#[cfg(debug_assertions)]
mod http;
mod security;
mod services;
mod settings;
mod state;
mod terminal;
#[cfg(test)]
mod test_home_lock;
mod workspace;

use commands::{
    close_terminal, create_directory, create_workspace, delete_file, delete_workspace,
    execute_code, get_active_workspace, get_selected_environment,
    import_external, initialize_workspace, install_environment, kill_process,
    list_available_environments, list_environments, list_files, list_terminal_sessions,
    list_workspaces, open_workspace, read_file, read_session, read_settings,
    rename_file, rename_workspace, resize_terminal, set_environment_env_vars,
    set_environment_paths, set_selected_environment, spawn_terminal, uninstall_environment,
    update_manifest, update_settings, validate_environment, write_file, write_session,
    write_terminal,
};
#[cfg(debug_assertions)]
use std::sync::{Arc, Mutex};
use tauri::menu::{MenuBuilder, MenuItemBuilder, PredefinedMenuItem, SubmenuBuilder};
use tauri::Emitter;

use state::{AppState, SharedState};

fn build_app_menu(app: &tauri::App) -> tauri::Result<()> {
    let app_name = app
        .config()
        .product_name
        .clone()
        .unwrap_or_else(|| "Runspace".to_string());

    let about = MenuItemBuilder::with_id("about", format!("About {app_name}")).build(app)?;
    let settings = MenuItemBuilder::with_id("settings", "Settings")
        .accelerator("CmdOrCtrl+,")
        .build(app)?;
    let hide_label = format!("Hide {app_name}");
    let quit_label = format!("Quit {app_name}");
    let hide = PredefinedMenuItem::hide(app, Some(hide_label.as_str()))?;
    let hide_others = PredefinedMenuItem::hide_others(app, None)?;
    let show_all = PredefinedMenuItem::show_all(app, None)?;
    let quit = PredefinedMenuItem::quit(app, Some(quit_label.as_str()))?;

    let app_menu = SubmenuBuilder::new(app, &app_name)
        .item(&about)
        .item(&settings)
        .separator()
        .item(&hide)
        .item(&hide_others)
        .item(&show_all)
        .separator()
        .item(&quit)
        .build()?;

    let new_file = MenuItemBuilder::with_id("new_file", "New File")
        .accelerator("CmdOrCtrl+N")
        .build(app)?;
    let new_folder = MenuItemBuilder::with_id("new_folder", "New Folder")
        .accelerator("CmdOrCtrl+Shift+N")
        .build(app)?;
    let save = MenuItemBuilder::with_id("save", "Save")
        .accelerator("CmdOrCtrl+S")
        .build(app)?;
    let close_window = PredefinedMenuItem::close_window(app, None)?;

    let file_menu = SubmenuBuilder::new(app, "File")
        .item(&new_file)
        .item(&new_folder)
        .item(&save)
        .separator()
        .item(&close_window)
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

    let toggle_sidebar = MenuItemBuilder::with_id("toggle_sidebar", "Toggle Sidebar")
        .accelerator("CmdOrCtrl+B")
        .build(app)?;
    let toggle_output = MenuItemBuilder::with_id("toggle_output", "Toggle Output Panel")
        .accelerator("CmdOrCtrl+J")
        .build(app)?;

    let view_menu = SubmenuBuilder::new(app, "View")
        .item(&toggle_sidebar)
        .item(&toggle_output)
        .build()?;

    let new_terminal = MenuItemBuilder::with_id("new_terminal", "New Terminal")
        .accelerator("CmdOrCtrl+Shift+T")
        .build(app)?;

    let terminal_menu = SubmenuBuilder::new(app, "Terminal")
        .item(&new_terminal)
        .build()?;

    let minimize = PredefinedMenuItem::minimize(app, None)?;
    let zoom = PredefinedMenuItem::maximize(app, None)?;
    let fullscreen = PredefinedMenuItem::fullscreen(app, None)?;
    let bring_all_to_front = PredefinedMenuItem::bring_all_to_front(app, None)?;

    let window_menu = SubmenuBuilder::new(app, "Window")
        .item(&minimize)
        .item(&zoom)
        .item(&fullscreen)
        .separator()
        .item(&bring_all_to_front)
        .build()?;

    let menu = MenuBuilder::new(app)
        .items(&[
            &app_menu,
            &file_menu,
            &edit_menu,
            &run_menu,
            &view_menu,
            &terminal_menu,
            &window_menu,
        ])
        .build()?;

    app.set_menu(menu)?;

    let handle = app.handle().clone();
    app.on_menu_event(move |_app, event| {
        let id = event.id().as_ref();
        let action = match id {
            "about" => Some("about"),
            "settings" => Some("settings"),
            "new_file" => Some("new_file"),
            "new_folder" => Some("new_folder"),
            "save" => Some("save"),
            "run" => Some("run"),
            "stop" => Some("stop"),
            "clear_output" => Some("clear_output"),
            "toggle_sidebar" => Some("toggle_sidebar"),
            "toggle_output" => Some("toggle_output"),
            "new_terminal" => Some("new_terminal"),
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
            kill_process,
            list_environments,
            list_available_environments,
            get_selected_environment,
            install_environment,
            uninstall_environment,
            set_selected_environment,
            set_environment_paths,
            set_environment_env_vars,
            validate_environment,
            read_settings,
            update_settings,
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
            spawn_terminal,
            write_terminal,
            resize_terminal,
            close_terminal,
            list_terminal_sessions,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
