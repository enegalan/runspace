use std::path::{Path, PathBuf};

use super::registry::get_definition;
use super::types::ConfigField;

fn probe_field(field: &ConfigField) -> Option<PathBuf> {
    let detect = field.detect.as_ref()?;
    for name in &detect.commands {
        if let Ok(path) = which::which(name) {
            if path.is_file() && is_executable(&path) {
                return Some(path);
            }
        }
    }
    None
}

#[cfg(unix)]
fn is_executable(path: &Path) -> bool {
    use std::os::unix::fs::PermissionsExt;
    std::fs::metadata(path)
        .map(|m| m.permissions().mode() & 0o111 != 0)
        .unwrap_or(false)
}

#[cfg(not(unix))]
fn is_executable(path: &Path) -> bool {
    path.is_file()
}

pub fn detect_missing_binary_paths(
    environment_id: &str,
    paths: &std::collections::HashMap<String, String>,
) -> std::collections::HashMap<String, String> {
    let mut detected = std::collections::HashMap::new();
    let Some(definition) = get_definition(environment_id) else {
        return detected;
    };

    for field in &definition.config_fields {
        if field.field_type != super::types::ConfigFieldType::FilePath {
            continue;
        }

        let already_set = paths
            .get(&field.key)
            .map(|v| !v.trim().is_empty())
            .unwrap_or(false);
        if already_set {
            continue;
        }

        if let Some(path) = probe_field(field) {
            detected.insert(field.key.clone(), path.to_string_lossy().to_string());
        }
    }

    detected
}

pub fn resolve_environment_paths(
    environment_id: &str,
    paths: &std::collections::HashMap<String, String>,
) -> std::collections::HashMap<String, String> {
    let mut resolved = paths.clone();
    resolved.extend(detect_missing_binary_paths(environment_id, &resolved));

    let Some(definition) = get_definition(environment_id) else {
        return resolved;
    };

    for field in &definition.config_fields {
        if field.field_type != super::types::ConfigFieldType::FilePath {
            continue;
        }

        let already_set = resolved
            .get(&field.key)
            .map(|value| !value.trim().is_empty())
            .unwrap_or(false);
        if already_set {
            continue;
        }

        let Some(default) = field
            .default_value
            .as_ref()
            .map(|value| value.trim())
            .filter(|value| !value.is_empty())
        else {
            continue;
        };

        if let Ok(path) = which::which(default) {
            if path.is_file() && is_executable(&path) {
                resolved.insert(field.key.clone(), path.to_string_lossy().to_string());
                continue;
            }
        }

        resolved.insert(field.key.clone(), default.to_string());
    }

    resolved
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn detect_skips_when_path_already_set() {
        let mut paths = std::collections::HashMap::new();
        paths.insert("node_path".to_string(), "/custom/node".to_string());
        let detected = detect_missing_binary_paths("nodejs", &paths);
        assert!(detected.is_empty());
    }

    #[test]
    fn detect_returns_empty_for_unknown_environment() {
        let paths = std::collections::HashMap::new();
        let detected = detect_missing_binary_paths("unknown", &paths);
        assert!(detected.is_empty());
    }

    #[test]
    fn resolve_environment_paths_applies_default_command() {
        let paths = std::collections::HashMap::new();
        let resolved = resolve_environment_paths("express", &paths);
        if which::which("npm").is_ok() {
            assert!(resolved
                .get("npm_path")
                .map(|value| !value.is_empty())
                .unwrap_or(false));
        }
    }
}
