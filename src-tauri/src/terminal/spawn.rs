use std::path::{Path, PathBuf};

use crate::engine::adapters::{ensure_framework_ready, framework_terminal_env};
use crate::environment::catalog::get_definition;
use crate::environment::types::{EnvironmentCategory, ResolvedEnvironment};
use crate::workspace::manager::Workspace;

pub struct ShellContext {
    pub cwd: PathBuf,
    pub env_vars: Vec<(String, String)>,
    pub welcome: Option<String>,
}

pub fn build_shell_context(
    resolved: &ResolvedEnvironment,
    workspace: &Workspace,
) -> Result<ShellContext, String> {
    let definition = get_definition(&resolved.id)
        .ok_or_else(|| format!("Environment not found: {}", resolved.id))?;

    match definition.category {
        EnvironmentCategory::Language => Ok(ShellContext {
            cwd: workspace.path.clone(),
            env_vars: build_env_vars(resolved),
            welcome: None,
        }),
        EnvironmentCategory::Framework => {
            let adapter = crate::engine::adapters::get_adapter(&resolved.id)
                .map_err(|error| error.to_string())?;
            let skeleton_root = ensure_framework_ready(adapter.as_ref(), &resolved.extra_paths)
                .map_err(|error| error.to_string())?;
            let framework_env = framework_terminal_env(&skeleton_root, &workspace.path);

            let mut env_vars = build_env_vars(resolved);
            for (key, value) in framework_env {
                merge_env_var(&mut env_vars, key, value);
            }

            Ok(ShellContext {
                cwd: skeleton_root,
                env_vars,
                welcome: None,
            })
        }
    }
}

pub fn build_env_vars(resolved: &ResolvedEnvironment) -> Vec<(String, String)> {
    let mut env_vars: Vec<(String, String)> = resolved
        .env_vars
        .iter()
        .map(|(key, value)| (key.clone(), value.clone()))
        .collect();

    for (key, value) in inherited_shell_env() {
        merge_env_var(&mut env_vars, key, value);
    }

    env_vars.sort_by(|left, right| left.0.cmp(&right.0));
    env_vars.dedup_by(|left, right| left.0 == right.0);

    let sandbox_path = merge_path(resolved);
    merge_env_var(&mut env_vars, "PATH".to_string(), sandbox_path);
    env_vars
}

pub fn merge_path(resolved: &ResolvedEnvironment) -> String {
    let separator = path_separator();
    let mut path_dirs = Vec::new();

    push_parent_dir(&mut path_dirs, &resolved.binary_path);
    for value in resolved.extra_paths.values() {
        push_parent_dir(&mut path_dirs, value);
    }

    for dir in minimal_system_path_dirs() {
        if !path_dirs.contains(&dir) {
            path_dirs.push(dir);
        }
    }

    path_dirs.join(separator)
}

fn path_separator() -> &'static str {
    if cfg!(windows) {
        ";"
    } else {
        ":"
    }
}

fn minimal_system_path_dirs() -> Vec<String> {
    if cfg!(windows) {
        return vec!["C:\\Windows\\System32".to_string()];
    }

    vec![
        "/usr/bin".to_string(),
        "/bin".to_string(),
        "/usr/sbin".to_string(),
        "/sbin".to_string(),
    ]
}

fn inherited_shell_env() -> Vec<(String, String)> {
    [
        "HOME", "USER", "LOGNAME", "SHELL", "TERM", "LANG", "LC_ALL", "LC_CTYPE", "TMPDIR",
    ]
    .iter()
    .filter_map(|key| {
        std::env::var(key)
            .ok()
            .map(|value| (key.to_string(), value))
    })
    .collect()
}

fn push_parent_dir(path_dirs: &mut Vec<String>, path_value: &str) {
    if let Some(parent) = Path::new(path_value).parent() {
        let parent_text = parent.to_string_lossy().to_string();
        if !parent_text.is_empty() && !path_dirs.contains(&parent_text) {
            path_dirs.push(parent_text);
        }
    }
}

fn merge_env_var(env_vars: &mut Vec<(String, String)>, key: String, value: String) {
    if let Some(entry) = env_vars.iter_mut().find(|(existing, _)| existing == &key) {
        entry.1 = value;
    } else {
        env_vars.push((key, value));
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;

    #[test]
    fn merge_path_uses_only_configured_binary_dirs_and_minimal_system_paths() {
        let resolved = ResolvedEnvironment {
            id: "nodejs".to_string(),
            binary_path: "/opt/node/bin/node".to_string(),
            env_vars: HashMap::new(),
            extra_paths: HashMap::new(),
            file_extension: "js".to_string(),
        };

        let merged = merge_path(&resolved);

        assert!(merged.starts_with("/opt/node/bin"));
        assert!(merged.contains("/usr/bin"));
        assert!(merged.contains("/bin"));
        assert!(!merged.contains("/opt/homebrew"));
    }

    #[test]
    fn merge_path_includes_framework_extra_paths() {
        let resolved = ResolvedEnvironment {
            id: "laravel".to_string(),
            binary_path: "/usr/local/bin/php".to_string(),
            env_vars: HashMap::new(),
            extra_paths: HashMap::from([(
                "composer_path".to_string(),
                "/usr/local/bin/composer".to_string(),
            )]),
            file_extension: "php".to_string(),
        };

        let merged = merge_path(&resolved);

        assert!(merged.starts_with("/usr/local/bin"));
        assert!(merged.contains("/usr/bin"));
    }

    #[test]
    fn build_env_vars_does_not_inherit_parent_path() {
        std::env::set_var("PATH", "/secret/php/bin:/usr/bin");

        let resolved = ResolvedEnvironment {
            id: "nodejs".to_string(),
            binary_path: "/opt/node/bin/node".to_string(),
            env_vars: HashMap::new(),
            extra_paths: HashMap::new(),
            file_extension: "js".to_string(),
        };

        let env_vars = build_env_vars(&resolved);
        let path = env_vars
            .iter()
            .find(|(key, _)| key == "PATH")
            .map(|(_, value)| value.clone())
            .unwrap_or_default();

        assert!(path.starts_with("/opt/node/bin"));
        assert!(!path.contains("/secret/php/bin"));
    }

    #[test]
    fn build_env_vars_overrides_user_path() {
        let resolved = ResolvedEnvironment {
            id: "php".to_string(),
            binary_path: "/usr/local/bin/php".to_string(),
            env_vars: HashMap::from([("PATH".to_string(), "/old".to_string())]),
            extra_paths: HashMap::new(),
            file_extension: "php".to_string(),
        };

        let env_vars = build_env_vars(&resolved);
        let path = env_vars
            .iter()
            .find(|(key, _)| key == "PATH")
            .map(|(_, value)| value.clone())
            .unwrap_or_default();

        assert!(path.starts_with("/usr/local/bin"));
        assert!(!path.starts_with("/old"));
    }
}
