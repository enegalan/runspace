mod framework;
mod template;

use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::process::Command;

use crate::environment::manifest::{EnvironmentManifest, EnvironmentProfile};
use crate::environment::registry::get_manifest;

pub use framework::{framework_terminal_env, FrameworkSkeletonError};

pub struct PrepareContext<'a> {
    pub environment_id: &'a str,
    pub workspace_path: &'a Path,
    pub snippet_path: &'a Path,
    pub extra_paths: &'a HashMap<String, String>,
}

pub struct PrepareResult {
    pub script_path: PathBuf,
    pub extra_env: HashMap<String, String>,
}

#[derive(Debug)]
pub enum ProfileError {
    Unsupported(String),
    Prepare(String),
    Framework(FrameworkSkeletonError),
}

impl std::fmt::Display for ProfileError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ProfileError::Unsupported(id) => write!(f, "Unsupported environment: {id}"),
            ProfileError::Prepare(msg) => write!(f, "{msg}"),
            ProfileError::Framework(err) => write!(f, "{err}"),
        }
    }
}

pub fn is_compiled_environment(environment_id: &str) -> bool {
    get_manifest(environment_id)
        .map(|manifest| manifest.profile == EnvironmentProfile::Compiled)
        .unwrap_or(false)
}

pub fn is_framework_environment(environment_id: &str) -> bool {
    get_manifest(environment_id)
        .map(|manifest| manifest.profile == EnvironmentProfile::Framework)
        .unwrap_or(false)
}

pub fn require_manifest(
    environment_id: &str,
) -> Result<&'static EnvironmentManifest, ProfileError> {
    get_manifest(environment_id)
        .ok_or_else(|| ProfileError::Unsupported(environment_id.to_string()))
}

pub fn prepare(ctx: PrepareContext<'_>) -> Result<PrepareResult, ProfileError> {
    let manifest = require_manifest(ctx.environment_id)?;

    match manifest.profile {
        EnvironmentProfile::Script | EnvironmentProfile::Compiled => Ok(PrepareResult {
            script_path: ctx.snippet_path.to_path_buf(),
            extra_env: HashMap::new(),
        }),
        EnvironmentProfile::Framework => framework::prepare(manifest, ctx),
    }
}

pub fn build_run_command(
    manifest: &EnvironmentManifest,
    paths: &HashMap<String, String>,
    script_path: &Path,
    workspace_path: &Path,
) -> Result<Command, ProfileError> {
    let run = manifest
        .run
        .as_ref()
        .ok_or_else(|| ProfileError::Prepare(format!("{}: missing run spec", manifest.id)))?;

    let output_binary = workspace_path.join(manifest.output_binary_name());
    let context = template::TemplateContext {
        paths,
        entry_file: script_path,
        output_binary: &output_binary,
    };

    let program = template::resolve_path_template(&run.program, &context);
    let args = template::resolve_args(&run.args, &context);

    let mut command = Command::new(program);
    command.args(args);
    Ok(command)
}

pub fn build_compile_command(
    manifest: &EnvironmentManifest,
    paths: &HashMap<String, String>,
    source_path: &Path,
    workspace_path: &Path,
) -> Result<Command, ProfileError> {
    let compile = manifest
        .compile
        .as_ref()
        .ok_or_else(|| ProfileError::Prepare(format!("{}: missing compile spec", manifest.id)))?;

    let output_binary = workspace_path.join(manifest.output_binary_name());
    let context = template::TemplateContext {
        paths,
        entry_file: source_path,
        output_binary: &output_binary,
    };

    let program = template::resolve_path_template(&compile.program, &context);
    let args = template::resolve_args(&compile.args, &context);

    let mut command = Command::new(program);
    command.args(args);
    Ok(command)
}

pub fn ensure_framework_ready(
    environment_id: &str,
    extra_paths: &HashMap<String, String>,
) -> Result<PathBuf, FrameworkSkeletonError> {
    let manifest = get_manifest(environment_id).ok_or_else(|| {
        FrameworkSkeletonError::Copy(format!("Environment not found: {environment_id}"))
    })?;
    framework::ensure_framework_ready(manifest, extra_paths)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    #[test]
    fn script_profiles_build_binary_plus_entry_arg() {
        let registry =
            crate::environment::registry::EnvironmentRegistry::load_bundled().expect("registry");
        let binary = PathBuf::from("/usr/bin/runtime");
        let script = PathBuf::from("/tmp/workspace/main.txt");
        let workspace = PathBuf::from("/tmp/workspace");

        for id in registry.environment_ids() {
            let manifest = registry.get(&id).expect("manifest");
            if manifest.profile != EnvironmentProfile::Script {
                continue;
            }

            let primary_key = manifest
                .primary_binary_field_key()
                .expect("primary field")
                .to_string();
            let paths = HashMap::from([(primary_key, binary.to_string_lossy().to_string())]);

            let output_binary = workspace.join(manifest.output_binary_name());
            let context = template::TemplateContext {
                paths: &paths,
                entry_file: &script,
                output_binary: &output_binary,
            };
            let run = manifest.run.as_ref().expect("run spec");
            let expected_args = template::resolve_args(&run.args, &context);

            let command = build_run_command(manifest, &paths, &script, &workspace).expect("run");
            let args: Vec<_> = command
                .get_args()
                .map(|arg| arg.to_string_lossy().to_string())
                .collect();

            assert_eq!(
                command.get_program(),
                binary.as_os_str(),
                "{} program",
                manifest.id
            );
            assert_eq!(args, expected_args, "{} args", manifest.id);
        }
    }
}
