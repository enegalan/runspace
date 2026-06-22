use std::collections::HashMap;

use crate::environment::{
    Environment, EnvironmentDefinition, EnvironmentManager, ResolvedEnvironment, ValidationResult,
};
use crate::error::{lock_err, map_err};
use crate::services::workspace::delete_workspaces_for_runtime;
use crate::state::SharedState;

fn lock_environment_manager(
    state: &SharedState,
) -> Result<std::sync::MutexGuard<'_, EnvironmentManager>, String> {
    lock_err(state.environment_manager.lock(), "Environment manager")
}

pub fn list_installed(state: &SharedState) -> Result<Vec<Environment>, String> {
    let manager = lock_environment_manager(state)?;
    Ok(manager.list_installed())
}

pub fn list_available(state: &SharedState) -> Result<Vec<EnvironmentDefinition>, String> {
    let manager = lock_environment_manager(state)?;
    Ok(manager.list_available())
}

pub fn get_selected(state: &SharedState) -> Result<Option<Environment>, String> {
    let manager = lock_environment_manager(state)?;
    Ok(manager.get_selected())
}

pub fn install(state: &SharedState, environment_id: &str) -> Result<(), String> {
    let mut manager = lock_environment_manager(state)?;
    map_err(manager.install(environment_id))
}

pub fn uninstall(state: &SharedState, environment_id: &str) -> Result<(), String> {
    {
        let mut manager = lock_environment_manager(state)?;
        map_err(manager.uninstall(environment_id))?;
    }
    delete_workspaces_for_runtime(state, environment_id)
}

pub fn set_selected(state: &SharedState, environment_id: &str) -> Result<(), String> {
    let mut manager = lock_environment_manager(state)?;
    map_err(manager.set_selected(environment_id))
}

pub fn set_paths(
    state: &SharedState,
    environment_id: &str,
    paths: HashMap<String, String>,
) -> Result<(), String> {
    let mut manager = lock_environment_manager(state)?;
    map_err(manager.set_paths(environment_id, paths))
}

pub fn set_env_vars(
    state: &SharedState,
    environment_id: &str,
    env_vars: HashMap<String, String>,
) -> Result<(), String> {
    let mut manager = lock_environment_manager(state)?;
    map_err(manager.set_env_vars(environment_id, env_vars))
}

pub fn validate(state: &SharedState, environment_id: &str) -> Result<ValidationResult, String> {
    let mut manager = lock_environment_manager(state)?;
    map_err(manager.validate_environment(environment_id))
}

pub(crate) fn resolve_for_execution(
    state: &SharedState,
    environment_id: &str,
) -> Result<ResolvedEnvironment, String> {
    let manager = lock_environment_manager(state)?;
    map_err(manager.resolve_for_execution(environment_id))
}

pub(crate) fn resolve_for_run(
    state: &SharedState,
    environment_id: Option<String>,
) -> Result<ResolvedEnvironment, String> {
    let manager = lock_environment_manager(state)?;
    let env_id = match environment_id.as_deref() {
        Some(id) => id.to_string(),
        None => manager
            .get_selected()
            .ok_or_else(|| "No selected environment".to_string())?
            .definition
            .id,
    };
    map_err(manager.resolve_for_execution(&env_id))
}
