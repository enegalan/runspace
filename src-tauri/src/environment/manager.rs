use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;

use super::catalog::{binary_field_key, get_catalog, get_definition};
use super::detect::detect_missing_binary_paths;
use super::types::{
    Environment, EnvironmentDefinition, EnvironmentError, EnvironmentsStore,
    ResolvedEnvironment, ValidationResult,
};

const DEFAULT_SELECTED_ID: &str = "nodejs";

pub struct EnvironmentManager {
    config_path: PathBuf,
    store: EnvironmentsStore,
    versions: HashMap<String, String>,
}

impl EnvironmentManager {
    pub fn new(config_path: PathBuf) -> Result<Self, EnvironmentError> {
        let mut manager = Self {
            config_path,
            store: EnvironmentsStore {
                selected_environment_id: DEFAULT_SELECTED_ID.to_string(),
                installed_ids: vec![DEFAULT_SELECTED_ID.to_string()],
                configs: HashMap::new(),
            },
            versions: HashMap::new(),
        };
        manager.load()?;
        manager.autodetect_missing_paths()?;
        Ok(manager)
    }

    pub fn list_installed(&self) -> Vec<Environment> {
        self.store
            .installed_ids
            .iter()
            .filter_map(|id| get_definition(id))
            .map(|definition| self.build_environment(definition))
            .collect()
    }

    pub fn list_available(&self) -> Vec<EnvironmentDefinition> {
        get_catalog()
            .into_iter()
            .filter(|def| !self.store.installed_ids.contains(&def.id))
            .collect()
    }

    pub fn get_environment(&self, id: &str) -> Option<Environment> {
        if !self.is_installed(id) {
            return None;
        }
        get_definition(id).map(|definition| self.build_environment(definition))
    }

    pub fn get_selected(&self) -> Option<Environment> {
        self.get_environment(&self.store.selected_environment_id)
    }

    pub fn install(&mut self, id: &str) -> Result<(), EnvironmentError> {
        if get_definition(id).is_none() {
            return Err(EnvironmentError::NotFound(id.to_string()));
        }
        if self.is_installed(id) {
            return Ok(());
        }
        self.store.installed_ids.push(id.to_string());
        self.store.configs.entry(id.to_string()).or_default();
        self.autodetect_for_environment(id)?;
        self.save()
    }

    pub fn uninstall(&mut self, id: &str) -> Result<(), EnvironmentError> {
        if !self.is_installed(id) {
            return Err(EnvironmentError::NotInstalled(id.to_string()));
        }
        if self.store.installed_ids.len() <= 1 {
            return Err(EnvironmentError::InvalidConfig(
                "Cannot remove the last installed environment".to_string(),
            ));
        }

        self.store.installed_ids.retain(|installed_id| installed_id != id);
        self.store.configs.remove(id);
        self.versions.remove(id);

        if self.store.selected_environment_id == id {
            self.store.selected_environment_id = self
                .store
                .installed_ids
                .first()
                .cloned()
                .unwrap_or_else(|| DEFAULT_SELECTED_ID.to_string());
        }

        self.save()
    }

    pub fn set_selected(&mut self, id: &str) -> Result<(), EnvironmentError> {
        if get_definition(id).is_none() {
            return Err(EnvironmentError::NotFound(id.to_string()));
        }
        if !self.is_installed(id) {
            return Err(EnvironmentError::NotInstalled(id.to_string()));
        }
        self.store.selected_environment_id = id.to_string();
        self.save()
    }

    pub fn set_paths(
        &mut self,
        id: &str,
        paths: HashMap<String, String>,
    ) -> Result<(), EnvironmentError> {
        self.require_installed(id)?;
        let definition = get_definition(id).ok_or_else(|| EnvironmentError::NotFound(id.to_string()))?;
        validate_path_fields(&definition, &paths)?;
        let config = self.store.configs.entry(id.to_string()).or_default();
        config.paths = paths;
        self.save()
    }

    pub fn set_env_vars(
        &mut self,
        id: &str,
        env_vars: HashMap<String, String>,
    ) -> Result<(), EnvironmentError> {
        self.require_installed(id)?;
        if get_definition(id).is_none() {
            return Err(EnvironmentError::NotFound(id.to_string()));
        }
        validate_env_vars(&env_vars)?;
        let config = self.store.configs.entry(id.to_string()).or_default();
        config.env_vars = env_vars;
        self.save()
    }

    pub fn validate_environment(&mut self, id: &str) -> Result<ValidationResult, EnvironmentError> {
        self.require_installed(id)?;
        let definition = get_definition(id).ok_or_else(|| EnvironmentError::NotFound(id.to_string()))?;
        let user_config = self
            .store
            .configs
            .get(id)
            .cloned()
            .unwrap_or_default();

        let mut errors = Vec::new();
        let mut version: Option<String> = None;

        for field in &definition.config_fields {
            let path_value = user_config.paths.get(&field.key);
            match path_value {
                None if field.required => {
                    errors.push(format!("Missing required field: {}", field.label));
                }
                Some(path_str) if path_str.trim().is_empty() && field.required => {
                    errors.push(format!("Missing required field: {}", field.label));
                }
                Some(path_str) => {
                    if let Err(msg) = validate_path_value(path_str, &field.field_type, is_binary_field(&field.key)) {
                        errors.push(msg);
                    }
                }
                None => {}
            }
        }

        if errors.is_empty() && is_fully_configured(&definition, &user_config.paths) {
            if let Some(binary_key) = binary_field_key(id) {
                if let Some(binary_path) = user_config.paths.get(binary_key) {
                    match probe_version(id, binary_path) {
                        Ok(v) => {
                            version = Some(v.clone());
                            self.versions.insert(id.to_string(), v);
                        }
                        Err(msg) => errors.push(msg),
                    }
                }
            }
        }

        Ok(ValidationResult {
            valid: errors.is_empty(),
            version,
            errors,
        })
    }

    pub fn resolve_for_execution(&self, id: &str) -> Result<ResolvedEnvironment, EnvironmentError> {
        self.require_installed(id)?;
        let definition = get_definition(id).ok_or_else(|| EnvironmentError::NotFound(id.to_string()))?;
        let user_config = self
            .store
            .configs
            .get(id)
            .cloned()
            .unwrap_or_default();

        if !is_fully_configured(&definition, &user_config.paths) {
            return Err(EnvironmentError::NotConfigured(id.to_string()));
        }

        let binary_key = binary_field_key(id)
            .ok_or_else(|| EnvironmentError::InvalidConfig(format!("No binary field for {id}")))?;
        let binary_path = user_config
            .paths
            .get(binary_key)
            .cloned()
            .ok_or_else(|| EnvironmentError::NotConfigured(id.to_string()))?;

        let mut extra_paths = HashMap::new();
        for field in &definition.config_fields {
            if field.key != binary_key {
                if let Some(value) = user_config.paths.get(&field.key) {
                    extra_paths.insert(field.key.clone(), value.clone());
                }
            }
        }

        Ok(ResolvedEnvironment {
            id: id.to_string(),
            binary_path,
            env_vars: user_config.env_vars.clone(),
            extra_paths,
            entry_file: definition.entry_file.clone(),
            file_extension: definition.file_extension.clone(),
        })
    }

    pub fn save(&self) -> Result<(), EnvironmentError> {
        if let Some(parent) = self.config_path.parent() {
            fs::create_dir_all(parent)?;
        }
        let json = serde_json::to_string_pretty(&self.store)?;
        fs::write(&self.config_path, json)?;
        Ok(())
    }

    pub fn load(&mut self) -> Result<(), EnvironmentError> {
        if !self.config_path.exists() {
            return Ok(());
        }
        let content = fs::read_to_string(&self.config_path)?;
        let mut store: EnvironmentsStore = serde_json::from_str(&content)?;
        migrate_store(&mut store);
        self.store = store;
        Ok(())
    }

    fn autodetect_missing_paths(&mut self) -> Result<(), EnvironmentError> {
        let installed: Vec<String> = self.store.installed_ids.clone();
        let mut changed = false;

        for id in installed {
            if self.autodetect_for_environment(&id)? {
                changed = true;
            }
        }

        if changed {
            self.save()?;
        }

        Ok(())
    }

    fn autodetect_for_environment(&mut self, id: &str) -> Result<bool, EnvironmentError> {
        if !self.is_installed(id) || get_definition(id).is_none() {
            return Ok(false);
        }

        let config = self.store.configs.entry(id.to_string()).or_default();
        let detected = detect_missing_binary_paths(id, &config.paths);
        if detected.is_empty() {
            return Ok(false);
        }

        for (key, value) in detected {
            config.paths.insert(key, value);
        }

        Ok(true)
    }

    fn is_installed(&self, id: &str) -> bool {
        self.store.installed_ids.iter().any(|installed_id| installed_id == id)
    }

    fn require_installed(&self, id: &str) -> Result<(), EnvironmentError> {
        if !self.is_installed(id) {
            return Err(EnvironmentError::NotInstalled(id.to_string()));
        }
        Ok(())
    }

    fn build_environment(&self, definition: super::types::EnvironmentDefinition) -> Environment {
        let user_config = self
            .store
            .configs
            .get(&definition.id)
            .cloned()
            .unwrap_or_default();
        let configured = is_fully_configured(&definition, &user_config.paths);
        let version = self.versions.get(&definition.id).cloned();

        Environment {
            definition,
            user_config,
            configured,
            version,
        }
    }
}

fn migrate_store(store: &mut EnvironmentsStore) {
    store.installed_ids.retain(|id| get_definition(id).is_some());
    store.configs.retain(|id, _| get_definition(id).is_some());

    if !store.installed_ids.contains(&DEFAULT_SELECTED_ID.to_string()) {
        store.installed_ids.insert(0, DEFAULT_SELECTED_ID.to_string());
    }

    if store.installed_ids.is_empty() {
        store.installed_ids.push(DEFAULT_SELECTED_ID.to_string());
    }

    store
        .installed_ids
        .sort_by_key(|id| catalog_index(id));

    if !store.installed_ids.contains(&store.selected_environment_id) {
        store.selected_environment_id = store
            .installed_ids
            .first()
            .cloned()
            .unwrap_or_else(|| DEFAULT_SELECTED_ID.to_string());
    }
}

fn catalog_index(id: &str) -> usize {
    get_catalog()
        .iter()
        .position(|def| def.id == id)
        .unwrap_or(usize::MAX)
}

pub fn is_fully_configured(
    definition: &super::types::EnvironmentDefinition,
    paths: &HashMap<String, String>,
) -> bool {
    definition.config_fields.iter().all(|field| {
        if !field.required {
            return true;
        }
        paths
            .get(&field.key)
            .map(|v| !v.trim().is_empty())
            .unwrap_or(false)
    })
}

fn is_binary_field(key: &str) -> bool {
    key.ends_with("_path") && key != "project_path"
}

fn validate_path_fields(
    definition: &super::types::EnvironmentDefinition,
    paths: &HashMap<String, String>,
) -> Result<(), EnvironmentError> {
    for field in &definition.config_fields {
        if let Some(path_str) = paths.get(&field.key) {
            if !path_str.trim().is_empty() {
                validate_path_value(path_str, &field.field_type, is_binary_field(&field.key))
                    .map_err(EnvironmentError::ValidationFailed)?;
            }
        }
    }
    Ok(())
}

fn validate_path_value(
    path_str: &str,
    field_type: &super::types::ConfigFieldType,
    is_binary: bool,
) -> Result<(), String> {
    let path = Path::new(path_str);
    if !path.exists() {
        return Err(format!("Path does not exist: {path_str}"));
    }

    match field_type {
        super::types::ConfigFieldType::FilePath => {
            if !path.is_file() {
                return Err(format!("Not a file: {path_str}"));
            }
            if is_binary && !is_executable(path) {
                return Err(format!("Binary is not executable: {path_str}"));
            }
        }
        super::types::ConfigFieldType::DirectoryPath => {
            if !path.is_dir() {
                return Err(format!("Not a directory: {path_str}"));
            }
        }
        super::types::ConfigFieldType::Text => {}
    }

    Ok(())
}

#[cfg(unix)]
fn is_executable(path: &Path) -> bool {
    use std::os::unix::fs::PermissionsExt;
    fs::metadata(path)
        .map(|m| m.permissions().mode() & 0o111 != 0)
        .unwrap_or(false)
}

#[cfg(not(unix))]
fn is_executable(path: &Path) -> bool {
    path.is_file()
}

fn validate_env_vars(env_vars: &HashMap<String, String>) -> Result<(), EnvironmentError> {
    for key in env_vars.keys() {
        if key.trim().is_empty() {
            return Err(EnvironmentError::InvalidConfig(
                "Environment variable keys cannot be empty".to_string(),
            ));
        }
    }
    Ok(())
}

pub fn probe_version(environment_id: &str, binary_path: &str) -> Result<String, String> {
    let output = Command::new(binary_path)
        .arg("--version")
        .output()
        .map_err(|e| format!("Failed to run version probe: {e}"))?;

    if !output.status.success() && output.stdout.is_empty() {
        return Err(format!(
            "Version probe failed with exit code {:?}",
            output.status.code()
        ));
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let stderr = String::from_utf8_lossy(&output.stderr);
    let line = if stdout.trim().is_empty() {
        stderr.lines().next().unwrap_or("").trim()
    } else {
        stdout.lines().next().unwrap_or("").trim()
    };

    if line.is_empty() {
        return Err("Version probe returned empty output".to_string());
    }

    parse_version(environment_id, line).ok_or_else(|| format!("Could not parse version: {line}"))
}

pub fn parse_version(_environment_id: &str, line: &str) -> Option<String> {
    let trimmed = line.trim();
    if trimmed.is_empty() {
        return None;
    }

    extract_semver(trimmed).or(Some(trimmed.to_string()))
}

fn extract_semver(line: &str) -> Option<String> {
    for token in line.split_whitespace() {
        let cleaned = token.trim_start_matches('v');
        if cleaned.chars().next()?.is_ascii_digit() {
            return Some(cleaned.to_string());
        }
    }
    None
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::environment::catalog::get_definition;
    use std::collections::HashMap;

    #[test]
    fn parse_version_node() {
        assert_eq!(
            parse_version("nodejs", "v20.11.0"),
            Some("20.11.0".to_string())
        );
        assert_eq!(
            parse_version("nodejs", "v18.17.1"),
            Some("18.17.1".to_string())
        );
    }

    #[test]
    fn configured_flag_from_partial_paths() {
        let def = get_definition("nodejs").unwrap();
        let mut paths = HashMap::new();
        assert!(!is_fully_configured(&def, &paths));

        paths.insert("node_path".to_string(), "/usr/bin/node".to_string());
        assert!(is_fully_configured(&def, &paths));
    }

    #[test]
    fn install_and_uninstall_environment() {
        let temp_dir = std::env::temp_dir().join(format!(
            "runspace-install-test-{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_nanos()
        ));
        fs::create_dir_all(&temp_dir).unwrap();
        let config_path = temp_dir.join("environments.json");

        let mut manager = EnvironmentManager::new(config_path).unwrap();
        assert_eq!(manager.list_installed().len(), 1);
        assert_eq!(manager.list_available().len(), 5);

        let err = manager.install("unknown").unwrap_err();
        assert!(err.to_string().contains("not found"));

        let err = manager.uninstall("nodejs").unwrap_err();
        assert!(err.to_string().contains("last installed"));

        let _ = fs::remove_dir_all(&temp_dir);
    }

    #[test]
    fn resolve_includes_env_vars() {
        let temp_dir = std::env::temp_dir().join(format!(
            "runspace-env-test-{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_nanos()
        ));
        fs::create_dir_all(&temp_dir).unwrap();
        let config_path = temp_dir.join("environments.json");
        let fake_node = temp_dir.join("node");
        fs::write(&fake_node, "#!/bin/sh\necho v20.0.0\n").unwrap();
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            let mut perms = fs::metadata(&fake_node).unwrap().permissions();
            perms.set_mode(0o755);
            fs::set_permissions(&fake_node, perms).unwrap();
        }

        let mut manager = EnvironmentManager::new(config_path).unwrap();
        let mut paths = HashMap::new();
        paths.insert(
            "node_path".to_string(),
            fake_node.to_string_lossy().to_string(),
        );
        manager.set_paths("nodejs", paths).unwrap();

        let mut env_vars = HashMap::new();
        env_vars.insert("NODE_ENV".to_string(), "development".to_string());
        manager.set_env_vars("nodejs", env_vars).unwrap();

        let resolved = manager.resolve_for_execution("nodejs").unwrap();
        assert_eq!(
            resolved.env_vars.get("NODE_ENV"),
            Some(&"development".to_string())
        );
        assert_eq!(
            resolved.binary_path,
            fake_node.to_string_lossy().to_string()
        );

        let _ = fs::remove_dir_all(&temp_dir);
    }

    #[test]
    fn validation_rejects_missing_file() {
        let result = validate_path_value(
            "/nonexistent/path/to/binary",
            &super::super::types::ConfigFieldType::FilePath,
            true,
        );
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("does not exist"));
    }

    #[cfg(unix)]
    #[test]
    fn validation_rejects_non_executable_binary() {
        let temp_dir = std::env::temp_dir().join(format!(
            "runspace-exec-test-{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_nanos()
        ));
        fs::create_dir_all(&temp_dir).unwrap();
        let file_path = temp_dir.join("fake-node");
        fs::write(&file_path, "#!/bin/sh\necho test\n").unwrap();

        use std::os::unix::fs::PermissionsExt;
        let mut perms = fs::metadata(&file_path).unwrap().permissions();
        perms.set_mode(0o644);
        fs::set_permissions(&file_path, perms).unwrap();

        let result = validate_path_value(
            file_path.to_str().unwrap(),
            &super::super::types::ConfigFieldType::FilePath,
            true,
        );
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("not executable"));

        let _ = fs::remove_dir_all(&temp_dir);
    }
}
