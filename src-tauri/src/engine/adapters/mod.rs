#[cfg(test)]
mod integration;

mod framework;
mod gcc;
mod gpp;
mod laravel;
mod node;
mod php;
mod python;
mod ruby;
mod symfony;

use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::process::Command;

pub use framework::{ensure_skeleton, framework_terminal_env, FrameworkSkeletonError};

pub struct PrepareContext<'a> {
    pub workspace_path: &'a Path,
    pub snippet_path: &'a Path,
    pub extra_paths: &'a HashMap<String, String>,
}

pub struct PrepareResult {
    pub script_path: PathBuf,
    pub extra_env: HashMap<String, String>,
}

#[derive(Debug)]
pub enum AdapterError {
    Unsupported(String),
    Prepare(String),
    Framework(FrameworkSkeletonError),
}

impl std::fmt::Display for AdapterError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            AdapterError::Unsupported(id) => write!(f, "Unsupported environment: {id}"),
            AdapterError::Prepare(msg) => write!(f, "{msg}"),
            AdapterError::Framework(err) => write!(f, "{err}"),
        }
    }
}

pub trait CompiledAdapter: RuntimeAdapter {
    fn compile_command(&self, compiler: &Path, source: &Path, output: &Path) -> Command;
    fn output_binary_name(&self) -> &str {
        "runspace_out"
    }
}

pub trait RuntimeAdapter: Send + Sync {
    fn runtime_id(&self) -> &str;
    fn build_command(&self, binary: &Path, script: &Path) -> Command;
    fn prepare(&self, ctx: PrepareContext<'_>) -> Result<PrepareResult, AdapterError> {
        Ok(PrepareResult {
            script_path: ctx.snippet_path.to_path_buf(),
            extra_env: HashMap::new(),
        })
    }
}

pub fn get_adapter(environment_id: &str) -> Result<Box<dyn RuntimeAdapter>, AdapterError> {
    match environment_id {
        "nodejs" => Ok(Box::new(node::NodeAdapter)),
        "php" => Ok(Box::new(php::PhpAdapter)),
        "python" => Ok(Box::new(python::PythonAdapter)),
        "ruby" => Ok(Box::new(ruby::RubyAdapter)),
        "laravel" => Ok(Box::new(laravel::LaravelAdapter)),
        "symfony" => Ok(Box::new(symfony::SymfonyAdapter)),
        "gcc" => Ok(Box::new(gcc::GccAdapter)),
        "gpp" => Ok(Box::new(gpp::GppAdapter)),
        _ => Err(AdapterError::Unsupported(environment_id.to_string())),
    }
}

pub fn get_compiled_adapter(environment_id: &str) -> Option<Box<dyn CompiledAdapter>> {
    match environment_id {
        "gcc" => Some(Box::new(gcc::GccAdapter)),
        "gpp" => Some(Box::new(gpp::GppAdapter)),
        _ => None,
    }
}

pub fn is_compiled_environment(environment_id: &str) -> bool {
    matches!(environment_id, "gcc" | "gpp")
}

pub fn script_command(binary: &Path, script: &Path) -> Command {
    let mut cmd = Command::new(binary);
    cmd.arg(script);
    cmd
}

#[cfg(test)]
mod tests {
    use super::*;

    fn adapter_ids() -> Vec<&'static str> {
        vec![
            "nodejs", "php", "python", "ruby", "laravel", "symfony", "gcc", "gpp",
        ]
    }

    #[test]
    fn each_adapter_builds_binary_plus_script_arg() {
        let binary = PathBuf::from("/usr/bin/runtime");
        let script = PathBuf::from("/tmp/workspace/main.txt");

        for id in adapter_ids() {
            if is_compiled_environment(id) {
                continue;
            }
            let adapter = get_adapter(id).expect("adapter");
            let cmd = adapter.build_command(&binary, &script);
            let args: Vec<_> = cmd
                .get_args()
                .map(|arg| arg.to_string_lossy().to_string())
                .collect();
            assert_eq!(cmd.get_program(), binary, "{id} program");
            assert_eq!(args, vec![script.to_string_lossy().to_string()], "{id} args");
        }
    }
}
