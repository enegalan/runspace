use std::path::{Path, PathBuf};

struct BinaryProbe {
    command_names: &'static [&'static str],
}

const NODE_PROBE: BinaryProbe = BinaryProbe {
    command_names: &["node"],
};

const PHP_PROBE: BinaryProbe = BinaryProbe {
    command_names: &["php"],
};

const PYTHON_PROBE: BinaryProbe = BinaryProbe {
    command_names: &["python3", "python"],
};

const RUBY_PROBE: BinaryProbe = BinaryProbe {
    command_names: &["ruby"],
};

const COMPOSER_PROBE: BinaryProbe = BinaryProbe {
    command_names: &["composer"],
};

const GCC_PROBE: BinaryProbe = BinaryProbe {
    command_names: &["gcc"],
};

const GPP_PROBE: BinaryProbe = BinaryProbe {
    command_names: &["g++", "c++"],
};

fn probe_binary(probe: &BinaryProbe) -> Option<PathBuf> {
    for name in probe.command_names {
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

fn probe_for_field(field_key: &str) -> Option<PathBuf> {
    let probe = match field_key {
        "node_path" => &NODE_PROBE,
        "php_path" => &PHP_PROBE,
        "python_path" => &PYTHON_PROBE,
        "ruby_path" => &RUBY_PROBE,
        "composer_path" => &COMPOSER_PROBE,
        "gcc_path" => &GCC_PROBE,
        "gpp_path" => &GPP_PROBE,
        _ => return None,
    };

    probe_binary(probe)
}

pub fn detect_missing_binary_paths(
    environment_id: &str,
    paths: &std::collections::HashMap<String, String>,
) -> std::collections::HashMap<String, String> {
    use super::catalog::{binary_field_key, get_definition};

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

        if field.key == "composer_path" {
            if let Some(path) = probe_for_field(&field.key) {
                detected.insert(field.key.clone(), path.to_string_lossy().to_string());
            }
            continue;
        }

        if Some(field.key.as_str()) == binary_field_key(environment_id) {
            if let Some(path) = probe_for_field(&field.key) {
                detected.insert(field.key.clone(), path.to_string_lossy().to_string());
            }
        }
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
