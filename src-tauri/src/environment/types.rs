use std::collections::HashMap;

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum EnvironmentCategory {
    Language,
    Framework,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum ConfigFieldType {
    FilePath,
    DirectoryPath,
    Text,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DetectConfig {
    pub commands: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConfigField {
    pub key: String,
    pub label: String,
    pub field_type: ConfigFieldType,
    pub required: bool,
    #[serde(default)]
    pub primary: bool,
    #[serde(default)]
    pub detect: Option<DetectConfig>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnvironmentPresentation {
    pub accent: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnvironmentDefinition {
    pub id: String,
    pub name: String,
    pub category: EnvironmentCategory,
    pub file_extension: String,
    pub monaco_language: String,
    pub install_guide_url: String,
    pub config_fields: Vec<ConfigField>,
    #[serde(default)]
    pub presentation: Option<EnvironmentPresentation>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct EnvironmentUserConfig {
    pub paths: HashMap<String, String>,
    pub env_vars: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Environment {
    pub definition: EnvironmentDefinition,
    pub user_config: EnvironmentUserConfig,
    pub configured: bool,
    pub version: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct EnvironmentsStore {
    pub selected_environment_id: String,
    #[serde(default = "default_installed_ids")]
    pub installed_ids: Vec<String>,
    pub configs: HashMap<String, EnvironmentUserConfig>,
}

fn default_installed_ids() -> Vec<String> {
    vec![crate::environment::registry::default_environment_id()]
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationResult {
    pub valid: bool,
    pub version: Option<String>,
    pub errors: Vec<String>,
}

#[derive(Debug, Clone)]
pub struct ResolvedEnvironment {
    pub id: String,
    pub binary_path: String,
    pub env_vars: HashMap<String, String>,
    pub extra_paths: HashMap<String, String>,
}

#[derive(Debug)]
pub enum EnvironmentError {
    NotFound(String),
    NotConfigured(String),
    InvalidConfig(String),
    ValidationFailed(String),
    Io(std::io::Error),
    NotInstalled(String),
}

impl std::fmt::Display for EnvironmentError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            EnvironmentError::NotFound(id) => write!(f, "Environment not found: {id}"),
            EnvironmentError::NotConfigured(id) => {
                write!(
                    f,
                    "Environment not configured. Open Settings → Environments. ({id})"
                )
            }
            EnvironmentError::InvalidConfig(msg) => write!(f, "Invalid configuration: {msg}"),
            EnvironmentError::ValidationFailed(msg) => write!(f, "Validation failed: {msg}"),
            EnvironmentError::Io(e) => write!(f, "IO error: {e}"),
            EnvironmentError::NotInstalled(id) => {
                write!(f, "Environment is not installed: {id}")
            }
        }
    }
}

impl From<std::io::Error> for EnvironmentError {
    fn from(err: std::io::Error) -> Self {
        EnvironmentError::Io(err)
    }
}

impl From<serde_json::Error> for EnvironmentError {
    fn from(err: serde_json::Error) -> Self {
        EnvironmentError::InvalidConfig(err.to_string())
    }
}
