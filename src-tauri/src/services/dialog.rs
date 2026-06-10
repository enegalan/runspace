use std::sync::mpsc;

use tauri::AppHandle;

pub fn pick_path(app: &AppHandle, directory: bool) -> Option<String> {
    let (tx, rx) = mpsc::channel();

    app.run_on_main_thread(move || {
        let picked = if directory {
            rfd::FileDialog::new().pick_folder()
        } else {
            rfd::FileDialog::new().pick_file()
        };
        let _ = tx.send(picked);
    })
    .ok()?;

    rx.recv()
        .ok()
        .flatten()
        .map(|path| path.to_string_lossy().to_string())
}
