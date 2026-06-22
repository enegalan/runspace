use serde_json::Value;

use crate::error::{lock_err, map_err};
use crate::settings::{AppSettings, ExecutionSettings, SettingsManager};
use crate::state::SharedState;

fn lock_settings_manager(
    state: &SharedState,
) -> Result<std::sync::MutexGuard<'_, SettingsManager>, String> {
    lock_err(state.settings_manager.lock(), "Settings manager")
}

pub fn read_settings(state: &SharedState) -> Result<AppSettings, String> {
    let manager = lock_settings_manager(state)?;
    Ok(manager.get().clone())
}

pub fn update_settings(state: &SharedState, patch: Value) -> Result<AppSettings, String> {
    let mut manager = lock_settings_manager(state)?;
    map_err(manager.update(patch))
}

pub(crate) fn execution_settings(state: &SharedState) -> Result<ExecutionSettings, String> {
    let manager = lock_settings_manager(state)?;
    Ok(manager.get().execution.clone())
}
