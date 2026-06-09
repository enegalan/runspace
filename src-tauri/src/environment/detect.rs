use std::path::{Path, PathBuf};

use super::catalog::binary_field_key;

struct BinaryProbe {
    command_names: &'static [&'static str],
    fallback_paths: &'static [&'static str],
}

fn probe_binary(probe: &BinaryProbe) -> Option<PathBuf> {
    for name in probe.command_names {
        if let Ok(path) = which::which(name) {
            if path.is_file() && is_executable(&path) {
                return Some(path);
            }
        }
    }

    for candidate in probe.fallback_paths {
        let path = PathBuf::from(candidate);
        if path.is_file() && is_executable(&path) {
            return Some(path);
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

fn probe_for_field(environment_id: &str, field_key: &str) -> Option<PathBuf> {
    let expected_key = binary_field_key(environment_id)?;
    if expected_key != field_key {
        return None;
    }

    let probe = match environment_id {
        "nodejs" => BinaryProbe {
            command_names: &["node"],
            fallback_paths: &[
                "/opt/homebrew/bin/node",
                "/usr/local/bin/node",
                "/usr/bin/node",
            ],
        },
        _ => return None,
    };

    probe_binary(&probe)
}

pub fn detect_missing_binary_paths(
    environment_id: &str,
    paths: &std::collections::HashMap<String, String>,
) -> std::collections::HashMap<String, String> {
    let mut detected = std::collections::HashMap::new();
    let Some(field_key) = binary_field_key(environment_id) else {
        return detected;
    };

    let already_set = paths
        .get(field_key)
        .map(|v| !v.trim().is_empty())
        .unwrap_or(false);
    if already_set {
        return detected;
    }

    if let Some(path) = probe_for_field(environment_id, field_key) {
        detected.insert(field_key.to_string(), path.to_string_lossy().to_string());
    }

    detected
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
}
