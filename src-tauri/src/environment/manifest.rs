use serde::{Deserialize, Serialize};

use super::types::{
    ConfigField, EnvironmentCategory, EnvironmentDefinition, EnvironmentPresentation,
};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum EnvironmentProfile {
    Script,
    Compiled,
    Framework,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VersionProbe {
    #[serde(default = "default_version_arg")]
    pub arg: String,
}

fn default_version_arg() -> String {
    "--version".to_string()
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RunSpec {
    pub program: String,
    pub args: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompileSpec {
    pub program: String,
    pub args: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DependencyInstallSpec {
    pub program: String,
    pub args: Vec<String>,
    pub vendor_marker: String,
    #[serde(default)]
    pub manifest_files: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SkeletonSpec {
    pub bundled_dir: String,
    #[serde(default = "default_sync_exclude_dirs")]
    pub sync_exclude_dirs: Vec<String>,
    #[serde(default)]
    pub sync_exclude_files: Vec<String>,
    #[serde(default)]
    pub dependency_install: Option<DependencyInstallSpec>,
}

fn default_sync_exclude_dirs() -> Vec<String> {
    vec!["vendor".to_string()]
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum PrepareSpec {
    WriteTemplate { output: String, template: String },
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum StepCwd {
    Skeleton,
    Workspace,
}

fn default_step_cwd() -> StepCwd {
    StepCwd::Skeleton
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum PostInstallStep {
    CreateEmptyFile {
        path: String,
    },
    CreateDir {
        path: String,
    },
    Run {
        program: String,
        args: Vec<String>,
        #[serde(default = "default_step_cwd")]
        cwd: StepCwd,
    },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TerminalEnvSpec {
    pub framework_root: String,
    pub workspace: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnvironmentManifest {
    pub id: String,
    pub name: String,
    pub category: EnvironmentCategory,
    pub file_extension: String,
    pub monaco_language: String,
    pub install_guide_url: String,
    pub config_fields: Vec<ConfigField>,
    pub profile: EnvironmentProfile,
    #[serde(default)]
    pub default: bool,
    #[serde(default)]
    pub presentation: Option<EnvironmentPresentation>,
    #[serde(default)]
    pub run: Option<RunSpec>,
    #[serde(default)]
    pub compile: Option<CompileSpec>,
    #[serde(default)]
    pub output_binary: Option<String>,
    #[serde(default)]
    pub skeleton: Option<SkeletonSpec>,
    #[serde(default)]
    pub prepare: Option<PrepareSpec>,
    #[serde(default)]
    pub post_install: Vec<PostInstallStep>,
    #[serde(default)]
    pub terminal_env: Option<TerminalEnvSpec>,
    #[serde(default)]
    pub version_probe: Option<VersionProbe>,
}

impl EnvironmentManifest {
    pub fn to_definition(&self) -> EnvironmentDefinition {
        EnvironmentDefinition {
            id: self.id.clone(),
            name: self.name.clone(),
            category: self.category.clone(),
            file_extension: self.file_extension.clone(),
            monaco_language: self.monaco_language.clone(),
            install_guide_url: self.install_guide_url.clone(),
            config_fields: self.config_fields.clone(),
            presentation: self.presentation.clone(),
        }
    }

    pub fn primary_binary_field_key(&self) -> Option<&str> {
        self.config_fields
            .iter()
            .find(|field| field.primary)
            .map(|field| field.key.as_str())
            .or_else(|| self.config_fields.first().map(|field| field.key.as_str()))
    }

    pub fn output_binary_name(&self) -> &str {
        self.output_binary
            .as_deref()
            .filter(|value| !value.trim().is_empty())
            .unwrap_or("runspace_out")
    }

    pub fn version_probe_arg(&self) -> &str {
        self.version_probe
            .as_ref()
            .map(|probe| probe.arg.as_str())
            .unwrap_or("--version")
    }
}
